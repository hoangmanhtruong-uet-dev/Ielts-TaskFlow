"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { VocabHighlightPopover } from "./vocab-highlight-popover";

import { isSafeContentHref } from "@/features/learning/model";

export function LessonMarkdown({ children }: { children: string }) {
  return (
    <div className="lesson-markdown relative">
      <VocabHighlightPopover />
      <ReactMarkdown
        skipHtml
        rehypePlugins={[rehypeHighlight]}
        components={{
          a({ href, children: linkChildren }) {
            if (!isSafeContentHref(href)) {
              return <span>{linkChildren}</span>;
            }

            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="font-semibold text-[var(--primary)] underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              >
                {linkChildren}
              </a>
            );
          },
          p({ children: paragraphChildren }) {
            return (
              <p className="text-base leading-8 text-pretty text-[var(--foreground)] sm:text-[1.0625rem]">
                {paragraphChildren}
              </p>
            );
          },
          strong({ children: strongChildren }) {
            return <strong className="font-bold">{strongChildren}</strong>;
          },
          ul({ children: listChildren }) {
            return (
              <ul className="my-5 list-disc space-y-2 pl-6 marker:text-[var(--primary)]">
                {listChildren}
              </ul>
            );
          },
          ol({ children: listChildren }) {
            return (
              <ol className="my-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-[var(--primary)]">
                {listChildren}
              </ol>
            );
          },
          li({ children: itemChildren }) {
            return (
              <li className="pl-1 leading-7 text-[var(--foreground)]">
                {itemChildren}
              </li>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
