import path from "node:path";
import fs from "node:fs";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { readConfigFile } from "../config-file.js";
import { resolveDefaultLogsDir, resolveHomeAwarePath } from "../home-paths.js";

function resolveServerLogDir(): string {
  const envOverride = process.env.PAPERCLIP_LOG_DIR?.trim();
  if (envOverride) return resolveHomeAwarePath(envOverride);

  const fileLogDir = readConfigFile()?.logging.logDir?.trim();
  if (fileLogDir) return resolveHomeAwarePath(fileLogDir);

  // Try the default logs dir, fall back to /tmp if not writable
  try {
    const defaultDir = resolveDefaultLogsDir();
    fs.mkdirSync(defaultDir, { recursive: true });
    return defaultDir;
  } catch (error) {
    // Fall back to /tmp for log files when the default location isn't writable
    const tmpDir = "/tmp/paperclip-logs";
    fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
  }
}

const logDir = resolveServerLogDir();
fs.mkdirSync(logDir, { recursive: true });

const logFile = path.join(logDir, "server.log");

const sharedOpts = {
  translateTime: "HH:MM:ss",
  ignore: "pid,hostname",
  singleLine: true,
};

export const logger = pino({
  level: "debug",
  ...sharedOpts,
});

export const httpLogger = pinoHttp({
  ...sharedOpts,
  logger,
});

export { logFile };
