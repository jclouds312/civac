import type { PlanId } from "./auth";

// Canonical retail prices used by checkout and the public plan cards.
export const PLAN_RETAIL_MONTHLY: Record<PlanId, number> = {
  basico: 0,
  pro: 129_000,
  premium: 289_000,
  platino: 890_000,
};

export const PLAN_RETAIL_ANNUAL: Record<PlanId, number> = {
  basico: 0,
  pro: 1_239_000,
  premium: 2_775_000,
  platino: 8_544_000,
};

export function formatPlanPrice(amount: number): string {
  return amount === 0 ? "Gratis" : `$${amount.toLocaleString("es-CO")}`;
}

export function formatPlanMonthlyPrice(plan: PlanId): string {
  return plan === "basico"
    ? "Gratis"
    : `${formatPlanPrice(PLAN_RETAIL_MONTHLY[plan])} COP/mes`;
}
