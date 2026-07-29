"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Headphones, RotateCcw, Volume2 } from "lucide-react";
import type { Activity } from "./ActivityRenderer";

const normalized = (value: unknown) => String(value ?? "").trim().toLocaleLowerCase("en");

export default function StructuredActivity({
  activity,
  onSubmit,
}: {
  activity: Activity;
  onSubmit: (answer: Record<string, unknown>, score: number, correct: boolean) => Promise<void>;
}) {
  const content = activity.content;
  const type = activity.activity_type;
  const options = Array.isArray(content.options) ? content.options.map((item) =>
    typeof item === "object" && item ? item as Record<string, unknown> : { label: String(item), value: String(item) }
  ) : [];
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [order, setOrder] = useState<string[]>(() =>
    Array.isArray(content.items) ? content.items.map(String) : Array.isArray(content.correct_order) ? [...content.correct_order].map(String).reverse() : []
  );
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const correctValues = useMemo(() => {
    if (Array.isArray(content.correct_answers)) return content.correct_answers.map(normalized).sort();
    if (Array.isArray(content.correct_order)) return content.correct_order.map(normalized);
    return [normalized(content.correct_answer ?? content.answer)].filter(Boolean);
  }, [content]);

  const evaluation = useMemo(() => {
    if (type === "multiple_select") {
      const answer = selected.map(normalized).sort();
      return answer.length === correctValues.length && answer.every((item, index) => item === correctValues[index]);
    }
    if (type === "ordering") return order.map(normalized).every((item, index) => item === correctValues[index]);
    if (type === "matching") {
      const pairs = Array.isArray(content.pairs) ? content.pairs as Array<{ left: string; right: string }> : [];
      return pairs.length > 0 && pairs.every((pair) => normalized(matches[pair.left]) === normalized(pair.right));
    }
    if (["essay", "short_answer"].includes(type)) return text.trim().length >= (type === "essay" ? 80 : 12);
    return correctValues.includes(normalized(selected[0] || text));
  }, [content.pairs, correctValues, matches, order, selected, text, type]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function submit() {
    if (!checked) {
      setChecked(true);
      return;
    }
    setSubmitting(true);
    await onSubmit({ selected, text, order, matches }, evaluation ? 100 : 30, evaluation);
    setSubmitting(false);
    if (!evaluation) {
      setChecked(false);
      setSelected([]);
      setText("");
    }
  }

  const passages = Array.isArray(content.passages) ? content.passages.map(String) : content.passage ? [String(content.passage)] : [];
  const pairs = Array.isArray(content.pairs) ? content.pairs as Array<{ left: string; right: string }> : [];
  const rightOptions = [...new Set(pairs.map((pair) => pair.right))];
  const isText = ["dictation", "essay", "short_answer", "reading"].includes(type);

  return (
    <div className="activity-panel structured-activity">
      <p className="activity-type">{type.replaceAll("_", " ").toUpperCase()}</p>
      <h2>{activity.title}</h2>
      <p>{activity.instructions}</p>

      {type === "video_checkpoint" && Boolean(content.videoUrl) && (
        <video controls preload="metadata" playsInline src={String(content.videoUrl)}>
          Trình duyệt của bạn chưa hỗ trợ video HTML5.
        </video>
      )}
      {type === "dictation" && (
        <button className="structured-listen" onClick={() => {
          const utterance = new SpeechSynthesisUtterance(String(content.audioText || content.referenceText || content.correct_answer || ""));
          utterance.lang = "en-US";
          speechSynthesis.speak(utterance);
        }}><Headphones /> Nghe câu</button>
      )}
      {passages.length > 0 && <div className="reading-passages">{passages.map((passage, index) => <article key={index}><small>ĐOẠN {index + 1}</small><p>{passage}</p></article>)}</div>}

      {type === "multiple_select" && <div className="answer-options">{options.map((option) => {
        const value = String(option.value ?? option.label);
        return <button type="button" aria-pressed={selected.includes(value)} className={selected.includes(value) ? "selected" : ""} onClick={() => !checked && setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])} key={value}>{String(option.label ?? value)}</button>;
      })}</div>}

      {type === "image_choice" && <div className="image-choice-grid">{options.map((option) => {
        const value = String(option.value ?? option.label);
        return <button type="button" className={selected[0] === value ? "selected" : ""} onClick={() => !checked && setSelected([value])} key={value}>
          {Boolean(option.image) && <Image src={String(option.image)} alt={String(option.alt || option.label || "")} width={320} height={200} sizes="(max-width: 620px) 100vw, 45vw" />}
          <span>{String(option.label ?? value)}</span>
        </button>;
      })}</div>}

      {["video_checkpoint", "reading"].includes(type) && options.length > 0 && <div className="answer-options">{options.map((option) => {
        const value = String(option.value ?? option.label);
        return <button type="button" className={selected[0] === value ? "selected" : ""} onClick={() => !checked && setSelected([value])} key={value}>{String(option.label ?? value)}</button>;
      })}</div>}

      {type === "ordering" && <ol className="ordering-list">{order.map((item, index) => <li key={`${item}-${index}`}><span>{index + 1}</span><b>{item}</b><button onClick={() => move(index, -1)} disabled={checked || index === 0} aria-label={`Đưa ${item} lên`}><ArrowUp /></button><button onClick={() => move(index, 1)} disabled={checked || index === order.length - 1} aria-label={`Đưa ${item} xuống`}><ArrowDown /></button></li>)}</ol>}

      {type === "matching" && <div className="matching-list">{pairs.map((pair) => <label key={pair.left}><b>{pair.left}</b><select disabled={checked} value={matches[pair.left] || ""} onChange={(event) => setMatches((current) => ({ ...current, [pair.left]: event.target.value }))}><option value="">Chọn cặp phù hợp</option>{rightOptions.map((right) => <option value={right} key={right}>{right}</option>)}</select></label>)}</div>}

      {isText && <label className="structured-text"><span>{type === "essay" ? "Bài viết của bạn" : "Câu trả lời"}</span><textarea value={text} disabled={checked} minLength={type === "essay" ? 80 : 1} maxLength={type === "essay" ? 2000 : 500} onChange={(event) => setText(event.target.value)} /><small>{text.length}/{type === "essay" ? 2000 : 500}</small></label>}

      {checked && <div className={`answer-feedback ${evaluation ? "correct" : "wrong"}`} role="status" aria-live="polite"><CheckCircle2/><div><b>{evaluation ? "Hoàn thành tốt" : "Chưa chính xác"}</b><p>{String(content.explanation || (evaluation ? "Kết quả đã sẵn sàng để lưu." : "Xem lại yêu cầu rồi thử một lần nữa."))}</p></div></div>}
      <button className="lesson-primary" disabled={submitting || (!selected.length && !text.trim() && !order.length && !Object.keys(matches).length)} onClick={() => void submit()}>{submitting ? <span className="spinner" aria-label="Đang lưu kết quả"/> : checked ? evaluation ? "Lưu và tiếp tục" : <><RotateCcw/> Thử lại</> : "Kiểm tra"}</button>
      {Boolean(content.referenceText) && <button className="structured-reference-audio" onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(String(content.referenceText)))}><Volume2/> Nghe câu mẫu</button>}
    </div>
  );
}
