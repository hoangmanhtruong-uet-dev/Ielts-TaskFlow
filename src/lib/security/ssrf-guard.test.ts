import type { lookup } from "node:dns/promises";

import { describe, expect, it, vi } from "vitest";

import {
  isBlockedIpAddress,
  safeFetchExternalJson,
  sanitizeCmsMarkdown,
  sanitizeExternalHttpUrl,
  SsrfValidationError,
  validateExternalHttpsUrl,
} from "@/lib/security/ssrf-guard";

type DnsLookupFn = typeof lookup;

function mockDnsLookup(
  result: Array<{ address: string; family: number }> | Error,
): DnsLookupFn {
  return vi.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  }) as unknown as DnsLookupFn;
}

describe("sanitizeExternalHttpUrl", () => {
  it("allows http and https URLs without credentials", () => {
    expect(sanitizeExternalHttpUrl(" https://example.com/path?a=1 ")).toBe(
      "https://example.com/path?a=1",
    );
    expect(sanitizeExternalHttpUrl("http://docs.example.org")).toBe(
      "http://docs.example.org/",
    );
  });

  it("rejects empty values, non-http protocols, and embedded credentials", () => {
    expect(sanitizeExternalHttpUrl(null)).toBeNull();
    expect(sanitizeExternalHttpUrl(undefined)).toBeNull();
    expect(sanitizeExternalHttpUrl("   ")).toBeNull();
    expect(sanitizeExternalHttpUrl("not-a-url")).toBeNull();
    expect(sanitizeExternalHttpUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeExternalHttpUrl("data:text/html,<h1>x</h1>")).toBeNull();
    expect(sanitizeExternalHttpUrl("ftp://example.com/file")).toBeNull();
    expect(
      sanitizeExternalHttpUrl("https://user:secret@example.com/private"),
    ).toBeNull();
  });
});

describe("sanitizeCmsMarkdown", () => {
  it("neutralizes dangerous markdown link schemes while keeping safe links", () => {
    const input =
      "Read [good](https://example.com) and [bad1](javascript:alert(1)) and [bad2](  VBScript:msgbox) and [bad3](data:text/html,xss)";
    const sanitized = sanitizeCmsMarkdown(input);
    expect(sanitized).toContain("[good](https://example.com)");
    expect(sanitized).toContain("[bad1](#blocked-unsafe-link)");
    expect(sanitized).toContain("[bad2](#blocked-unsafe-link)");
    expect(sanitized).toContain("[bad3](#blocked-unsafe-link)");
  });
});

describe("isBlockedIpAddress", () => {
  it("blocks private, loopback, link-local/metadata, CGNAT, and multicast IPv4", () => {
    const blocked = [
      "0.0.0.0",
      "10.0.0.1",
      "100.64.0.1",
      "127.0.0.1",
      "169.254.169.254",
      "172.16.0.1",
      "172.31.255.255",
      "192.0.0.1",
      "192.0.2.1",
      "192.168.1.50",
      "198.18.0.1",
      "224.0.0.1",
      "255.255.255.255",
    ];
    for (const ip of blocked) {
      expect(isBlockedIpAddress(ip), ip).toBe(true);
    }
  });

  it("blocks loopback, unique local, link-local, multicast, and mapped private IPv6", () => {
    const blocked = [
      "::",
      "::1",
      "fc00::1",
      "fd12:3456:789a::1",
      "fe80::1",
      "fe80::1%eth0",
      "ff02::1",
      "::ffff:127.0.0.1",
      "::ffff:169.254.169.254",
      "::ffff:7f00:1",
      "::ffff:a9fe:a9fe",
      "not-an-ip",
    ];
    for (const ip of blocked) {
      expect(isBlockedIpAddress(ip), ip).toBe(true);
    }
  });

  it("allows routable public IPv4 and IPv6 addresses", () => {
    const allowed = [
      "1.1.1.1",
      "8.8.8.8",
      "93.184.216.34",
      "100.63.255.255",
      "100.128.0.1",
      "172.32.0.1",
      "2606:4700:4700::1111",
      "::ffff:1.1.1.1",
    ];
    for (const ip of allowed) {
      expect(isBlockedIpAddress(ip), ip).toBe(false);
    }
  });
});

describe("validateExternalHttpsUrl", () => {
  it("rejects malformed URLs, non-HTTPS protocols, credentials, and internal hostnames", async () => {
    await expect(validateExternalHttpsUrl(":::bad")).rejects.toMatchObject({
      code: "INVALID_URL",
    });
    await expect(
      validateExternalHttpsUrl("http://example.com/a.json"),
    ).rejects.toMatchObject({ code: "DISALLOWED_PROTOCOL" });
    await expect(
      validateExternalHttpsUrl("https://admin:pw@example.com/a.json"),
    ).rejects.toMatchObject({ code: "DISALLOWED_HOST" });

    for (const host of [
      "localhost",
      "sub.localhost",
      "printer.local",
      "metadata.google.internal",
    ]) {
      await expect(
        validateExternalHttpsUrl(`https://${host}/a.json`),
      ).rejects.toMatchObject({ code: "DISALLOWED_HOST" });
    }
  });

  it("blocks direct literal private/loopback/link-local IPs", async () => {
    for (const literal of [
      "127.0.0.1",
      "169.254.169.254",
      "10.0.0.5",
      "[::1]",
      "[fe80::1]",
    ]) {
      await expect(
        validateExternalHttpsUrl(`https://${literal}/data.json`),
      ).rejects.toMatchObject({ code: "BLOCKED_IP" });
    }
  });

  it("enforces host allowlist when configured", async () => {
    await expect(
      validateExternalHttpsUrl("https://evil.example/data.json", {
        allowedHosts: "cdn.example.com, assets.trusted.org",
        dnsLookup: mockDnsLookup([{ address: "93.184.216.34", family: 4 }]),
      }),
    ).rejects.toMatchObject({ code: "DISALLOWED_HOST" });

    const allowed = await validateExternalHttpsUrl(
      "https://sub.cdn.example.com/items.json",
      {
        allowedHosts: "cdn.example.com",
        dnsLookup: mockDnsLookup([{ address: "93.184.216.34", family: 4 }]),
      },
    );
    expect(allowed.hostname).toBe("sub.cdn.example.com");
  });

  it("blocks hostnames whose DNS resolves to any private IP (DNS rebinding guard)", async () => {
    await expect(
      validateExternalHttpsUrl("https://rebind.example.com/feed.json", {
        dnsLookup: mockDnsLookup([
          { address: "93.184.216.34", family: 4 },
          { address: "10.0.0.1", family: 4 },
        ]),
      }),
    ).rejects.toMatchObject({ code: "BLOCKED_IP" });

    await expect(
      validateExternalHttpsUrl("https://v6local.example.com/feed.json", {
        dnsLookup: mockDnsLookup([{ address: "::1", family: 6 }]),
      }),
    ).rejects.toMatchObject({ code: "BLOCKED_IP" });

    await expect(
      validateExternalHttpsUrl("https://unresolved.example.com/feed.json", {
        dnsLookup: mockDnsLookup(new Error("ENOTFOUND")),
      }),
    ).rejects.toMatchObject({ code: "DISALLOWED_HOST" });
  });
});

describe("safeFetchExternalJson", () => {
  const publicDns = mockDnsLookup([{ address: "93.184.216.34", family: 4 }]);

  it("blocks HTTP redirects so attackers cannot bounce into internal endpoints", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(null, {
          status: 302,
          headers: { Location: "http://127.0.0.1/admin" },
        }),
    ) as unknown as typeof fetch;

    await expect(
      safeFetchExternalJson("https://cdn.example.com/items.json", {
        dnsLookup: publicDns,
        fetchImpl: fetchMock,
      }),
    ).rejects.toMatchObject({ code: "REDIRECT_BLOCKED" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://cdn.example.com/items.json",
      expect.objectContaining({ redirect: "manual" }),
    );
  });

  it("rejects responses whose content-length or streamed body exceeds maxBytes", async () => {
    const largeHeaderFetch = vi.fn(
      async () =>
        new Response("{}", {
          status: 200,
          headers: { "content-length": "5000" },
        }),
    ) as unknown as typeof fetch;

    await expect(
      safeFetchExternalJson("https://cdn.example.com/too-big.json", {
        maxBytes: 1024,
        dnsLookup: publicDns,
        fetchImpl: largeHeaderFetch,
      }),
    ).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });

    const cancelSpy = vi.fn(async () => {});
    let pullCount = 0;
    const oversizedChunkFetch = vi.fn(async () => {
      const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
          pullCount++;
          if (pullCount <= 3) {
            controller.enqueue(new Uint8Array(600));
          } else {
            controller.close();
          }
        },
        cancel: cancelSpy,
      });
      return new Response(stream, { status: 200 });
    }) as unknown as typeof fetch;

    await expect(
      safeFetchExternalJson("https://cdn.example.com/stream-big.json", {
        maxBytes: 1024,
        dnsLookup: publicDns,
        fetchImpl: oversizedChunkFetch,
      }),
    ).rejects.toBeInstanceOf(SsrfValidationError);

    expect(cancelSpy).toHaveBeenCalled();
  });

  it("rejects invalid JSON payloads and parses valid public HTTPS JSON", async () => {
    const invalidJsonFetch = vi.fn(
      async () => new Response("{bad-json", { status: 200 }),
    ) as unknown as typeof fetch;

    await expect(
      safeFetchExternalJson("https://cdn.example.com/bad.json", {
        dnsLookup: publicDns,
        fetchImpl: invalidJsonFetch,
      }),
    ).rejects.toMatchObject({ code: "INVALID_JSON" });

    const okFetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ items: [{ title: "Sample" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    ) as unknown as typeof fetch;

    const result = await safeFetchExternalJson(
      "https://cdn.example.com/ok.json",
      {
        dnsLookup: publicDns,
        fetchImpl: okFetch,
      },
    );
    expect(result).toEqual({
      validatedUrl: "https://cdn.example.com/ok.json",
      data: { items: [{ title: "Sample" }] },
    });
  });
});
