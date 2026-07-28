import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-orbit" aria-hidden="true"><span>4</span><i>✦</i><span>4</span></div>
      <p className="section-kicker">LẠC ĐƯỜNG RỒI</p>
      <h1>Oops, trang này<br />không tồn tại.</h1>
      <p>Có thể đường dẫn đã thay đổi. Hãy quay lại lộ trình học để tiếp tục streak hôm nay.</p>
      <div className="not-found-actions">
        <Link className="lesson-primary" href="/">Về trang chủ</Link>
        <Link className="secondary-link" href="/learn">Khám phá khóa học</Link>
      </div>
    </main>
  );
}
