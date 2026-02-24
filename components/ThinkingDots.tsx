"use client";

import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";

type LottieData = Record<string, unknown>;

let cachedData: LottieData | null = null;
let inFlight: Promise<LottieData> | null = null;

async function loadDots(): Promise<LottieData> {
  if (cachedData) return cachedData;
  if (!inFlight) {
    inFlight = fetch("/lottie/loading-dots-blue.json")
      .then((r) => r.json())
      .then((json) => {
        cachedData = json;
        return json;
      });
  }
  return await inFlight;
}

interface Props {
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  label?: string;
}

export function ThinkingDots({
  size = 22,
  width,
  height,
  className,
  label = "Thinking…",
}: Props) {
  const [data, setData] = useState<LottieData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDots()
      .then((json) => {
        if (cancelled) return;
        setData(json);
      })
      .catch(() => {
        // If this fails, quietly render nothing; the rest of the UI still works.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const style = useMemo(
    () => ({
      width: width ?? size,
      height: height ?? size,
    }),
    [height, size, width]
  );

  if (!data) return null;

  return (
    <span
      className={className}
      role="status"
      aria-label={label}
      style={style}
    >
      <Lottie
        animationData={data}
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      />
    </span>
  );
}

export function preloadThinkingDots() {
  return loadDots().catch(() => null);
}

