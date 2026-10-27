import { randomBytes, scrypt } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";

const WILLIAM_ID = "civac_william";
const WILLIAM_EMAIL = "william";

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(`scrypt$${salt}$${Buffer.from(key).toString("hex")}`);
    });
  });
}

export async function ensureWilliamAccount() {
  const password = process.env.WILLIAM_ACCOUNT_PASSWORD;
  if (!password || password.length < 10 || password.length > 128) {
    return { ok: false as const, reason: "password_not_configured" };
  }

  return db.transaction(async tx => {
    const matches = await tx.select().from(usuariosTable)
      .where(or(eq(usuariosTable.id, WILLIAM_ID), eq(usuariosTable.email, WILLIAM_EMAIL)))
      .limit(1);
    const existing = matches[0];

    if (existing && ["admin", "superadmin", "developer"].includes(existing.role)) {
      return { ok: false as const, reason: "staff_account_conflict" };
    }
    if (existing && (existing.estado === "bloqueado" || existing.activo === false)) {
      return { ok: false as const, reason: "account_unavailable" };
    }

    const now = new Date();
    if (!existing) {
      const passwordHash = await hashPassword(password);
      const [account] = await tx.insert(usuariosTable).values({
        id: WILLIAM_ID,
        nombre: "William",
        cargo: "Cliente Premium CIVAC",
        finca: "CIVAC",
        email: WILLIAM_EMAIL,
        password: passwordHash,
        role: "cliente",
        permisos: JSON.stringify(["*"]),
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
      permisos: JSON.stringify(["*"]),
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
    if (existing.password.startsWith("CARD_ONLY:")) {
      updates.password = await hashPassword(password);
    }

    const [account] = await tx.update(usuariosTable).set(updates)
      .where(eq(usuariosTable.id, existing.id)).returning();
    return { ok: true as const, account, created: false };
  });
}
