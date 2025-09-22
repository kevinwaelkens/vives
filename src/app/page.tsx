import { redirect } from "next/navigation";

// Force redeploy with SSL fix - v2
export default function HomePage() {
  redirect("/login");
}
