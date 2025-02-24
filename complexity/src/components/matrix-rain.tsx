"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // After the null checks above, we can safely assert these variables won't be null
    const safeCanvas = canvas;
    const safeCtx = ctx;

    safeCanvas.width = window.innerWidth;
    safeCanvas.height = window.innerHeight;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()".split(
        ""
      );
    const fontSize = 14;
    const columns = safeCanvas.width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      safeCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
      safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height);

      safeCtx.fillStyle = "#00BFFF";
      safeCtx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        safeCtx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > safeCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      safeCanvas.width = window.innerWidth;
      safeCanvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
