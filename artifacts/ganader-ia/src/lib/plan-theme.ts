import { useAuth, PLAN_COLOR, PLAN_COLOR2, PLAN_GLOW, PLAN_GRADIENT, PLAN_ICON, PLAN_LABEL, PLAN_LABEL_METAL, type PlanId } from "./auth";

export interface PlanTheme {
  plan: PlanId;
  primary: string;
  secondary: string;
  glow: string;
  gradient: [string, string];
  icon: string;
  label: string;
  metalLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeShadow: string;
  cardTopStripe: string;
  cardBorderColor: string;
  cardGlowShadow: string;
  topbarColor: string;
  topbarBg: string;
  topbarBorder: string;
}

export function usePlanTheme(): PlanTheme {
  const { user } = useAuth();
  const plan = (user?.plan ?? "basico") as PlanId;
  const primary   = PLAN_COLOR[plan];
  const secondary = PLAN_COLOR2[plan];
  const glow      = PLAN_GLOW[plan];
  const [g1, g2]  = PLAN_GRADIENT[plan];

  return {
    plan,
    primary,
    secondary,
    glow,
    gradient:       [g1, g2],
    icon:           PLAN_ICON[plan],
    label:          PLAN_LABEL[plan],
    metalLabel:     PLAN_LABEL_METAL[plan],
    badgeBg:        `rgba(${glow},0.12)`,
    badgeBorder:    `rgba(${glow},0.38)`,
    badgeShadow:    `0 0 14px rgba(${glow},0.30)`,
    cardTopStripe:  `linear-gradient(90deg,transparent,${primary},${secondary},transparent)`,
    cardBorderColor:`rgba(${glow},0.22)`,
    cardGlowShadow: `0 0 20px rgba(${glow},0.08)`,
    topbarColor:    primary,
    topbarBg:       `rgba(${glow},0.10)`,
    topbarBorder:   `rgba(${glow},0.30)`,
  };
}
