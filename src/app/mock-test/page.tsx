import { redirect } from "next/navigation";

export default function LegacyMockTestRedirectPage() {
  redirect("/mock-tests");
}
