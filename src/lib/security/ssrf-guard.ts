import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class SsrfValidationError extends Error {
  constructor(
    public readonly code:
      | "INVALID_URL"
      | "DISALLOWED_PROTOCOL"
      | "DISALLOWED_HOST"
      | "BLOCKED_IP"
      | "REDIRECT_BLOCKED"
      | "PAYLOAD_TOO_LARGE"
      | "FETCH_FAILED"
      | "INVALID_JSON",
    message: string,
  ) {
    super(message);
    this.name = "SsrfValidationError";
  }
}

export function sanitizeExternalHttpUrl(
  rawUrl: string | null | undefined,
): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeCmsMarkdown(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(\s*(?:javascript|vbscript|data):[^)]*\)/gi,
    "[$1](#blocked-unsafe-link)",
  );
}

function parseIpv4ToUint32(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet < 0 || octet > 255) return null;
    value = ((value << 8) | octet) >>> 0;
  }
  return value;
}

function isBlockedIpv4(ip: string): boolean {
  const n = parseIpv4ToUint32(ip);
  if (n === null) return true;

  const first = (n >>> 24) & 0xff;
  const second = (n >>> 16) & 0xff;
  const third = (n >>> 8) & 0xff;

  if (first === 0) return true; // 0.0.0.0/8 ("this network")
  if (first === 10) return true; // 10.0.0.0/8 (RFC1918)
  if (first === 100 && second >= 64 && second <= 127) return true; // 100.64.0.0/10 (CGNAT)
  if (first === 127) return true; // 127.0.0.0/8 (loopback)
  if (first === 169 && second === 254) return true; // 169.254.0.0/16 (link-local / cloud metadata)
  if (first === 172 && second >= 16 && second <= 31) return true; // 172.16.0.0/12 (RFC1918)
  if (first === 192 && second === 0 && third === 0) return true; // 192.0.0.0/24
  if (first === 192 && second === 0 && third === 2) return true; // 192.0.2.0/24
  if (first === 192 && second === 168) return true; // 192.168.0.0/16 (RFC1918)
  if (first === 198 && (second === 18 || second === 19)) return true; // 198.18.0.0/15
  if (first >= 224) return true; // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved + 255.255.255.255
  return false;
}

function extractMappedIpv4FromIpv6(normalized: string): string | null {
  // Handle ::ffff:a.b.c.d
  const dottedMatch = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i.exec(
    normalized,
  );
  if (dottedMatch?.[1]) {
    return dottedMatch[1];
  }

  // Handle ::ffff:xxxx:yyyy
  const hexMatch = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(normalized);
  if (hexMatch) {
    const hi = parseInt(hexMatch[1], 16);
    const lo = parseInt(hexMatch[2], 16);
    return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
  }

  return null;
}

export function isBlockedIpAddress(rawIp: string): boolean {
  const ip = rawIp.split("%")[0].trim().toLowerCase();
  const version = isIP(ip);
  if (version === 4) {
    return isBlockedIpv4(ip);
  }

  if (version === 6) {
    if (ip === "::" || ip === "::1") return true;
    const mappedV4 = extractMappedIpv4FromIpv6(ip);
    if (mappedV4) {
      return isBlockedIpv4(mappedV4);
    }

    // Expand leading group to inspect prefix reliably
    const groups = ip.split(":");
    const firstHex = groups[0] ? parseInt(groups[0], 16) : 0;
    if (Number.isNaN(firstHex)) return true;

    // fc00::/7 Unique Local IPv6
    if ((firstHex & 0xfe00) === 0xfc00) return true;
    // fe80::/10 Link-local IPv6
    if ((firstHex & 0xffc0) === 0xfe80) return true;
    // ff00::/8 Multicast
    if ((firstHex & 0xff00) === 0xff00) return true;

    return false;
  }

  return true;
}

function isHostnameAllowedByList(
  hostname: string,
  allowlistRaw?: string,
): boolean {
  if (!allowlistRaw?.trim()) return true;
  const allowedHosts = allowlistRaw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  if (allowedHosts.length === 0) return true;

  const target = hostname.toLowerCase();
  return allowedHosts.some(
    (allowed) => target === allowed || target.endsWith(`.${allowed}`),
  );
}

export async function validateExternalHttpsUrl(
  rawUrl: string,
  options?: {
    allowedHosts?: string;
    dnsLookup?: typeof lookup;
  },
): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfValidationError("INVALID_URL", "URL không hợp lệ.");
  }

  if (parsed.protocol !== "https:") {
    throw new SsrfValidationError(
      "DISALLOWED_PROTOCOL",
      "Chỉ chấp nhận giao thức HTTPS.",
    );
  }

  if (parsed.username || parsed.password) {
    throw new SsrfValidationError(
      "DISALLOWED_HOST",
      "URL không được chứa thông tin đăng nhập.",
    );
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new SsrfValidationError(
      "DISALLOWED_HOST",
      "Không được phép truy cập địa chỉ nội bộ.",
    );
  }

  if (!isHostnameAllowedByList(hostname, options?.allowedHosts)) {
    throw new SsrfValidationError(
      "DISALLOWED_HOST",
      "Tên miền nguồn chưa nằm trong danh sách cho phép.",
    );
  }

  if (isIP(hostname) !== 0) {
    if (isBlockedIpAddress(hostname)) {
      throw new SsrfValidationError(
        "BLOCKED_IP",
        "Địa chỉ IP thuộc dải nội bộ hoặc bị hạn chế.",
      );
    }
    return parsed;
  }

  const resolveDns = options?.dnsLookup ?? lookup;
  let records: Array<{ address: string; family: number }>;
  try {
    records = await resolveDns(hostname, { all: true });
  } catch {
    throw new SsrfValidationError(
      "DISALLOWED_HOST",
      "Không thể phân giải tên miền nguồn.",
    );
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw new SsrfValidationError(
      "DISALLOWED_HOST",
      "Tên miền nguồn không trả về địa chỉ hợp lệ.",
    );
  }

  for (const record of records) {
    if (isBlockedIpAddress(record.address)) {
      throw new SsrfValidationError(
        "BLOCKED_IP",
        "Tên miền nguồn trỏ tới địa chỉ IP nội bộ bị chặn.",
      );
    }
  }

  return parsed;
}

export async function safeFetchExternalJson(
  rawUrl: string,
  options?: {
    allowedHosts?: string;
    maxBytes?: number;
    timeoutMs?: number;
    dnsLookup?: typeof lookup;
    fetchImpl?: typeof fetch;
  },
): Promise<{ validatedUrl: string; data: unknown }> {
  const maxBytes = options?.maxBytes ?? 2 * 1024 * 1024;
  const timeoutMs = options?.timeoutMs ?? 8_000;
  const fetchFn = options?.fetchImpl ?? fetch;

  const validated = await validateExternalHttpsUrl(rawUrl, {
    allowedHosts: options?.allowedHosts,
    dnsLookup: options?.dnsLookup,
  });

  let response: Response;
  try {
    response = await fetchFn(validated.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    if (error instanceof SsrfValidationError) throw error;
    throw new SsrfValidationError(
      "FETCH_FAILED",
      "Không thể tải dữ liệu từ nguồn được chỉ định.",
    );
  }

  if (response.status >= 300 && response.status < 400) {
    throw new SsrfValidationError(
      "REDIRECT_BLOCKED",
      "Chuyển hướng HTTP từ máy chủ ngoài bị từ chối.",
    );
  }

  if (!response.ok) {
    throw new SsrfValidationError(
      "FETCH_FAILED",
      `Máy chủ nguồn trả về mã lỗi HTTP ${response.status}.`,
    );
  }

  const declaredLength = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new SsrfValidationError(
      "PAYLOAD_TOO_LARGE",
      "Tệp nguồn vượt quá giới hạn dung lượng 2MB.",
    );
  }

  if (!response.body) {
    throw new SsrfValidationError("INVALID_JSON", "Phản hồi từ nguồn rỗng.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new SsrfValidationError(
        "PAYLOAD_TOO_LARGE",
        "Tệp nguồn vượt quá giới hạn dung lượng 2MB.",
      );
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(combined);
    const data = JSON.parse(text);
    return { validatedUrl: validated.toString(), data };
  } catch {
    throw new SsrfValidationError(
      "INVALID_JSON",
      "Nội dung trả về không phải JSON UTF-8 hợp lệ.",
    );
  }
}
