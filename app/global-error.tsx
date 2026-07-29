"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui" }}>
          <section style={{ maxWidth: 560, textAlign: "center" }}>
            <p>KAYENG ENGLISH</p>
            <h1>Ứng dụng vừa gặp sự cố</h1>
            <p>Hãy thử khởi động lại giao diện. Dữ liệu học tập đã lưu trên tài khoản không bị xóa.</p>
            <button type="button" onClick={reset}>Khởi động lại</button>
          </section>
        </main>
      </body>
    </html>
  );
}
