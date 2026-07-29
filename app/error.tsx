"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, House, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kayeng route error", error);
  }, [error]);

  return (
    <main className="error-boundary">
      <section>
        <span className="error-illustration"><CircleAlert size={38} /></span>
        <p className="section-kicker">BÀI HỌC TẠM GIÁN ĐOẠN</p>
        <h1>Kayeng chưa thể mở nội dung này</h1>
        <p>Tiến độ đã lưu của bạn không bị ảnh hưởng. Hãy thử tải lại nội dung hoặc quay về trang Hôm nay.</p>
        <div>
          <button type="button" onClick={reset}><RotateCcw size={17} /> Thử lại</button>
          <Link href="/"><House size={17} /> Về Hôm nay</Link>
        </div>
        {error.digest && <small>Mã tham chiếu: {error.digest}</small>}
      </section>
    </main>
  );
}
