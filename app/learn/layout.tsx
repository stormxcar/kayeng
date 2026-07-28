import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khóa học tiếng Anh giao tiếp | Kayeng English",
  description: "Lộ trình tiếng Anh giao tiếp theo CEFR với bài học từ vựng, phát âm và hội thoại thực tế.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
