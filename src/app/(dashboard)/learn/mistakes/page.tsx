import { redirect } from "next/navigation";

export default function LegacyMistakesRedirectPage() {
  redirect("/error-notebook");
}
