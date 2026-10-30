import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "ok",
    uptime: process.uptime(),
    version: process.version,
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
