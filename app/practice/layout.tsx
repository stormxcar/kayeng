import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện nói tiếng Anh | Kayeng English",
  description: "Ghi âm, nghe lại và nhận phản hồi phát âm trong các tình huống giao tiếp.",
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
