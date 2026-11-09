import "server-only";

import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getR2Config } from "@/lib/env";

let cachedClient: S3Client | null = null;
let cachedConfigKey = "";

export function getR2Client() {
  const config = getR2Config();
  const nextKey = `${config.accountId}:${config.accessKeyId}:${config.bucketName}`;
  if (!cachedClient || cachedConfigKey !== nextKey) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
    cachedConfigKey = nextKey;
  }

  return { client: cachedClient, bucketName: config.bucketName };
}

export function resetR2ClientForTests() {
  cachedClient = null;
  cachedConfigKey = "";
}

export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
) {
  const { client, bucketName } = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function generateDownloadPresignedUrl(
  key: string,
  expiresInSeconds = 600,
) {
  const { client, bucketName } = getR2Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function putR2Object(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
) {
  const { client, bucketName } = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function headR2Object(
  key: string,
): Promise<{ sizeBytes: number; contentType: string | null } | null> {
  const { client, bucketName } = getR2Client();
  try {
    const response = await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    return {
      sizeBytes:
        typeof response.ContentLength === "number" ? response.ContentLength : 0,
      contentType: response.ContentType ?? null,
    };
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

export async function getR2ObjectBytes(
  key: string,
  maxBytes: number,
): Promise<Uint8Array | null> {
  const { client, bucketName } = getR2Client();
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    if (
      typeof response.ContentLength === "number" &&
      response.ContentLength > maxBytes
    ) {
      throw new Error("invalid_audio_size");
    }

    if (!response.Body) return null;

    const webStream = response.Body.transformToWebStream();
    const reader = webStream.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel("audio_size_exceeded").catch(() => {});
          throw new Error("invalid_audio_size");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return combined;
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

export async function deleteR2Objects(
  keys: string[],
): Promise<{ deletedKeys: string[]; failedKeys: string[] }> {
  const uniqueKeys = [
    ...new Set(keys.map((key) => key.trim()).filter(Boolean)),
  ];
  if (uniqueKeys.length === 0) {
    return { deletedKeys: [], failedKeys: [] };
  }

  const { client, bucketName } = getR2Client();
  const deletedKeys: string[] = [];
  const failedKeys: string[] = [];

  for (let i = 0; i < uniqueKeys.length; i += 1000) {
    const batch = uniqueKeys.slice(i, i + 1000);
    try {
      const response = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: batch.map((Key) => ({ Key })),
            Quiet: false,
          },
        }),
      );

      const errorKeySet = new Set(
        (response.Errors ?? [])
          .map((item) => item.Key)
          .filter((key): key is string => typeof key === "string"),
      );

      for (const key of batch) {
        if (errorKeySet.has(key)) {
          failedKeys.push(key);
        } else {
          deletedKeys.push(key);
        }
      }
    } catch {
      failedKeys.push(...batch);
    }
  }

  return { deletedKeys, failedKeys };
}

export function getPublicUrl(key: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_CDN_URL?.trim() ||
    process.env.R2_PUBLIC_URL?.trim() ||
    "";
  if (!baseUrl) {
    throw new Error("CDN public URL is not configured.");
  }
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${cleanBaseUrl}/${cleanKey}`;
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    name?: string;
    Code?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return (
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey" ||
    candidate.Code === "NoSuchKey" ||
    candidate.$metadata?.httpStatusCode === 404
  );
}
