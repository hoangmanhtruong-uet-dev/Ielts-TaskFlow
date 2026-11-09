"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "@/lib/validation/zod";

const reportIssueSchema = z.object({
  issueText: z.string().trim().min(5).max(1500),
  context: z.string().trim().min(1).max(200),
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function scrubPiiAndTokens(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      "[redacted-token]",
    );
}

export async function reportIssueToTelegramAction(
  issueText: string,
  context: string,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập để báo lỗi." };
  }

  const parsed = reportIssueSchema.safeParse({ issueText, context });
  if (!parsed.success) {
    return {
      success: false,
      message: "Nội dung báo lỗi cần từ 5 đến 1500 ký tự.",
    };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId =
    process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() ||
    process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return {
      success: false,
      message: "Kênh báo lỗi tự động hiện chưa được cấu hình.",
    };
  }

  const safeContext = escapeHtml(scrubPiiAndTokens(parsed.data.context));
  const safeIssue = escapeHtml(scrubPiiAndTokens(parsed.data.issueText));
  const text = `<b>Báo lỗi mới (Indigo Scholar)</b>\n\n<b>Ngữ cảnh:</b> ${safeContext}\n<b>Nội dung:</b> ${safeIssue}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5_000),
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Telegram API status ${res.status}`);
    }

    return { success: true, message: "Đã gửi báo lỗi thành công." };
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return { success: false, message: "Không thể gửi báo lỗi lúc này." };
  }
}
