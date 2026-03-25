"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setAuth } from "@/lib/auth";
import api from "@/lib/api";

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState("Входим в систему...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase implicit flow кладёт токен в #hash
        // supabase-js автоматически читает его из window.location.hash
        // Нам нужно подождать пока он это сделает
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setStatus("Ошибка сессии. Перенаправляем...");
          setTimeout(() => router.replace("/login"), 2000);
          return;
        }

        if (!session) {
          // Supabase ещё не успел обработать хэш — подпишемся на событие
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (newSession) {
                subscription.unsubscribe();
                await exchangeToken(newSession);
              }
            }
          );

          // Таймаут на случай если событие не пришло
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus("Не удалось войти. Перенаправляем...");
            setTimeout(() => router.replace("/login"), 1500);
          }, 10000);

          return;
        }

        await exchangeToken(session);
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("Ошибка. Перенаправляем...");
        setTimeout(() => router.replace("/login"), 2000);
      }
    };

    const exchangeToken = async (session: any) => {
      try {
        setStatus("Получаем данные пользователя...");

        const res = await api.post("/auth/google/token", {
          access_token: session.access_token,
          user: {
            email: session.user.email,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email,
          },
        });

        setAuth(res.data.access_token, res.data.user);
        setStatus("Успешно! Перенаправляем...");
        router.replace("/dashboard");
      } catch (err: any) {
        console.error("Token exchange error:", err);
        setStatus("Ошибка сервера. Перенаправляем...");
        setTimeout(() => router.replace("/login"), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
