"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AppNav } from "./AppNav";
import { useAuth } from "@/lib/hooks/use-auth";

export function PageShell({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { profile } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"), []);
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("kayeng-theme", next);
  }
  return (
    <main className="web-app-main">
      <aside className="web-sidebar">
        <Link href="/" className="brand-link"><span className="brand-mark">K</span> Kayeng</Link>
        <AppNav />
      </aside>
      <section className="web-page">
        <header className="page-header">
          <div><p className="section-kicker">{eyebrow}</p><h1>{title}</h1></div>
          <div className="page-actions">
            {actions}
            <button className="theme-toggle" data-tooltip="Đổi giao diện" onClick={toggleTheme} aria-label={`Chuyển sang giao diện ${theme === "light" ? "tối" : "sáng"}`}>{theme === "light" ? "◐" : "☀"}</button>
            <Link href="/profile" className="avatar" data-tooltip="Hồ sơ cá nhân" data-tour="profile">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.display_name || "K").slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <div className="page-content">{children}</div>
        <AppNav />
      </section>
    </main>
  );
}
