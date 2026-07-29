"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AppNav } from "./AppNav";
import { useAuth } from "@/lib/hooks/use-auth";
import { Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";

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
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light"
  );
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("kayeng-sidebar") === "collapsed"
  );
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("kayeng-theme", next);
  }
  function toggleSidebar() {
    setCollapsed((current) => {
      localStorage.setItem("kayeng-sidebar", current ? "expanded" : "collapsed");
      return !current;
    });
  }
  return (
    <main className={`web-app-main ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="web-sidebar">
        <div className="sidebar-brand-row"><Link href="/" className="brand-link"><span className="brand-mark">K</span><b>Kayeng</b></Link><button onClick={toggleSidebar} aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"} data-tooltip={collapsed ? "Mở rộng" : "Thu gọn"}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button></div>
        <AppNav />
      </aside>
      <section className="web-page" id="main-content" tabIndex={-1}>
        <header className="page-header">
          <div><p className="section-kicker">{eyebrow}</p><h1>{title}</h1></div>
          <div className="page-actions">
            {actions}
            <button className="theme-toggle" data-tooltip="Đổi giao diện" onClick={toggleTheme} aria-label={`Chuyển sang giao diện ${theme === "light" ? "tối" : "sáng"}`}>{theme === "light" ? <Moon size={20} /> : <Sun size={20} />}</button>
            <Link href="/profile" className="avatar" data-tooltip="Hồ sơ cá nhân" data-tour="profile">
              {profile?.avatar_url ? <Image src={profile.avatar_url} alt="" width={46} height={46} sizes="46px" /> : (profile?.display_name || "K").slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <div className="page-content">{children}</div>
        <AppNav />
      </section>
    </main>
  );
}
