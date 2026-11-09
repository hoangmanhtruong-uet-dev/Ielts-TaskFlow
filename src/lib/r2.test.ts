import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const s3Mocks = vi.hoisted(() => ({
  send: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => {
  class MockCommand {
    constructor(public readonly input: Record<string, unknown>) {}
  }
  class S3Client {
    send = s3Mocks.send;
  }
  return {
    S3Client,
    PutObjectCommand: class extends MockCommand {},
    GetObjectCommand: class extends MockCommand {},
    HeadObjectCommand: class extends MockCommand {},
    DeleteObjectsCommand: class extends MockCommand {},
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: s3Mocks.getSignedUrl,
}));

import {
  deleteR2Objects,
  generateDownloadPresignedUrl,
  generateUploadUrl,
  getR2ObjectBytes,
  headR2Object,
  resetR2ClientForTests,
} from "@/lib/r2";

describe("Cloudflare R2 adapter", () => {
  beforeEach(() => {
    resetR2ClientForTests();
    vi.stubEnv("R2_ACCOUNT_ID", "acc-test-123");
    vi.stubEnv("R2_ACCESS_KEY_ID", "ak-test");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "sk-test");
    vi.stubEnv("R2_BUCKET_NAME", "speaking-bucket-test");
    s3Mocks.send.mockReset();
    s3Mocks.getSignedUrl.mockReset();
  });

  afterEach(() => {
    resetR2ClientForTests();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("generates presigned upload and download URLs with bucket and key", async () => {
    s3Mocks.getSignedUrl
      .mockResolvedValueOnce("https://r2.signed/put")
      .mockResolvedValueOnce("https://r2.signed/get");

    const uploadUrl = await generateUploadUrl(
      "u1/speaking/a1.webm",
      "audio/webm",
      300,
    );
    const downloadUrl = await generateDownloadPresignedUrl(
      "u1/speaking/a1.webm",
      120,
    );

    expect(uploadUrl).toBe("https://r2.signed/put");
    expect(downloadUrl).toBe("https://r2.signed/get");
    expect(s3Mocks.getSignedUrl).toHaveBeenCalledTimes(2);
    expect(s3Mocks.getSignedUrl).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      expect.objectContaining({
        input: {
          Bucket: "speaking-bucket-test",
          Key: "u1/speaking/a1.webm",
          ContentType: "audio/webm",
        },
      }),
      { expiresIn: 300 },
    );
  });

  it("reads object metadata via HeadObject and returns null for 404/NoSuchKey", async () => {
    s3Mocks.send.mockResolvedValueOnce({
      ContentLength: 4096,
      ContentType: "audio/webm",
    });

    await expect(headR2Object("u1/speaking/clip.webm")).resolves.toEqual({
      sizeBytes: 4096,
      contentType: "audio/webm",
    });

    s3Mocks.send.mockRejectedValueOnce({
      name: "NotFound",
      $metadata: { httpStatusCode: 404 },
    });
    await expect(headR2Object("u1/speaking/missing.webm")).resolves.toBeNull();

    s3Mocks.send.mockRejectedValueOnce(new Error("network_timeout"));
    await expect(headR2Object("u1/speaking/err.webm")).rejects.toThrow(
      "network_timeout",
    );
  });

  it("streams object bytes within limit and enforces maxBytes from header and stream", async () => {
    s3Mocks.send.mockResolvedValueOnce({
      ContentLength: 5,
      Body: {
        transformToWebStream: () =>
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new Uint8Array([1, 2]));
              controller.enqueue(new Uint8Array([3, 4, 5]));
              controller.close();
            },
          }),
      },
    });

    const bytes = await getR2ObjectBytes("u1/speaking/clip.webm", 10);
    expect(Array.from(bytes ?? [])).toEqual([1, 2, 3, 4, 5]);

    s3Mocks.send.mockResolvedValueOnce({
      ContentLength: 2048,
      Body: undefined,
    });
    await expect(
      getR2ObjectBytes("u1/speaking/too-large-hdr.webm", 1024),
    ).rejects.toThrow("invalid_audio_size");

    const cancelSpy = vi.fn(async () => {});
    let pullCount = 0;
    s3Mocks.send.mockResolvedValueOnce({
      Body: {
        transformToWebStream: () =>
          new ReadableStream<Uint8Array>({
            pull(controller) {
              pullCount++;
              if (pullCount <= 3) {
                controller.enqueue(new Uint8Array(700));
              } else {
                controller.close();
              }
            },
            cancel: cancelSpy,
          }),
      },
    });
    await expect(
      getR2ObjectBytes("u1/speaking/too-large-stream.webm", 1024),
    ).rejects.toThrow("invalid_audio_size");
    expect(cancelSpy).toHaveBeenCalledWith("audio_size_exceeded");

    s3Mocks.send.mockRejectedValueOnce({
      name: "NoSuchKey",
      Code: "NoSuchKey",
    });
    await expect(
      getR2ObjectBytes("u1/speaking/missing.webm", 1024),
    ).resolves.toBeNull();
  });

  it("deduplicates, chunks >1000 keys, and tracks partial DeleteObjects errors", async () => {
    expect(await deleteR2Objects(["  ", ""])).toEqual({
      deletedKeys: [],
      failedKeys: [],
    });
    expect(s3Mocks.send).not.toHaveBeenCalled();

    const keys = Array.from({ length: 1005 }, (_, i) => `k/${i}.webm`);
    s3Mocks.send
      .mockResolvedValueOnce({ Errors: [] })
      .mockResolvedValueOnce({ Errors: [{ Key: "k/1004.webm" }] });

    const res = await deleteR2Objects([...keys, "k/0.webm"]);
    expect(s3Mocks.send).toHaveBeenCalledTimes(2);
    expect(res.deletedKeys).toHaveLength(1004);
    expect(res.failedKeys).toEqual(["k/1004.webm"]);

    s3Mocks.send.mockRejectedValueOnce(new Error("r2_unavailable"));
    const threwRes = await deleteR2Objects(["a.webm", "b.webm"]);
    expect(threwRes).toEqual({
      deletedKeys: [],
      failedKeys: ["a.webm", "b.webm"],
    });
  });
});
