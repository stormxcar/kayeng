import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch sử học tập | Kayeng English",
  description: "Xem lại bài đã học, bản ghi luyện nói và tiến bộ tiếng Anh của bạn.",
  robots: { index: false, follow: false },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
