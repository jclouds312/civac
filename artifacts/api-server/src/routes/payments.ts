import { Router } from "express";
import Stripe from "stripe";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const MEMBERSHIP_PRODUCTS = {
  pro: { name: "CIVAC PRO", amount: 89000, days: 30 },
  premium: { name: "CIVAC Premium", amount: 189000, days: 30 },
  platino: { name: "CIVAC Platino", amount: 349000, days: 30 },
} as const;

type MembershipCode = keyof typeof MEMBERSHIP_PRODUCTS;

router.get("/payments/catalog", (_req, res) => {
  res.json({ ok: true, products: Object.entries(MEMBERSHIP_PRODUCTS).map(([code, product]) => ({ code, ...product, currency: "cop" })) });
});

router.post("/payments/checkout", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user || req.user.userId === "anon") return res.status(401).json({ error: "Inicia sesión para contratar una membresía." });
  if (!stripe) return res.status(503).json({ error: "Pagos no configurados en este entorno." });
  const code = String(req.body?.plan ?? "") as MembershipCode;
  const product = MEMBERSHIP_PRODUCTS[code];
  if (!product) return res.status(400).json({ error: "Plan no disponible." });

  const origin = typeof req.headers.origin === "string" ? req.headers.origin : process.env.PUBLIC_APP_URL ?? "http://localhost:5173";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      client_reference_id: req.user.userId,
      metadata: { userId: req.user.userId, planCode: code, days: String(product.days) },
      line_items: [{ price_data: { currency: "cop", product_data: { name: product.name }, unit_amount: product.amount }, quantity: 1 }],
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
    });
    return res.json({ ok: true, checkoutUrl: session.url, sessionId: session.id });
  } catch {
    return res.status(502).json({ error: "No fue posible iniciar el pago." });
  }
});

export default router;
