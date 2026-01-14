"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/assets/loading.json";
import HomeComponent from "@/components/Home";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Simulasi loading selama 2 detik
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 50);
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

  return <HomeComponent fadeIn={fadeIn} />;
}
