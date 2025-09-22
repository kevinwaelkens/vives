import { redirect } from "next/navigation";

// Force redeploy for database connection
export default function HomePage() {
  redirect("/login");
}
