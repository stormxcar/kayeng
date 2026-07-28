export default function CourseLoading() {
  return <div className="route-skeleton"><div className="skeleton hero-skeleton" />{[1,2,3].map((item) => <div className="skeleton unit-skeleton" key={item} />)}</div>;
}
