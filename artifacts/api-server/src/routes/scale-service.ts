/**
 * Scale Device Communication Service
 * Handles serial/BT/WiFi communication with livestock scales
 */

import express, { Router, Request, Response } from 'express';
import { EventEmitter } from 'events';

interface ScaleFrame {
  weight: number;
  stable: boolean;
  raw: string;
  timestamp: number;
  deviceId: string;
}

interface ScaleDevice {
  id: string;
  type: 'serial' | 'bluetooth' | 'wifi';
  port?: string;
  address?: string;
  baudRate?: number;
  isConnected: boolean;
}

class ScaleService extends EventEmitter {
  private devices: Map<string, ScaleDevice> = new Map();
  private frameBuffer: Map<string, string> = new Map();
  private lastFrames: Map<string, ScaleFrame> = new Map();

  constructor() {
    super();
  }

  /**
   * Register a scale device
   */
  registerDevice(device: ScaleDevice): void {
    this.devices.set(device.id, device);
    this.frameBuffer.set(device.id, '');
    this.emit('device:registered', device);
  }

  /**
   * Parse CIVAC 9-byte frame format
   */
  parseCIVAC9B(buffer: string): ScaleFrame[] {
    const frames: ScaleFrame[] = [];
    for (let i = 0; i <= buffer.length - 9; i++) {
      const ch = buffer[i];
      if (ch === 'I' || ch === '!') {
        const ws = buffer.slice(i + 1, i + 8);
        const u = buffer[i + 8];
        if (u === 's' || u === 'S' || u === 'k' || u === 'K') {
          const w = parseFloat(ws.trim());
          if (!isNaN(w) && w >= 0 && w < 3000) {
            frames.push({
              weight: w,
              stable: ch === '!',
              raw: buffer.slice(i, i + 9),
              timestamp: Date.now(),
              deviceId: '',
            });
            i += 8;
          }
        }
      }
    }
    return frames;
  }

  /**
   * Parse Toledo/Mettler SCS format
   */
  parseToledoSCS(buffer: string): ScaleFrame[] {
    const frames: ScaleFrame[] = [];
    buffer.split(/\r?\n/).forEach(line => {
      const m = line.match(/^S\s+(S|D)\s+([\s\d.]+)\s*(?:kg)?/i);
      if (m) {
        const w = parseFloat(m[2].trim());
        if (!isNaN(w) && w > 0) {
          frames.push({
            weight: w,
            stable: m[1].toUpperCase() === 'S',
            raw: line,
            timestamp: Date.now(),
            deviceId: '',
          });
        }
      }
    });
    return frames;
  }

  /**
   * Process incoming data from device
   */
  processData(deviceId: string, data: string, tramaFormat: string): ScaleFrame[] {
    const device = this.devices.get(deviceId);
    if (!device) return [];

    let buffer = (this.frameBuffer.get(deviceId) || '') + data;
    if (buffer.length > 4096) buffer = buffer.slice(-2048);

    let frames: ScaleFrame[] = [];

    switch (tramaFormat) {
      case 'civac_9b':
        frames = this.parseCIVAC9B(buffer);
        break;
      case 'toledo_scs':
        frames = this.parseToledoSCS(buffer);
        break;
      default:
        frames = this.parseGeneric(buffer);
    }

    if (frames.length > 0) {
      const lastFrame = frames[frames.length - 1];
      lastFrame.deviceId = deviceId;
      this.lastFrames.set(deviceId, lastFrame);

      const lastPos = buffer.lastIndexOf(lastFrame.raw);
      if (lastPos >= 0) {
        buffer = buffer.slice(lastPos + lastFrame.raw.length);
      }

      this.frameBuffer.set(deviceId, buffer);
      this.emit('frame:received', lastFrame);
    }

    return frames;
  }

  /**
   * Parse generic weight format
   */
  private parseGeneric(buffer: string): ScaleFrame[] {
    const frames: ScaleFrame[] = [];
    buffer.split(/\r?\n/).forEach(line => {
      const m = line.match(/([0-9]{2,4}\.?\d{0,2})/);
      if (m) {
        const w = parseFloat(m[1]);
        if (w > 50 && w < 3000) {
          frames.push({
            weight: w,
            stable: false,
            raw: line,
            timestamp: Date.now(),
            deviceId: '',
          });
        }
      }
    });
    return frames;
  }

  /**
   * Get last frame from device
   */
  getLastFrame(deviceId: string): ScaleFrame | undefined {
    return this.lastFrames.get(deviceId);
  }

  /**
   * Get device status
   */
  getDeviceStatus(deviceId: string) {
    return this.devices.get(deviceId);
  }

  /**
   * List all devices
   */
  listDevices(): ScaleDevice[] {
    return Array.from(this.devices.values());
  }
}

// Singleton instance
const scaleService = new ScaleService();

/**
 * Create Express router for scale service
 */
export function createScaleRouter(): Router {
  const router = express.Router();

  // Register device
  router.post('/devices', (req: Request, res: Response) => {
    try {
      const device = req.body as ScaleDevice;
      device.isConnected = true;
      scaleService.registerDevice(device);
      res.json({ success: true, device });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  });

  // Get device status
  router.get('/devices/:id/status', (req: Request, res: Response) => {
    const status = scaleService.getDeviceStatus(String(req.params.id));
    if (!status) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(status);
  });

  // Get last weight
  router.get('/devices/:id/weight', (req: Request, res: Response) => {
    const frame = scaleService.getLastFrame(String(req.params.id));
    if (!frame) {
      return res.status(404).json({ error: 'No data' });
    }
    res.json(frame);
  });

  // Process incoming data
  router.post('/devices/:id/data', (req: Request, res: Response) => {
    try {
      const { data, tramaFormat } = req.body;
      const frames = scaleService.processData(String(req.params.id), data, tramaFormat || 'civac_9b');
      res.json({ frames, lastFrame: scaleService.getLastFrame(String(req.params.id)) });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  });

  // List devices
  router.get('/devices', (req: Request, res: Response) => {
    res.json(scaleService.listDevices());
  });

  return router;
}

export { ScaleService, scaleService };
