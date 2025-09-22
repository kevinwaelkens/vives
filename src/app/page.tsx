import { redirect } from "next/navigation";

// Force redeploy with connection pooler + SSL - v4
export default function HomePage() {
  redirect("/login");
}
