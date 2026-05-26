#!/usr/bin/env python3
"""
Scale Device Communication Service - Python Backend
Handles serial/Bluetooth/WiFi communication with livestock scales
"""

import serial
import threading
import json
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Callable
from enum import Enum
from dataclasses import dataclass, asdict
from queue import Queue
import time

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class TramaFormat(Enum):
    """Supported trama formats for livestock scales"""
    CIVAC_9B = "civac_9b"  # Colombia standard
    TOLEDO_SCS = "toledo_scs"  # Mettler Toledo
    SEMA_CO = "sema_co"  # SEMA Colombia
    RUDDWEIGH = "ruddweigh"  # Ruddweigh format
    GENERIC = "generic_line"  # Generic weight format


@dataclass
class ScaleFrame:
    """Parsed weight frame from scale"""
    weight: float
    stable: bool
    raw: str
    timestamp: float
    device_id: str
    trama_format: str

    def to_dict(self):
        return asdict(self)


@dataclass
class ScaleDevice:
    """Scale device configuration"""
    id: str
    device_type: str  # 'serial', 'bluetooth', 'wifi'
    port: Optional[str] = None  # COM3, /dev/ttyUSB0, etc.
    address: Optional[str] = None  # Bluetooth MAC or IP
    baud_rate: int = 9600
    data_bits: int = 8
    stop_bits: int = 1
    parity: str = 'N'  # None, Even, Odd
    is_connected: bool = False
    last_frame: Optional[ScaleFrame] = None


class TramaParser:
    """Parse weight data from various scale formats"""

    @staticmethod
    def parse_civac_9b(buffer: str, device_id: str) -> List[ScaleFrame]:
        """
        Parse CIVAC 9-byte format (Colombia standard)
        Format: [Estado 1B][Peso 7B][Unidad 1B]
        Estado: 'I'=unstable, '!'=stable
        Unidad: 's'=kg
        """
        frames = []
        i = 0
        while i <= len(buffer) - 9:
            ch = buffer[i]
            if ch in ('I', '!'):
                ws = buffer[i+1:i+8].strip()
                u = buffer[i+8]
                if u in ('s', 'S', 'k', 'K'):
                    try:
                        weight = float(ws)
                        if 0 <= weight < 3000:
                            frames.append(ScaleFrame(
                                weight=weight,
                                stable=(ch == '!'),
                                raw=buffer[i:i+9],
                                timestamp=time.time(),
                                device_id=device_id,
                                trama_format=TramaFormat.CIVAC_9B.value
                            ))
                            i += 8
                    except ValueError:
                        pass
            i += 1
        return frames

    @staticmethod
    def parse_toledo_scs(buffer: str, device_id: str) -> List[ScaleFrame]:
        """
        Parse Toledo/Mettler SCS format
        Format: S S [weight] kg = stable
        Format: S D [weight] kg = dynamic
        """
        frames = []
        for line in buffer.split('\n'):
            match = re.match(r'^S\s+(S|D)\s+([\s\d.]+)\s*(?:kg)?', line, re.IGNORECASE)
            if match:
                try:
                    weight = float(match.group(2).strip())
                    if weight > 0:
                        frames.append(ScaleFrame(
                            weight=weight,
                            stable=(match.group(1).upper() == 'S'),
                            raw=line,
                            timestamp=time.time(),
                            device_id=device_id,
                            trama_format=TramaFormat.TOLEDO_SCS.value
                        ))
                except ValueError:
                    pass
        return frames

    @staticmethod
    def parse_sema_co(buffer: str, device_id: str) -> List[ScaleFrame]:
        """
        Parse SEMA Báscula Colombia format
        Format: [weight]Kg or [weight]KG per line
        """
        frames = []
        for line in buffer.split('\n'):
            match = re.search(r'([0-9]{2,4}\.?\d{0,2})\s*(?:Kg|KG|kg)', line)
            if match:
                try:
                    weight = float(match.group(1))
                    if 10 < weight < 3000:
                        frames.append(ScaleFrame(
                            weight=weight,
                            stable=True,
                            raw=line,
                            timestamp=time.time(),
                            device_id=device_id,
                            trama_format=TramaFormat.SEMA_CO.value
                        ))
                except ValueError:
                    pass
        return frames

    @staticmethod
    def parse_generic(buffer: str, device_id: str) -> List[ScaleFrame]:
        """
        Generic parser - detects any number >50 per line
        """
        frames = []
        for line in buffer.split('\n'):
            match = re.search(r'([0-9]{2,4}\.?\d{0,2})', line)
            if match:
                try:
                    weight = float(match.group(1))
                    if 50 < weight < 3000:
                        frames.append(ScaleFrame(
                            weight=weight,
                            stable=False,
                            raw=line,
                            timestamp=time.time(),
                            device_id=device_id,
                            trama_format=TramaFormat.GENERIC.value
                        ))
                except ValueError:
                    pass
        return frames

    @staticmethod
    def parse_custom_regex(buffer: str, device_id: str, regex: str) -> List[ScaleFrame]:
        """
        Parse using custom regex pattern
        """
        frames = []
        try:
            pattern = re.compile(regex, re.IGNORECASE)
            for line in buffer.split('\n'):
                match = pattern.search(line)
                if match and len(match.groups()) > 0:
                    try:
                        weight = float(match.group(1))
                        if 0 < weight < 3000:
                            frames.append(ScaleFrame(
                                weight=weight,
                                stable=False,
                                raw=line,
                                timestamp=time.time(),
                                device_id=device_id,
                                trama_format='custom_regex'
                            ))
                    except (ValueError, IndexError):
                        pass
        except re.error as e:
            logger.error(f"Invalid regex: {e}")
        return frames


class ScaleDevice:
    """Serial scale device handler"""

    def __init__(
        self,
        device_id: str,
        port: str,
        baud_rate: int = 9600,
        data_bits: int = 8,
        stop_bits: int = 1,
        parity: str = 'N',
        trama_format: str = 'civac_9b'
    ):
        self.device_id = device_id
        self.port = port
        self.baud_rate = baud_rate
        self.data_bits = data_bits
        self.stop_bits = stop_bits
        self.parity = parity
        self.trama_format = trama_format
        self.is_connected = False
        self.serial_conn = None
        self.buffer = ""
        self.last_frame: Optional[ScaleFrame] = None
        self.frame_queue: Queue = Queue()
        self.read_thread: Optional[threading.Thread] = None
        self.on_frame_callback: Optional[Callable[[ScaleFrame], None]] = None

    def connect(self) -> bool:
        """Connect to serial device"""
        try:
            parity_map = {'N': serial.PARITY_NONE, 'E': serial.PARITY_EVEN, 'O': serial.PARITY_ODD}
            self.serial_conn = serial.Serial(
                port=self.port,
                baudrate=self.baud_rate,
                bytesize=self.data_bits,
                stopbits=self.stop_bits,
                parity=parity_map.get(self.parity, serial.PARITY_NONE),
                timeout=1
            )
            self.is_connected = True
            self.read_thread = threading.Thread(target=self._read_loop, daemon=True)
            self.read_thread.start()
            logger.info(f"Connected to {self.device_id} on {self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to {self.port}: {e}")
            return False

    def disconnect(self) -> None:
        """Disconnect from serial device"""
        self.is_connected = False
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
        logger.info(f"Disconnected from {self.device_id}")

    def _read_loop(self) -> None:
        """Read data from serial port in background"""
        while self.is_connected and self.serial_conn:
            try:
                if self.serial_conn.in_waiting > 0:
                    data = self.serial_conn.read(self.serial_conn.in_waiting).decode('ascii', errors='ignore')
                    self.buffer += data

                    # Limit buffer size
                    if len(self.buffer) > 4096:
                        self.buffer = self.buffer[-2048:]

                    # Parse frames based on trama format
                    frames = self._parse_frames()
                    for frame in frames:
                        self.last_frame = frame
                        self.frame_queue.put(frame)
                        if self.on_frame_callback:
                            self.on_frame_callback(frame)
            except Exception as e:
                logger.error(f"Error reading from {self.device_id}: {e}")
                self.is_connected = False

    def _parse_frames(self) -> List[ScaleFrame]:
        """Parse frames from buffer"""
        frames = []
        parser = TramaParser()

        if self.trama_format == TramaFormat.CIVAC_9B.value:
            frames = parser.parse_civac_9b(self.buffer, self.device_id)
        elif self.trama_format == TramaFormat.TOLEDO_SCS.value:
            frames = parser.parse_toledo_scs(self.buffer, self.device_id)
        elif self.trama_format == TramaFormat.SEMA_CO.value:
            frames = parser.parse_sema_co(self.buffer, self.device_id)
        else:
            frames = parser.parse_generic(self.buffer, self.device_id)

        # Clear buffer after parsing
        if frames:
            last_raw = frames[-1].raw
            pos = self.buffer.rfind(last_raw)
            if pos >= 0:
                self.buffer = self.buffer[pos + len(last_raw):]

        return frames

    def get_last_weight(self) -> Optional[ScaleFrame]:
        """Get last received weight frame"""
        return self.last_frame

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'device_id': self.device_id,
            'port': self.port,
            'baud_rate': self.baud_rate,
            'is_connected': self.is_connected,
            'last_frame': self.last_frame.to_dict() if self.last_frame else None,
        }


class ScaleManager:
    """Manage multiple scale devices"""

    def __init__(self):
        self.devices: Dict[str, ScaleDevice] = {}

    def add_device(self, device: ScaleDevice) -> bool:
        """Add and connect a device"""
        if device.connect():
            self.devices[device.device_id] = device
            return True
        return False

    def remove_device(self, device_id: str) -> bool:
        """Disconnect and remove a device"""
        if device_id in self.devices:
            self.devices[device_id].disconnect()
            del self.devices[device_id]
            return True
        return False

    def get_device(self, device_id: str) -> Optional[ScaleDevice]:
        """Get device by ID"""
        return self.devices.get(device_id)

    def list_devices(self) -> List[Dict]:
        """List all devices"""
        return [device.to_dict() for device in self.devices.values()]

    def get_weight(self, device_id: str) -> Optional[ScaleFrame]:
        """Get last weight from device"""
        device = self.get_device(device_id)
        return device.get_last_weight() if device else None

    def export_config(self, filepath: str) -> None:
        """Export all device configurations to JSON"""
        config = {
            'export_date': datetime.now().isoformat(),
            'devices': [device.to_dict() for device in self.devices.values()]
        }
        with open(filepath, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f"Exported config to {filepath}")

    def import_config(self, filepath: str) -> None:
        """Import device configurations from JSON"""
        try:
            with open(filepath, 'r') as f:
                config = json.load(f)
            # Recreate devices from config
            for dev_data in config.get('devices', []):
                device = ScaleDevice(
                    device_id=dev_data['device_id'],
                    port=dev_data['port'],
                    baud_rate=dev_data.get('baud_rate', 9600)
                )
                self.add_device(device)
            logger.info(f"Imported config from {filepath}")
        except Exception as e:
            logger.error(f"Failed to import config: {e}")


if __name__ == "__main__":
    # Example usage
    manager = ScaleManager()

    # Create and add device
    device = ScaleDevice(
        device_id="scale-1",
        port="/dev/ttyUSB0",
        baud_rate=9600,
        trama_format=TramaFormat.CIVAC_9B.value
    )

    # Set callback for new frames
    def on_weight(frame: ScaleFrame):
        print(f"[{frame.device_id}] {frame.weight} kg - Stable: {frame.stable}")

    device.on_frame_callback = on_weight

    if manager.add_device(device):
        print("Device connected")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            manager.remove_device(device.device_id)
