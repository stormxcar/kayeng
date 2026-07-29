"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const startedAt = useRef(0);
  const targetPath = useRef<string | null>(null);
  const delayTimer = useRef<number | null>(null);

  useEffect(() => {
    const start = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || `${target.pathname}${target.search}` === `${location.pathname}${location.search}`) return;
      targetPath.current = target.pathname;
      if (delayTimer.current) window.clearTimeout(delayTimer.current);
      delayTimer.current = window.setTimeout(() => {
        startedAt.current = Date.now();
        setActive(true);
      }, 150);
    };
    const pop = () => {
      targetPath.current = null;
      if (delayTimer.current) window.clearTimeout(delayTimer.current);
      delayTimer.current = window.setTimeout(() => {
        startedAt.current = Date.now();
        setActive(true);
      }, 150);
    };
    document.addEventListener("click", start, true);
    window.addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", start, true);
      window.removeEventListener("popstate", pop);
      if (delayTimer.current) window.clearTimeout(delayTimer.current);
    };
  }, []);

  useEffect(() => {
    if (targetPath.current && targetPath.current !== pathname) return;
    if (delayTimer.current) {
      window.clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    if (!active) return;
    const remaining = Math.max(0, 380 - (Date.now() - startedAt.current));
    const timer = window.setTimeout(() => setActive(false), remaining);
    return () => window.clearTimeout(timer);
  }, [pathname, active]);

  return (
    <div className={`navigation-progress ${active ? "active" : ""}`} aria-hidden={!active} aria-label="Đang chuyển trang">
      <i />
      <div className="navigation-transition-card"><span /><span /><span /></div>
    </div>
  );
}
