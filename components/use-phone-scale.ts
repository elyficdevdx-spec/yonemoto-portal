"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export function usePhoneScale(mode: "pc" | "sp") {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (mode !== "sp") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const top = canvas.getBoundingClientRect().top;
      const height = window.innerHeight - Math.max(0, top) - 80;
      const width = canvas.clientWidth - 40;
      setScale(Math.max(0.1, Math.min(1, height / 744, width / 399)));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    return () => { observer.disconnect(); window.removeEventListener("resize", resize); };
  }, [mode]);
  return { canvasRef, phoneStyle: { "--phone-scale": scale } as CSSProperties };
}
