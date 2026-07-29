import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ôn lại lỗi sai | Kayeng English",
  description: "Luyện lại những activity tiếng Anh bạn từng trả lời chưa đúng.",
  robots: { index: false, follow: false },
};

export default function MistakesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
