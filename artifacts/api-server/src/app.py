#!/usr/bin/env python3
"""
Flask REST API for GanaderIA Scale Management System
Provides HTTP endpoints for scale configuration, device management, and data streaming
"""

from flask import Flask, request, jsonify, stream_with_context, Response
from flask_cors import CORS
import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional
import threading

from services.scale_service import (
    ScaleManager,
    ScaleDevice,
    TramaFormat,
    TramaParser,
    ScaleFrame,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)

# WebSockets are useful for a long-running local scale gateway, but Vercel
# Python functions should not initialize the SocketIO server on every cold
# start. Enable it explicitly for a persistent process with
# CIVAC_ENABLE_SOCKETIO=1.
if os.getenv("CIVAC_ENABLE_SOCKETIO") == "1":
    try:
        from flask_socketio import SocketIO, emit, join_room

        socketio = SocketIO(app, cors_allowed_origins="*")
    except ImportError:
        socketio = None

        def emit(*_args, **_kwargs):
            return None

        def join_room(*_args, **_kwargs):
            return None
else:
    class _DisabledSocketIO:
        def on(self, *_args, **_kwargs):
            return lambda function: function

        def emit(self, *_args, **_kwargs):
            return None

    socketio = _DisabledSocketIO()

    def emit(*_args, **_kwargs):
        return None

    def join_room(*_args, **_kwargs):
        return None

# Global scale manager
scale_manager = ScaleManager()

# Store connected client rooms
connected_clients: Dict[str, List[str]] = {}


# ============================================================================
# DEVICE MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/devices', methods=['GET'])
def list_devices():
    """
    GET /api/devices
    List all connected scale devices
    """
    try:
        devices = scale_manager.list_devices()
        return jsonify({
            'success': True,
            'count': len(devices),
            'devices': devices,
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        logger.error(f"Error listing devices: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/devices', methods=['POST'])
def register_device():
    """
    POST /api/devices
    Register and connect a new scale device
    
    Request body:
    {
        "device_id": "scale-1",
        "port": "/dev/ttyUSB0",
        "baud_rate": 9600,
        "trama_format": "civac_9b"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['device_id', 'port']
        if not all(k in data for k in required):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Create device
        device = ScaleDevice(
            device_id=data['device_id'],
            port=data['port'],
            baud_rate=data.get('baud_rate', 9600),
            data_bits=data.get('data_bits', 8),
            stop_bits=data.get('stop_bits', 1),
            parity=data.get('parity', 'N'),
            trama_format=data.get('trama_format', 'civac_9b'),
        )
        
        # Setup callback to broadcast frames
        def on_frame(frame: ScaleFrame):
            socketio.emit('weight_received', {
                'device_id': frame.device_id,
                'weight': frame.weight,
                'stable': frame.stable,
                'timestamp': frame.timestamp,
                'trama_format': frame.trama_format,
            }, room=frame.device_id)
        
        device.on_frame_callback = on_frame
        
        # Add to manager
        if scale_manager.add_device(device):
            return jsonify({
                'success': True,
                'message': f'Device {data["device_id"]} connected',
                'device': device.to_dict(),
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to connect to {data["port"]}'
            }), 400
    
    except Exception as e:
        logger.error(f"Error registering device: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/devices/<device_id>', methods=['GET'])
def get_device(device_id: str):
    """
    GET /api/devices/{device_id}
    Get device details and status
    """
    try:
        device = scale_manager.get_device(device_id)
        if not device:
            return jsonify({'success': False, 'error': 'Device not found'}), 404
        
        return jsonify({
            'success': True,
            'device': device.to_dict(),
        })
    except Exception as e:
        logger.error(f"Error getting device: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/devices/<device_id>', methods=['DELETE'])
def disconnect_device(device_id: str):
    """
    DELETE /api/devices/{device_id}
    Disconnect and remove a device
    """
    try:
        if scale_manager.remove_device(device_id):
            return jsonify({
                'success': True,
                'message': f'Device {device_id} disconnected',
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Device not found'
            }), 404
    except Exception as e:
        logger.error(f"Error removing device: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# WEIGHT DATA ENDPOINTS
# ============================================================================

@app.route('/api/devices/<device_id>/weight', methods=['GET'])
def get_last_weight(device_id: str):
    """
    GET /api/devices/{device_id}/weight
    Get last received weight from device
    """
    try:
        frame = scale_manager.get_weight(device_id)
        if not frame:
            return jsonify({
                'success': False,
                'error': 'No weight data received',
            }), 404
        
        return jsonify({
            'success': True,
            'weight': frame.weight,
            'stable': frame.stable,
            'timestamp': frame.timestamp,
            'device_id': frame.device_id,
            'trama_format': frame.trama_format,
        })
    except Exception as e:
        logger.error(f"Error getting weight: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# TRAMA PARSING ENDPOINTS
# ============================================================================

@app.route('/api/tramas/test', methods=['POST'])
def test_trama():
    """
    POST /api/tramas/test
    Test a trama parser with sample data
    
    Request body:
    {
        "trama_format": "civac_9b",
        "test_data": "I    320s!    450s",
        "device_id": "test-device"
    }
    """
    try:
        data = request.get_json()
        
        trama_format = data.get('trama_format', 'generic_line')
        test_data = data.get('test_data', '')
        device_id = data.get('device_id', 'test')
        
        if not test_data:
            return jsonify({'success': False, 'error': 'No test data provided'}), 400
        
        parser = TramaParser()
        frames = []
        
        if trama_format == TramaFormat.CIVAC_9B.value:
            frames = parser.parse_civac_9b(test_data, device_id)
        elif trama_format == TramaFormat.TOLEDO_SCS.value:
            frames = parser.parse_toledo_scs(test_data, device_id)
        elif trama_format == TramaFormat.SEMA_CO.value:
            frames = parser.parse_sema_co(test_data, device_id)
        else:
            frames = parser.parse_generic(test_data, device_id)
        
        return jsonify({
            'success': True,
            'trama_format': trama_format,
            'frames_parsed': len(frames),
            'frames': [f.to_dict() for f in frames],
        })
    
    except Exception as e:
        logger.error(f"Error testing trama: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/tramas/custom-test', methods=['POST'])
def test_custom_trama():
    """
    POST /api/tramas/custom-test
    Test a custom regex trama parser
    
    Request body:
    {
        "regex": "([0-9]{2,4}\\.?\\d{0,2})",
        "test_data": "Weight: 450.5 kg",
        "device_id": "test-device"
    }
    """
    try:
        data = request.get_json()
        
        regex = data.get('regex', '')
        test_data = data.get('test_data', '')
        device_id = data.get('device_id', 'test')
        
        if not regex or not test_data:
            return jsonify({
                'success': False,
                'error': 'Missing regex or test_data'
            }), 400
        
        parser = TramaParser()
        frames = parser.parse_custom_regex(test_data, device_id, regex)
        
        return jsonify({
            'success': True,
            'regex': regex,
            'frames_parsed': len(frames),
            'frames': [f.to_dict() for f in frames],
        })
    
    except Exception as e:
        logger.error(f"Error testing custom trama: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# CONFIGURATION ENDPOINTS
# ============================================================================

@app.route('/api/config/export', methods=['GET'])
def export_config():
    """
    GET /api/config/export
    Export all device configurations as JSON
    """
    try:
        devices = scale_manager.list_devices()
        config = {
            'export_date': datetime.now().isoformat(),
            'version': '1.0',
            'devices': devices,
        }
        
        return Response(
            json.dumps(config, indent=2),
            mimetype='application/json',
            headers={'Content-Disposition': 'attachment; filename=scale-config.json'}
        )
    except Exception as e:
        logger.error(f"Error exporting config: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/import', methods=['POST'])
def import_config():
    """
    POST /api/config/import
    Import device configurations from JSON
    
    Send multipart form with 'file' field containing JSON
    """
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        config = json.load(file)
        
        imported_count = 0
        errors = []
        
        for dev_data in config.get('devices', []):
            try:
                device = ScaleDevice(
                    device_id=dev_data['device_id'],
                    port=dev_data['port'],
                    baud_rate=dev_data.get('baud_rate', 9600),
                )
                if scale_manager.add_device(device):
                    imported_count += 1
                else:
                    errors.append(f"Failed to connect {dev_data['device_id']}")
            except Exception as e:
                errors.append(f"Error importing {dev_data.get('device_id', 'unknown')}: {str(e)}")
        
        return jsonify({
            'success': True,
            'imported': imported_count,
            'errors': errors,
        })
    
    except Exception as e:
        logger.error(f"Error importing config: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# WEBSOCKET EVENTS (Real-time updates)
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client WebSocket connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connection_response', {
        'data': 'Connected to GanaderIA Scale Service',
        'timestamp': datetime.now().isoformat(),
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client WebSocket disconnection"""
    logger.info(f"Client disconnected: {request.sid}")


@socketio.on('subscribe_device')
def handle_subscribe(data):
    """
    Subscribe to weight updates from a specific device
    
    Client sends: {'device_id': 'scale-1'}
    """
    device_id = data.get('device_id')
    if device_id:
        join_room(device_id)
        emit('subscribed', {
            'device_id': device_id,
            'message': f'Subscribed to {device_id}',
            'timestamp': datetime.now().isoformat(),
        })
        logger.info(f"Client {request.sid} subscribed to {device_id}")


@socketio.on('request_weight')
def handle_weight_request(data):
    """
    Request current weight from a device
    
    Client sends: {'device_id': 'scale-1'}
    """
    device_id = data.get('device_id')
    if device_id:
        frame = scale_manager.get_weight(device_id)
        if frame:
            emit('weight_data', frame.to_dict())
        else:
            emit('weight_error', {'error': 'No data available'})


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    GET /api/health
    API health check endpoint
    """
    devices = scale_manager.list_devices()
    connected_count = sum(1 for d in devices if d['is_connected'])
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'total_devices': len(devices),
        'connected_devices': connected_count,
    })


@app.route('/api/status', methods=['GET'])
def status():
    """
    GET /api/status
    Get detailed system status
    """
    try:
        devices = scale_manager.list_devices()
        
        return jsonify({
            'success': True,
            'system': {
                'total_devices': len(devices),
                'connected_devices': sum(1 for d in devices if d['is_connected']),
                'timestamp': datetime.now().isoformat(),
            },
            'devices': devices,
        })
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
    }), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"Server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
    }), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("Starting GanaderIA Scale Service API...")
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False,
    )
