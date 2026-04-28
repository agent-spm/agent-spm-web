/**
 * Structured logger for server-side use.
 * Outputs JSON for easy parsing by log aggregation services.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("User signed in", { userId: "123" });
 *   logger.error("Payment failed", { orderId: "abc", error: err.message });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  [key: string]: unknown;
}

function createEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

function emit(entry: LogEntry) {
  const output = JSON.stringify(entry);

  switch (entry.level) {
    case "debug":
      console.debug(output);
      break;
    case "info":
      console.info(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "error":
      console.error(output);
      break;
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      emit(createEntry("debug", message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    emit(createEntry("info", message, meta));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    emit(createEntry("warn", message, meta));
  },

  error(message: string, meta?: Record<string, unknown>) {
    emit(createEntry("error", message, meta));
  },

  /**
   * Create a child logger with a fixed context label.
   * Usage: const log = logger.child("WebhookHandler");
   */
  child(context: string) {
    return {
      debug: (msg: string, meta?: Record<string, unknown>) =>
        logger.debug(msg, { context, ...meta }),
      info: (msg: string, meta?: Record<string, unknown>) =>
        logger.info(msg, { context, ...meta }),
      warn: (msg: string, meta?: Record<string, unknown>) =>
        logger.warn(msg, { context, ...meta }),
      error: (msg: string, meta?: Record<string, unknown>) =>
        logger.error(msg, { context, ...meta }),
    };
  },
};
