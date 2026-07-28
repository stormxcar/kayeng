"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen, BrainCircuit, ChevronRight, CircleUserRound, Clock3, Compass,
  GraduationCap, History, Home, Languages, Library,
  Menu, MessageCircle, Mic2, Search, Sparkles, SpellCheck2, AudioLines,
  Target, Trophy, X,
} from "lucide-react";

const primary = [
  { href: "/", icon: Home, label: "Hôm nay" },
  { href: "/learn", icon: GraduationCap, label: "Học" },
  { href: "/practice", icon: Mic2, label: "Luyện tập" },
  { href: "/dictionary", icon: Search, label: "Tra cứu" },
];

const groups = [
  {
    label: "Học tập", icon: BookOpen,
    links: [
      { href: "/learn", label: "Lộ trình A0–C2", icon: GraduationCap },
      { href: "/topics", label: "Học theo chủ đề", icon: Compass },
      { href: "/grammar", label: "Ngữ pháp", icon: SpellCheck2 },
      { href: "/pronunciation", label: "Bảng IPA & phát âm", icon: AudioLines },
      { href: "/practice", label: "Phát âm & hội thoại", icon: MessageCircle },
    ],
  },
  {
    label: "Khám phá", icon: Sparkles,
    links: [
      { href: "/dictionary", label: "Từ điển Anh–Việt", icon: Languages },
      { href: "/tests", label: "Kiểm tra", icon: BrainCircuit },
      { href: "/library", label: "Thư viện", icon: Library },
      { href: "/history", label: "Lịch sử học", icon: History },
    ],
  },
  {
    label: "Cá nhân", icon: Target,
    links: [
      { href: "/review", label: "Ôn tập thông minh", icon: Clock3 },
      { href: "/achievements", label: "Thành tích", icon: Trophy },
      { href: "/profile", label: "Hồ sơ & mục tiêu", icon: CircleUserRound },
    ],
  },
];

export function AppNav() {
  const pathname = usePathname();
  const [explore, setExplore] = useState(false);
  const selected = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="bottom-nav" aria-label="Điều hướng chính" data-tour="navigation">
        {primary.map((item) => (
          <Link key={item.href} href={item.href} className={selected(item.href) ? "selected" : ""} data-tooltip={item.label}>
            <span><item.icon size={22} strokeWidth={selected(item.href) ? 2.5 : 2} /></span>{item.label}
          </Link>
        ))}
        <button className={explore ? "selected explore-trigger" : "explore-trigger"} onClick={() => setExplore(true)} data-tooltip="Khám phá">
          <span><Menu size={22} /></span>Khám phá
        </button>
      </nav>

      <div className={`explore-sheet-backdrop ${explore ? "open" : ""}`} onClick={() => setExplore(false)} />
      <aside className={`explore-sheet ${explore ? "open" : ""}`} aria-hidden={!explore}>
        <header><div><small>KHÔNG GIAN KAYENG</small><h2>Khám phá</h2></div><button onClick={() => setExplore(false)} aria-label="Đóng menu"><X size={22} /></button></header>
        <div className="explore-groups">
          {groups.map((group) => (
            <section key={group.label}>
              <h3><group.icon size={17} />{group.label}</h3>
              {group.links.map((link) => (
                <Link href={link.href} key={link.href} onClick={() => setExplore(false)}>
                  <span><link.icon size={19} /></span><b>{link.label}</b><ChevronRight size={16} />
                </Link>
              ))}
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
