"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintReportButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="h-11 rounded-xl bg-indigo-600 px-5 font-bold text-white shadow-sm hover:bg-indigo-700 print:hidden"
    >
      <Printer aria-hidden="true" size={16} className="mr-2" />
      In / Lưu PDF
    </Button>
  );
}
