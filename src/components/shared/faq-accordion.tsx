"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-1 transition-colors sm:px-6"
            style={{
              backgroundColor: isOpen
                ? "var(--primary-subtle)"
                : "var(--background)",
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-3 text-left font-extrabold focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              aria-expanded={isOpen}
            >
              {item.question}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="shrink-0 text-[var(--primary)]"
              >
                <ChevronDown aria-hidden="true" size={22} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-5 leading-7 text-[var(--muted-foreground)]">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
