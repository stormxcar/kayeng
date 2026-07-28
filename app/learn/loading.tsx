export default function LearnLoading() {
  return (
    <div className="route-skeleton" aria-busy="true">
      <div className="skeleton" style={{ width: 240, height: 40 }} />
      <div className="course-grid">
        {[1, 2, 3].map((item) => <div key={item} className="skeleton course-skeleton" />)}
      </div>
    </div>
  );
}
