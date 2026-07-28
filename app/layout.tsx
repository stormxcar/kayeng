import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kayeng English — Luyện nói mỗi ngày",
  description: "Lộ trình tiếng Anh giao tiếp cá nhân hóa với phản hồi phát âm tức thì.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Kayeng English — Nói thật. Tiến bộ thật.",
    description: "15 phút mỗi ngày để biến tiếng Anh thành phản xạ tự nhiên.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kayeng English" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kayeng English — Nói thật. Tiến bộ thật.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
