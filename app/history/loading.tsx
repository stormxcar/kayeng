export default function HistoryLoading() {
  return <div className="route-skeleton">{[1,2,3,4].map((item) => <div className="skeleton history-skeleton" key={item} />)}</div>;
}
