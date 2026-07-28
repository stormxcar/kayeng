import type { Metadata } from "next";
import "./globals.css";
import { AppTour } from "@/components/AppTour";
import { GlobalTooltips } from "@/components/GlobalTooltips";

export const metadata: Metadata = {
  metadataBase: new URL("https://kayeng-english.nguyenkhaa223.chatgpt.site"),
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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('kayeng-theme')||((matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
      </head>
      <body>{children}<GlobalTooltips /><AppTour /></body>
    </html>
  );
}
