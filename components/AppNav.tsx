"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "⌂", label: "Hôm nay" },
  { href: "/learn", icon: "▤", label: "Học" },
  { href: "/practice", icon: "●", label: "Luyện nói" },
  { href: "/history", icon: "↻", label: "Lịch sử" },
  { href: "/profile", icon: "◒", label: "Hồ sơ" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính" data-tour="navigation">
      {items.map((item) => {
        const selected = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={selected ? "selected" : ""} data-tooltip={item.label}>
            <span>{item.icon}</span>{item.label}
          </Link>
        );
      })}
    </nav>
  );
}
