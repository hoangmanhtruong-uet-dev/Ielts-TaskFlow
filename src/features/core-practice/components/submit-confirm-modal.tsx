"use client";

export function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  unansweredCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  unansweredCount: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl duration-200 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Xác nhận nộp bài
        </h3>

        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Bạn có chắc chắn muốn nộp bài? Kết quả sẽ không thể thay đổi sau khi
          nộp.
        </p>

        {unansweredCount > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            ⚠️ Bạn vẫn còn <strong>{unansweredCount}</strong> câu hỏi chưa trả
            lời.
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Làm tiếp
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
