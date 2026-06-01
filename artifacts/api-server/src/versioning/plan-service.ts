/**
 * Plan Service - Manages subscription tiers and feature access
 * Integrates with PostgreSQL for plan storage and versioning
 */

import { Pool } from 'pg';

export enum PlanTier {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  DEVELOPER = 'developer',
}

export interface PlanFeatures {
  maxAnimals: number;
  maxDevices: number;
  maxUsers: number;
  gpsTracking: boolean;
  weighingScale: boolean;
  marketplace: boolean;
  analyticsEngine: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  supportLevel: 'email' | 'priority' | 'dedicated';
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  [PlanTier.STARTER]: {
    maxAnimals: 50,
    maxDevices: 5,
    maxUsers: 1,
    gpsTracking: false,
    weighingScale: true,
    marketplace: false,
    analyticsEngine: false,
    apiAccess: false,
    customBranding: false,
    supportLevel: 'email',
  },
  [PlanTier.PRO]: {
    maxAnimals: 500,
    maxDevices: 50,
    maxUsers: 5,
    gpsTracking: true,
    weighingScale: true,
    marketplace: true,
    analyticsEngine: true,
    apiAccess: true,
    customBranding: false,
    supportLevel: 'priority',
  },
  [PlanTier.ENTERPRISE]: {
    maxAnimals: 50000,
    maxDevices: 1000,
    maxUsers: 100,
    gpsTracking: true,
    weighingScale: true,
    marketplace: true,
    analyticsEngine: true,
    apiAccess: true,
    customBranding: true,
    supportLevel: 'dedicated',
  },
  [PlanTier.DEVELOPER]: {
    maxAnimals: 1000,
    maxDevices: 500,
    maxUsers: 50,
    gpsTracking: true,
    weighingScale: true,
    marketplace: true,
    analyticsEngine: true,
    apiAccess: true,
    customBranding: true,
    supportLevel: 'dedicated',
  },
};

export class PlanService {
  constructor(private pool: Pool) {}

  async getUserPlan(userId: string): Promise<{ tier: PlanTier; features: PlanFeatures }> {
    const result = await this.pool.query(
      `SELECT tier FROM user_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    
    const tier = result.rows[0]?.tier || PlanTier.STARTER;
    return { tier: tier as PlanTier, features: PLAN_FEATURES[tier as PlanTier] };
  }

  async upgradePlan(userId: string, newTier: PlanTier, stripePaymentId?: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO user_subscriptions (user_id, tier, stripe_payment_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, newTier, stripePaymentId || null]
    );
  }

  async hasFeature(userId: string, feature: keyof PlanFeatures): Promise<boolean> {
    const { features } = await this.getUserPlan(userId);
    return features[feature] as boolean;
  }

  async checkQuota(userId: string, resource: 'animals' | 'devices' | 'users', current: number): Promise<boolean> {
    const { features } = await this.getUserPlan(userId);
    const quotaKey = `max${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof PlanFeatures;
    const limit = features[quotaKey] as number;
    return current < limit;
  }
}
