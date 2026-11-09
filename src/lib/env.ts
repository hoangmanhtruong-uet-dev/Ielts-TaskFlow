import { z } from "@/lib/validation/zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(
    "NEXT_PUBLIC_SUPABASE_URL phải là URL hợp lệ.",
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY không được để trống."),
  NEXT_PUBLIC_SITE_URL: z
    .url("NEXT_PUBLIC_SITE_URL phải là URL hợp lệ.")
    .optional(),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.email().optional(),
  NEXT_PUBLIC_CRISP_WEBSITE_ID: z.string().trim().optional(),
  NEXT_PUBLIC_CDN_URL: z.string().trim().optional(),
});

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.email().optional(),
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    NEXT_PUBLIC_CDN_URL: z.string().trim().optional(),
    NEXT_PUBLIC_CRISP_WEBSITE_ID: z.string().trim().optional(),
    OPENAI_API_KEY: z.string().trim().optional(),
    OPENAI_WRITING_MODEL: z.string().trim().optional(),
    WRITING_FEEDBACK_SIGNING_SECRET: z.string().trim().optional(),
    OPENAI_SPEAKING_TRANSCRIPTION_MODEL: z.string().trim().optional(),
    OPENAI_SPEAKING_FEEDBACK_MODEL: z.string().trim().optional(),
    SPEAKING_PIPELINE_SIGNING_SECRET: z.string().trim().min(32).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
    STORAGE_CLEANUP_SECRET: z.string().trim().min(32).optional(),
    CRON_SECRET: z.string().trim().optional(),
    R2_ACCOUNT_ID: z.string().trim().optional(),
    R2_ACCESS_KEY_ID: z.string().trim().optional(),
    R2_SECRET_ACCESS_KEY: z.string().trim().optional(),
    R2_BUCKET_NAME: z.string().trim().optional(),
    R2_PUBLIC_URL: z.string().trim().optional(),
    CLOUDFLARE_R2_ACCOUNT_ID: z.string().trim().optional(),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().trim().optional(),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().trim().optional(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string().trim().optional(),
    BILLING_ENABLED: z
      .string()
      .optional()
      .refine(
        (val) =>
          val === undefined || val === "" || val === "true" || val === "false",
        "BILLING_ENABLED phải là 'true' hoặc 'false' nếu được set.",
      ),
    BILLING_WEBHOOK_SECRET: z.string().trim().optional(),
    UPSTASH_REDIS_REST_URL: z.string().trim().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().trim().optional(),
    TELEGRAM_BOT_TOKEN: z.string().trim().optional(),
    TELEGRAM_ADMIN_CHAT_ID: z.string().trim().optional(),
    TELEGRAM_CHAT_ID: z.string().trim().optional(),
    CMS_IMPORT_ALLOWED_HOSTS: z.string().trim().optional(),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === "production" && !env.NEXT_PUBLIC_SUPPORT_EMAIL) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SUPPORT_EMAIL"],
        message: "bắt buộc trong production để tiếp nhận yêu cầu dữ liệu",
      });
    }

    if (env.NODE_ENV === "production" && !env.NEXT_PUBLIC_SITE_URL) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SITE_URL"],
        message: "bắt buộc trong production",
      });
    }

    if (
      env.NODE_ENV === "production" &&
      !env.SPEAKING_PIPELINE_SIGNING_SECRET
    ) {
      context.addIssue({
        code: "custom",
        path: ["SPEAKING_PIPELINE_SIGNING_SECRET"],
        message: "bắt buộc trong production để xác minh upload Speaking",
      });
    }

    if (env.NODE_ENV === "production" && !env.SUPABASE_SERVICE_ROLE_KEY) {
      context.addIssue({
        code: "custom",
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
        message: "bắt buộc trong production để thực thi retention",
      });
    }

    if (env.NODE_ENV === "production" && !env.STORAGE_CLEANUP_SECRET) {
      context.addIssue({
        code: "custom",
        path: ["STORAGE_CLEANUP_SECRET"],
        message: "bắt buộc trong production để thực thi retention",
      });
    }

    if (
      env.NODE_ENV === "production" &&
      env.BILLING_ENABLED === "true" &&
      !env.BILLING_WEBHOOK_SECRET
    ) {
      context.addIssue({
        code: "custom",
        path: ["BILLING_WEBHOOK_SECRET"],
        message: "bắt buộc trong production khi BILLING_ENABLED=true",
      });
    }
  });

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type OptionalAiStatus = "disabled" | "configured" | "misconfigured";
export type OptionalAiReadiness = {
  overall: OptionalAiStatus;
  writing: OptionalAiStatus;
  speaking: OptionalAiStatus;
};

type OptionalAiEnvInput = Partial<
  Pick<
    ServerEnv,
    | "OPENAI_API_KEY"
    | "OPENAI_WRITING_MODEL"
    | "WRITING_FEEDBACK_SIGNING_SECRET"
    | "OPENAI_SPEAKING_TRANSCRIPTION_MODEL"
    | "OPENAI_SPEAKING_FEEDBACK_MODEL"
    | "SPEAKING_PIPELINE_SIGNING_SECRET"
  >
>;

export class EnvironmentValidationError extends Error {
  constructor(
    details: string,
    public readonly fields: string[],
  ) {
    super(`Cấu hình môi trường chưa hợp lệ. ${details}`);
    this.name = "EnvironmentValidationError";
  }
}

function createEnvironmentValidationError(
  issues: Array<{ path: PropertyKey[]; message: string }>,
) {
  const fields = [
    ...new Set(
      issues
        .map((issue) => issue.path.join("."))
        .filter((field) => field.length > 0),
    ),
  ];
  const details = issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(" ");

  return new EnvironmentValidationError(details, fields);
}

export function parsePublicEnv(
  input: Record<string, string | undefined>,
): PublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    throw createEnvironmentValidationError(result.error.issues);
  }

  return result.data;
}

export function getPublicEnv(): PublicEnv {
  return parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    ...(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
      ? {
          NEXT_PUBLIC_CRISP_WEBSITE_ID:
            process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
        }
      : {}),
    ...(process.env.NEXT_PUBLIC_CDN_URL
      ? { NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL }
      : {}),
  });
}

export function parseServerEnv(
  input: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(input);
  if (!result.success) {
    throw createEnvironmentValidationError(result.error.issues);
  }
  return result.data;
}

export function inspectOptionalAiConfiguration(
  input: OptionalAiEnvInput,
): OptionalAiReadiness {
  const hasApiKey = isPresent(input.OPENAI_API_KEY);
  const hasWritingModel = isPresent(input.OPENAI_WRITING_MODEL);
  const writingSecret = input.WRITING_FEEDBACK_SIGNING_SECRET?.trim();
  const hasWritingSecret = Boolean(writingSecret);
  const hasTranscriptionModel = isPresent(
    input.OPENAI_SPEAKING_TRANSCRIPTION_MODEL,
  );
  const hasSpeakingFeedbackModel = isPresent(
    input.OPENAI_SPEAKING_FEEDBACK_MODEL,
  );
  const hasSpeakingModel = hasTranscriptionModel || hasSpeakingFeedbackModel;
  const speakingSecret = input.SPEAKING_PIPELINE_SIGNING_SECRET?.trim();
  const hasAnyAiValue = Boolean(
    hasApiKey || hasWritingModel || hasWritingSecret || hasSpeakingModel,
  );

  if (!hasAnyAiValue) {
    return {
      overall: "disabled",
      writing: "disabled",
      speaking: "disabled",
    };
  }

  const orphanApiKey =
    hasApiKey && !hasWritingModel && !hasWritingSecret && !hasSpeakingModel;
  const writingIntent = hasWritingModel || hasWritingSecret || orphanApiKey;
  const speakingIntent = hasSpeakingModel || orphanApiKey;
  const writing = writingIntent
    ? hasApiKey &&
      hasWritingModel &&
      Boolean(writingSecret && writingSecret.length >= 32)
      ? "configured"
      : "misconfigured"
    : "disabled";
  const speaking = speakingIntent
    ? hasApiKey &&
      hasTranscriptionModel &&
      hasSpeakingFeedbackModel &&
      Boolean(speakingSecret && speakingSecret.length >= 32)
      ? "configured"
      : "misconfigured"
    : "disabled";

  return {
    overall:
      writing === "misconfigured" || speaking === "misconfigured"
        ? "misconfigured"
        : "configured",
    writing,
    speaking,
  };
}

function isPresent(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getServerEnv(): ServerEnv {
  return parseServerEnv({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_CRISP_WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_WRITING_MODEL: process.env.OPENAI_WRITING_MODEL,
    WRITING_FEEDBACK_SIGNING_SECRET:
      process.env.WRITING_FEEDBACK_SIGNING_SECRET,
    OPENAI_SPEAKING_TRANSCRIPTION_MODEL:
      process.env.OPENAI_SPEAKING_TRANSCRIPTION_MODEL,
    OPENAI_SPEAKING_FEEDBACK_MODEL: process.env.OPENAI_SPEAKING_FEEDBACK_MODEL,
    SPEAKING_PIPELINE_SIGNING_SECRET:
      process.env.SPEAKING_PIPELINE_SIGNING_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STORAGE_CLEANUP_SECRET: process.env.STORAGE_CLEANUP_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY:
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    BILLING_ENABLED: process.env.BILLING_ENABLED,
    BILLING_WEBHOOK_SECRET: process.env.BILLING_WEBHOOK_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    CMS_IMPORT_ALLOWED_HOSTS: process.env.CMS_IMPORT_ALLOWED_HOSTS,
  });
}

export function getR2Config() {
  const env = getServerEnv();
  const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID || env.R2_ACCOUNT_ID;
  const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID;
  const secretAccessKey =
    env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY;
  const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME || env.R2_BUCKET_NAME;

  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucketName) missing.push("R2_BUCKET_NAME");

  if (missing.length > 0) {
    throw new EnvironmentValidationError(
      `Thiếu cấu hình Cloudflare R2: ${missing.join(", ")}`,
      missing,
    );
  }

  const publicUrl = env.NEXT_PUBLIC_CDN_URL || env.R2_PUBLIC_URL || "";

  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucketName: bucketName!,
    publicUrl,
  };
}

export function assertProductionConfig() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();
  return { publicEnv, serverEnv };
}
