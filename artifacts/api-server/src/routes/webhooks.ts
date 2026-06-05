import { Router } from "express";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";

const router = Router();

function msLeft(d: Date | null | undefined): number {
  if (!d) return Infinity;
  return new Date(d).getTime() - Date.now();
}

/* ── Wompi signature verification ─────────────────────────────────────────── */
function verifyWompiSignature(
  checksum: string,
  properties: string[],
  eventData: Record<string, unknown>,
  integrityKey: string,
): boolean {
  try {
    const getValue = (path: string, obj: Record<string, unknown>): string => {
      const keys = path.split(".");
      let cur: unknown = obj;
      for (const k of keys) cur = (cur as Record<string, unknown>)[k];
      return String(cur ?? "");
    };
    const str = properties.map(p => getValue(p, eventData)).join("") + integrityKey;
    const computed = createHash("sha256").update(str).digest("hex");
    return computed === checksum;
  } catch {
    return false;
  }
}

/* ── POST /api/webhooks/wompi ─────────────────────────────────────────────── */
router.post("/webhooks/wompi", async (req, res) => {
  try {
    const integrityKey = process.env["WOMPI_INTEGRITY_KEY"] ?? "";
    const payload = req.body as {
      event?: string;
      data?: {
        transaction?: {
          id?: string;
          status?: string;
          reference?: string;
          amount_in_cents?: number;
          payment_method_type?: string;
          customer_data?: { email?: string; full_name?: string };
        };
      };
      signature?: { checksum?: string; properties?: string[] };
      sent_at?: string;
    };

    // Verify signature only if integrity key is configured
    if (integrityKey && payload.signature?.checksum && payload.signature?.properties) {
      const valid = verifyWompiSignature(
        payload.signature.checksum,
        payload.signature.properties,
        payload.data as Record<string, unknown> ?? {},
        integrityKey,
      );
      if (!valid) {
        return res.status(401).json({ ok: false, error: "Invalid Wompi signature" });
      }
    }

    if (payload.event !== "transaction.updated") {
      return res.json({ ok: true, skipped: true });
    }

    const tx = payload.data?.transaction;
    if (!tx || tx.status !== "APPROVED") {
      return res.json({ ok: true, skipped: true, status: tx?.status });
    }

    const ref = tx.reference ?? "";
    const email = tx.customer_data?.email ?? "";

    // Detect plan from reference or amount (reference format: CIVAC-YYYY-NNNNNN)
    // We match by customer email to find the user in DB
    let planCode = "pro"; // default
    const amountCOP = Math.round((tx.amount_in_cents ?? 0) / 100);
    if      (amountCOP >= 399000) planCode = "platino";
    else if (amountCOP >= 189000) planCode = "premium";
    else if (amountCOP >= 89000)  planCode = "pro";

    // Try to find user by email
    if (!email) {
      return res.json({ ok: true, skipped: true, reason: "no_email" });
    }

    const users = await db.select().from(usuariosTable)
      .where(eq(usuariosTable.email, email))
      .limit(1);

    if (!users.length) {
      // User not found in DB — log for manual processing
      console.log(`[wompi-webhook] APPROVED tx ${tx.id} ref=${ref} email=${email} — user not found`);
      return res.json({ ok: true, skipped: true, reason: "user_not_found" });
    }

    const user = users[0];

    // Skip if user already has an active non-expired plan
    if (user.planExpiry && msLeft(user.planExpiry) > 0 && user.planCode === planCode) {
      return res.json({ ok: true, skipped: true, reason: "already_active" });
    }

    // Activate plan: 30 days from now
    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + 30);

    await db.update(usuariosTable).set({
      planCode,
      planExpiry,
      planDias:  30,
      estado:    "activo",
      demoExpiry: null,
    }).where(eq(usuariosTable.id, user.id));

    console.log(`[wompi-webhook] Activated plan=${planCode} for user=${user.email} ref=${ref}`);
    return res.json({
      ok: true,
      activated: true,
      userId: user.id,
      email: user.email,
      plan: planCode,
      ref,
    });
  } catch (err) {
    console.error("[wompi-webhook] Error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

/* ── GET /api/webhooks/wompi/test — health check ─────────────────────────── */
router.get("/webhooks/wompi/test", (_req, res) => {
  res.json({
    ok: true,
    configured: !!process.env["WOMPI_INTEGRITY_KEY"],
    endpoint: "POST /api/webhooks/wompi",
    accepts: "application/json — Wompi transaction.updated events",
  });
});

export default router;
