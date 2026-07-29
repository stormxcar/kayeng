"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

export function RuntimeQuality() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: location.pathname,
    });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/vitals", body);
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Kayeng service worker registration failed", error);
    });
  }, []);

  return null;
}
