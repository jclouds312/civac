/**
 * Scale Service Integration Hook
 * Connects React frontend to Python backend scale service
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// socket.io-client type stubs (optional peer dependency)
type Socket = {
  on: (event: string, cb: (...args: unknown[]) => void) => Socket;
  off: (event: string, cb?: (...args: unknown[]) => void) => Socket;
  emit: (event: string, ...args: unknown[]) => Socket;
  disconnect: () => void;
  connected: boolean;
};
type SocketOptions = { transports?: string[]; reconnection?: boolean; reconnectionDelay?: number; reconnectionDelayMax?: number; reconnectionAttempts?: number };
const io = (url: string, opts?: SocketOptions): Socket => {
  console.warn('[useScaleService] socket.io-client no está instalado; se mantiene el modo Bluetooth local.', url, opts);
  return { on: () => ({} as Socket), off: () => ({} as Socket), emit: () => ({} as Socket), disconnect: () => {}, connected: false };
};

interface UseScaleServiceOptions {
  apiUrl?: string;
  autoConnect?: boolean;
  deviceId?: string;
}

interface ScaleFrame {
  weight: number;
  stable: boolean;
  device_id: string;
  timestamp: number;
  trama_format: string;
}

export const useScaleService = (options: UseScaleServiceOptions = {}) => {
  const {
    apiUrl = 'http://localhost:5000',
    autoConnect = true,
    deviceId,
  } = options;

  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [currentWeight, setCurrentWeight] = useState<ScaleFrame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [browserBluetoothAvailable, setBrowserBluetoothAvailable] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setBrowserBluetoothAvailable(typeof navigator !== 'undefined' && 'bluetooth' in navigator);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Connected to Scale Service');
      setConnected(true);
      setError(null);

      if (deviceId) {
        socket.emit('subscribe_device', { device_id: deviceId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Scale Service');
      setConnected(false);
    });

    socket.on('weight_received', (data: ScaleFrame) => {
      setCurrentWeight(data);
    });

    socket.on('weight_data', (data: ScaleFrame) => {
      setCurrentWeight(data);
    });

    socket.on('error', (err: any) => {
      console.error('Socket error:', err);
      setError(typeof err === 'string' ? err : err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, autoConnect, deviceId]);

  // Fetch device list
  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/devices`);
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch devices';
      setError(message);
    }
  }, [apiUrl]);

  // Register new device
  const registerDevice = useCallback(
    async (deviceConfig: any) => {
      try {
        const response = await fetch(`${apiUrl}/api/devices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceConfig),
        });
        const data = await response.json();
        if (data.success) {
          await fetchDevices();
          return data.device;
        } else {
          setError(data.error);
          return null;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to register device';
        setError(message);
        return null;
      }
    },
    [apiUrl, fetchDevices]
  );

  // Disconnect device
  const disconnectDevice = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`${apiUrl}/api/devices/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          await fetchDevices();
        } else {
          setError(data.error);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to disconnect device';
        setError(message);
      }
    },
    [apiUrl, fetchDevices]
  );

  // Test trama parser
  const testTrama = useCallback(
    async (tramaFormat: string, testData: string) => {
      try {
        const response = await fetch(`${apiUrl}/api/tramas/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trama_format: tramaFormat,
            test_data: testData,
          }),
        });
        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to test trama';
        setError(message);
        return { success: false, error: message };
      }
    },
    [apiUrl]
  );

  // Subscribe to device updates
  const subscribeToDevice = useCallback((id: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe_device', { device_id: id });
    }
  }, []);

  // Request current weight
  const requestWeight = useCallback((id: string) => {
    if (socketRef.current) {
      socketRef.current.emit('request_weight', { device_id: id });
    }
  }, []);

  // Export configuration
  const exportConfig = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/config/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scale-config.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export config';
      setError(message);
    }
  }, [apiUrl]);

  return {
    connected,
    devices,
    currentWeight,
    error,
    fetchDevices,
    registerDevice,
    disconnectDevice,
    testTrama,
    subscribeToDevice,
    requestWeight,
    exportConfig,
    browserBluetoothAvailable,
  };
};
