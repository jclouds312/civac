import { randomBytes } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";

const WILLIAM_ID = "civac_william";
const WILLIAM_EMAIL = "williamtoroparrado@gmail.com";

export async function ensureWilliamAccount() {
  return db.transaction(async tx => {
    const emailOwners = await tx.select({ id: usuariosTable.id }).from(usuariosTable)
      .where(eq(usuariosTable.email, WILLIAM_EMAIL)).limit(1);
    if (emailOwners[0] && emailOwners[0].id !== WILLIAM_ID) {
      return { ok: false as const, reason: "email_conflict" };
    }

    const matches = await tx.select().from(usuariosTable)
      .where(or(
        eq(usuariosTable.id, WILLIAM_ID),
        eq(usuariosTable.email, "william"),
        eq(usuariosTable.email, WILLIAM_EMAIL),
      ))
      .limit(1);
    const existing = matches[0];

    if (existing && existing.id !== WILLIAM_ID) {
      return { ok: false as const, reason: "account_id_conflict" };
    }
    if (existing && ["admin", "superadmin", "developer"].includes(existing.role)) {
      return { ok: false as const, reason: "staff_account_conflict" };
    }
    if (existing && (existing.estado === "bloqueado" || existing.activo === false)) {
      return { ok: false as const, reason: "account_unavailable" };
    }

    const now = new Date();
    if (!existing) {
      const [account] = await tx.insert(usuariosTable).values({
        id: WILLIAM_ID,
        nombre: "William",
        cargo: "Cliente Premium CIVAC",
        finca: "CIVAC",
        email: WILLIAM_EMAIL,
        password: `CARD_ONLY:${randomBytes(32).toString("hex")}`,
        role: "cliente",
        permisos: "[]",
        planCode: "premium",
        activo: true,
        estado: "activo",
        demoExpiry: null,
        demoDias: 0,
        planExpiry: null,
        planDias: 0,
      }).returning();
      return { ok: true as const, account, created: true };
    }

    const updates: Partial<typeof usuariosTable.$inferInsert> = {
      nombre: "William",
      cargo: "Cliente Premium CIVAC",
      role: "cliente",
      permisos: "[]",
      planCode: "premium",
      activo: true,
      estado: "activo",
      demoExpiry: null,
      demoDias: 0,
      planExpiry: null,
      planDias: 0,
      email: WILLIAM_EMAIL,
      updatedAt: now,
    };

    const [account] = await tx.update(usuariosTable).set(updates)
      .where(eq(usuariosTable.id, existing.id)).returning();
    return { ok: true as const, account, created: false };
  });
}
