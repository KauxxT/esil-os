"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (!error) {
        router.replace("/dashboard");
      } else {
        console.error("Auth error:", error.message);
        router.replace("/login");
      }
    };

    handleAuth();
  }, []);

  return <p>Logging in...</p>;
}