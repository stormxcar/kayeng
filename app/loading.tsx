export default function Loading() {
  return (
    <main aria-label="Đang mở nội dung" aria-busy="true">
      <section className="desktop-rail">
        <div className="skeleton" style={{ width: 48, height: 48 }} />
        <div>
          <div className="skeleton skeleton-line short" />
          <div className="skeleton" style={{ width: "85%", height: 150 }} />
        </div>
        <div className="skeleton skeleton-line" />
      </section>
      <section className="page-skeleton">
        <div className="page-skeleton-head">
          <div className="skeleton" style={{ width: 220, height: 48 }} />
          <div className="skeleton" style={{ width: 46, height: 46, borderRadius: "50%" }} />
        </div>
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-card" />
      </section>
    </main>
  );
}
