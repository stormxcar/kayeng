"use client";

import dynamic from "next/dynamic";

const VoiceActivity = dynamic(() => import("./VoiceActivity"), {
  loading: () => <div className="skeleton activity-skeleton" />,
  ssr: false,
});
const RoleplayActivity = dynamic(() => import("./RoleplayActivity"), {
  loading: () => <div className="skeleton activity-skeleton" />,
  ssr: false,
});

export type Activity = {
  id: string;
  activity_type: string;
  title: string;
  instructions: string | null;
  content: Record<string, unknown>;
};

export function ActivityRenderer({
  activity,
  onSubmit,
}: {
  activity: Activity;
  onSubmit: (answer: Record<string, unknown>, score: number, correct: boolean) => Promise<void>;
}) {
  if (activity.activity_type === "speaking" || activity.activity_type === "pronunciation") {
    return <VoiceActivity activity={activity} onComplete={(score) => onSubmit({ recorded: true }, score, score >= 60)} />;
  }
  if (activity.activity_type === "roleplay") {
    return <RoleplayActivity activity={activity} onComplete={() => onSubmit({ roleplay: true }, 100, true)} />;
  }

  const words = Array.isArray(activity.content.words) ? (activity.content.words as string[]) : [];
  return (
    <div className="activity-panel">
      <p className="activity-type">{activity.activity_type.toUpperCase()}</p>
      <h2>{activity.title}</h2>
      <p>{activity.instructions}</p>
      {words.length > 0 && (
        <div className="word-grid">
          {words.map((word) => <button type="button" key={word} onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(word))}><span>◉</span>{word}</button>)}
        </div>
      )}
      <div className="guided-example">
        <span>GHI NHỚ</span>
        <p>{String(activity.content.example || "Hãy đọc, nghe và sử dụng nội dung này trong một câu của riêng bạn.")}</p>
      </div>
      <button className="lesson-primary" onClick={() => onSubmit({ reviewed: true }, 100, true)}>Hoàn thành hoạt động</button>
    </div>
  );
}
