"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/assets/loading.json";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading selama 2 detik
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="w-64 h-64">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-6xl font-bold tracking-tight text-black dark:text-white">
          oursee
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          Welcome to oursee
        </p>
      </main>
    </div>
  );
}
