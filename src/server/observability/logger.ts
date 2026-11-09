import "server-only";

type LogLevel = "info" | "warn" | "error";

type ServerLogInput = {
  event: string;
  requestId: string;
  route: string;
  stage: string;
  errorCode?: string;
  runId?: string;
  batchId?: string;
  error?: unknown;
  metadata?: Record<string, unknown>;
};

const SENSITIVE_FIELD_PATTERN =
  /(authorization|cookie|token|secret|password|api[_-]?key|apikey|service[_-]?role|servicerole|captcha|emailbody|emailcontent|essay|transcript|audio[_-]?url|signed[_-]?url|signedurl|raw[_-]?(prompt|response)|supabase[_-]?session)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const SECRET_ASSIGNMENT_PATTERN =
  /\b(token|secret|password|api[_-]?key|authorization|cookie)\s*[:=]\s*[^\s,;]+/gi;

export function logServerEvent(level: LogLevel, input: ServerLogInput) {
  const error = serializeError(input.error);
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event: sanitizeText(input.event),
    requestId: sanitizeText(input.requestId),
    route: sanitizeText(input.route),
    stage: sanitizeText(input.stage),
    ...(input.errorCode ? { errorCode: sanitizeText(input.errorCode) } : {}),
    ...(error ? { errorClass: error.name, error } : {}),
    ...(input.runId ? { runId: sanitizeText(input.runId) } : {}),
    ...(input.batchId ? { batchId: sanitizeText(input.batchId) } : {}),
    ...(input.metadata ? { metadata: redactValue(input.metadata) } : {}),
  };
  const serialized = JSON.stringify(record);

  if (level === "error") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.info(serialized);
}

function redactValue(value: unknown, key = "", depth = 0): unknown {
  if (SENSITIVE_FIELD_PATTERN.test(key)) return "[REDACTED]";
  if (depth > 6) return "[TRUNCATED]";
  if (value === null || typeof value === "boolean" || typeof value === "number")
    return value;
  if (typeof value === "string") return sanitizeText(value);
  if (Array.isArray(value))
    return value.slice(0, 50).map((item) => redactValue(item, "", depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 50)
        .map(([entryKey, entryValue]) => [
          entryKey,
          redactValue(entryValue, entryKey, depth + 1),
        ]),
    );
  }
  return String(value);
}

function serializeError(error: unknown) {
  if (!(error instanceof Error)) return undefined;
  return {
    name: sanitizeText(error.name),
    message: sanitizeText(error.message),
    stack: error.stack ? sanitizeText(error.stack) : undefined,
    ...(error.cause instanceof Error
      ? {
          cause: {
            name: sanitizeText(error.cause.name),
            message: sanitizeText(error.cause.message),
          },
        }
      : {}),
  };
}

function sanitizeText(value: string) {
  return value
    .replace(BEARER_PATTERN, "Bearer [REDACTED]")
    .replace(SECRET_ASSIGNMENT_PATTERN, "$1=[REDACTED]")
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 4_000);
}
