/**
 * Version Controller - Manages server versioning and deployment states
 */

import { Pool } from 'pg';
import { Request, Response } from 'express';

export interface ServerVersion {
  id: string;
  version: string;
  releaseDate: Date;
  status: 'stable' | 'beta' | 'deprecated';
  features: string[];
  minClientVersion: string;
  deprecationDate?: Date;
}

export class VersionController {
  private currentVersion = '1.0.0';
  private versions: Map<string, ServerVersion> = new Map();

  constructor(private pool: Pool) {
    this.initializeVersions();
  }

  private async initializeVersions() {
    const result = await this.pool.query('SELECT * FROM server_versions ORDER BY released_at DESC');
    result.rows.forEach(row => {
      this.versions.set(row.version, {
        id: row.id,
        version: row.version,
        releaseDate: row.released_at,
        status: row.status,
        features: row.features,
        minClientVersion: row.min_client_version,
        deprecationDate: row.deprecation_date,
      });
    });
  }

  async getCurrentVersion(): Promise<ServerVersion> {
    return this.versions.get(this.currentVersion)!;
  }

  async getVersionInfo(req: Request, res: Response): Promise<void> {
    try {
      const version = await this.getCurrentVersion();
      res.json({
        version: version.version,
        status: version.status,
        features: version.features,
        api: {
          endpoints: [
            'POST /api/auth/signup',
            'POST /api/auth/login',
            'GET /api/gps/dispositivos',
            'POST /api/trama',
            'GET /api/marketplace/listings',
          ],
        },
        deploymentInfo: {
          region: process.env.REGION || 'us-east-1',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch version info' });
    }
  }

  async checkClientCompatibility(clientVersion: string): Promise<boolean> {
    const current = await this.getCurrentVersion();
    return this.compareVersions(clientVersion, current.minClientVersion) >= 0;
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    return 0;
  }

  async releaseNewVersion(
    version: string,
    features: string[],
    minClientVersion: string
  ): Promise<ServerVersion> {
    const id = `v_${Date.now()}`;
    const newVersion: ServerVersion = {
      id,
      version,
      releaseDate: new Date(),
      status: 'beta',
      features,
      minClientVersion,
    };

    await this.pool.query(
      `INSERT INTO server_versions (id, version, released_at, status, features, min_client_version)
       VALUES ($1, $2, NOW(), $3, $4, $5)`,
      [id, version, 'beta', features, minClientVersion]
    );

    this.versions.set(version, newVersion);
    return newVersion;
  }

  async promoteToStable(version: string): Promise<void> {
    await this.pool.query(
      `UPDATE server_versions SET status = $1 WHERE version = $2`,
      ['stable', version]
    );
    this.currentVersion = version;
  }

  async deprecateVersion(version: string, deprecationDate: Date): Promise<void> {
    await this.pool.query(
      `UPDATE server_versions SET status = $1, deprecation_date = $2 WHERE version = $3`,
      ['deprecated', deprecationDate, version]
    );
  }
}
