import { redirect } from "next/navigation";

// Force redeploy with serverless-optimized connection - v5
export default function HomePage() {
  redirect("/login");
}
