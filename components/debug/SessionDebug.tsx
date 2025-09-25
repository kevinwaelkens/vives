"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function SessionDebug() {
  const { data: session, status } = useSession();
  const [hasCookies, setHasCookies] = useState<boolean | null>(null);

  useEffect(() => {
    // Check cookies on client side only
    if (typeof window !== "undefined") {
      const cookieCheck = document.cookie.includes("next-auth");
      setHasCookies(cookieCheck);

      console.log("🔍 Session Debug:", {
        status,
        session,
        cookies: document.cookie,
        hasCookies: cookieCheck,
        timestamp: new Date().toISOString(),
      });
    }
  }, [session, status]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
      <div>Status: {status}</div>
      <div>User: {session?.user?.email || "None"}</div>
      <div>Role: {session?.user?.role || "None"}</div>
      <div>
        Cookies: {hasCookies === null ? "⏳" : hasCookies ? "✅" : "❌"}
      </div>
    </div>
  );
}
