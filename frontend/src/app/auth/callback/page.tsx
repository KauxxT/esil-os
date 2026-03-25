"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Слушаем изменение сессии
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace("/dashboard"); // редирект после успешного логина
        }
      }
    );

    // Проверяем сессию сразу на случай, если токен уже в localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        setLoading(false); // нет сессии — остаёмся на странице
      }
    });

    // Чистим подписку при размонтировании
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <p>{loading ? "Logging in..." : "Redirecting..."}</p>;
}