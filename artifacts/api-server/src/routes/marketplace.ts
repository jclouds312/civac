import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();

// El módulo permanece aislado hasta que el esquema marketplace se provisiona con RLS.
// No se exponen endpoints que aparenten guardar datos sin persistencia real.
router.use(authMiddleware);
router.use((_req: AuthRequest, res) => {
  res.status(501).json({
    error: "Marketplace pendiente de provisionamiento",
    message: "Este módulo requiere tablas y políticas RLS propias antes de activarse.",
  });
});

export default router;
