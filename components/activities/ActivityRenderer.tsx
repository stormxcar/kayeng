"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, Volume2, XCircle } from "lucide-react";

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
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const options = Array.isArray(activity.content.options) ? activity.content.options.map(String) : [];
  const correctAnswer = String(activity.content.correct_answer || activity.content.answer || "");
  const isCorrect = useMemo(() => !correctAnswer || answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase(), [answer, correctAnswer]);
  if (activity.activity_type === "speaking" || activity.activity_type === "pronunciation") {
    return <VoiceActivity activity={activity} onComplete={(score) => onSubmit({ recorded: true }, score, score >= 60)} />;
  }
  if (activity.activity_type === "roleplay") {
    return <RoleplayActivity activity={activity} onComplete={() => onSubmit({ roleplay: true }, 100, true)} />;
  }

  const words = Array.isArray(activity.content.words) ? (activity.content.words as string[]) : [];
  const interactiveType = ["multiple_choice", "fill_blank", "quiz"].includes(activity.activity_type) || options.length > 0 || Boolean(activity.content.correct_answer);
  return (
    <div className="activity-panel">
      <p className="activity-type">{activity.activity_type.toUpperCase()}</p>
      <h2>{activity.title}</h2>
      <p>{activity.instructions}</p>
      {words.length > 0 && (
        <div className="word-grid">
          {words.map((word) => <button type="button" key={word} onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(word))}><span><Volume2 size={17} /></span>{word}</button>)}
        </div>
      )}
      {interactiveType && options.length > 0 && <div className="answer-options">{options.map((option) => <button type="button" className={answer === option ? "selected" : ""} disabled={checked} onClick={() => setAnswer(option)} key={option}>{option}</button>)}</div>}
      {interactiveType && options.length === 0 && <input className="fill-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={checked} placeholder="Nhập câu trả lời của bạn…" />}
      {checked && <div className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`}>{isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}<div><b>{isCorrect ? "Chính xác!" : `Đáp án: ${correctAnswer}`}</b><p>{String(activity.content.explanation || "Hãy xem lại ghi chú và thử áp dụng trong một câu mới.")}</p></div></div>}
      <div className="guided-example">
        <span><Lightbulb size={14} /> GHI NHỚ</span>
        <p>{String(activity.content.example || "Hãy đọc, nghe và sử dụng nội dung này trong một câu của riêng bạn.")}</p>
      </div>
      {interactiveType && !checked ? <button className="lesson-primary" disabled={!answer} onClick={() => setChecked(true)}>Kiểm tra</button> :
        <button className="lesson-primary" onClick={() => onSubmit({ answer: answer || "reviewed" }, interactiveType ? (isCorrect ? 100 : 30) : 100, interactiveType ? isCorrect : true)}>Hoàn thành hoạt động</button>}
    </div>
  );
}
