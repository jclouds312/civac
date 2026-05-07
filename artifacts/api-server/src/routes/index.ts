import { Router, type IRouter } from "express";
import healthRouter from "./health";
import animalsRouter from "./animals";
import potrerosRouter from "./potreros";
import insumosRouter from "./insumos";
import personalRouter from "./personal";
import reproduccionRouter from "./reproduccion";
import alertasRouter from "./alertas";
import pesajeRouter from "./pesaje";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(animalsRouter);
router.use(potrerosRouter);
router.use(insumosRouter);
router.use(personalRouter);
router.use(reproduccionRouter);
router.use(alertasRouter);
router.use(pesajeRouter);
router.use(seedRouter);

export default router;
