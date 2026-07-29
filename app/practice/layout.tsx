import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trung tâm luyện tập tiếng Anh | Kayeng English",
  description: "Luyện nghe, nói, đọc, viết, phát âm và hội thoại theo trình độ A0–C2.",
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
