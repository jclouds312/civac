import { Router, type IRouter } from "express";
import healthRouter from "./health";
import animalsRouter from "./animals";
import potrerosRouter from "./potreros";
import insumosRouter from "./insumos";
import personalRouter from "./personal";
import reproduccionRouter from "./reproduccion";
import alertasRouter from "./alertas";
import seedRouter from "./seed";
import pesajesRouter from "./pesajes";
import gpsRouter from "./gps";
import usuariosRouter from "./usuarios";
import lotesRouter from "./lotes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(animalsRouter);
router.use(potrerosRouter);
router.use(insumosRouter);
router.use(personalRouter);
router.use(reproduccionRouter);
router.use(alertasRouter);
router.use(seedRouter);
router.use(pesajesRouter);
router.use(gpsRouter);
router.use(usuariosRouter);
router.use(lotesRouter);

export default router;
