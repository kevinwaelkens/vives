import { redirect } from "next/navigation";

// Force redeploy with connection pooler - v3
export default function HomePage() {
  redirect("/login");
}
