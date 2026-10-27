import app from "./app";
import { logger } from "./lib/logger";
import { ensureWilliamAccount } from "./lib/william-account";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  void ensureWilliamAccount().then(result => {
    if (result.ok) {
      logger.info({ created: result.created }, "William's 30-day Premium account is ready");
    } else {
      logger.warn({ reason: result.reason }, "William's account was not provisioned");
    }
  }).catch(err => {
    logger.error({ err }, "William's account provisioning failed");
  });
});
