"use client";

import { useEffect, useRef, useState } from "react";
import type { Activity } from "./ActivityRenderer";
import { startWavRecording, type WavRecorder } from "@/lib/audio/wav-recorder";
import { createClient } from "@/lib/supabase/client";
import { TaskOverlayBridge } from "@/components/TaskOverlay";
import { apiUrl } from "@/lib/runtime-api";

type Assessment = {
  score?: number;
  transcript?: string;
  words?: Array<{ word: string; accuracy?: number; errorType?: string }>;
  message?: string;
};

export default function VoiceActivity({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const recorder = useRef<WavRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const referenceText = String(activity.content.referenceText || activity.instructions || "");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function toggle() {
    if (!recording) {
      recorder.current = await startWavRecording();
      setRecording(true);
      setAssessment(null);
      return;
    }
    setRecording(false);
    const captured = await recorder.current?.stop();
    recorder.current = null;
    if (!captured || captured.durationMs < 1200) {
      setAssessment({ message: "Bản ghi quá ngắn. Hãy thử lại với một câu đầy đủ." });
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(captured.blob));
    if (captured.rmsDb < -48) {
      setAssessment({ message: "Âm lượng quá nhỏ hoặc chưa thu được giọng nói. Hãy đưa micro gần hơn và thử lại." });
      return;
    }
    if (captured.clippingRatio > .08) {
      setAssessment({ message: "Âm thanh bị vỡ do micro quá gần hoặc âm lượng quá lớn. Hãy lùi micro và ghi lại." });
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Hãy đăng nhập để lưu bài nói.");
      const signedResponse = await fetch(apiUrl("/api/recordings/signed-upload"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activityId: activity.id, durationMs: captured.durationMs, referenceText }),
      });
      const signed = await signedResponse.json();
      if (!signedResponse.ok) throw new Error(signed.error);
      const { error } = await supabase.storage.from("speaking-recordings").uploadToSignedUrl(signed.path, signed.token, captured.blob, { contentType: "audio/wav" });
      if (error) throw error;
      await supabase.from("audio_recordings").update({ status: "uploaded" }).eq("id", signed.recordingId);
      const response = await fetch(apiUrl("/api/assessments/pronunciation"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recordingId: signed.recordingId }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.code === "AZURE_NOT_CONFIGURED") {
          setAssessment({ message: "Bản ghi đã được lưu. Chấm phát âm sẽ mở khi Azure Speech được cấu hình." });
          onComplete(70);
          return;
        }
        throw new Error(result.error);
      }
      const score = Math.round(result.scores?.PronScore || 0);
      setAssessment({ score, transcript: result.transcript, words: result.words });
      onComplete(score);
    } catch (error) {
      setAssessment({ message: error instanceof Error ? error.message : "Không thể xử lý bản ghi." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="activity-panel voice-panel">
      <TaskOverlayBridge active={busy} label="Đang tải bản ghi và chấm phát âm…" />
      <p className="activity-type">LUYỆN NÓI</p>
      <h2>{activity.title}</h2>
      <p>{activity.instructions}</p>
      <blockquote>{referenceText}</blockquote>
      <button className={recording ? "record-button active" : "record-button"} onClick={toggle} disabled={busy}>
        {busy ? <span className="spinner" /> : recording ? "■" : "●"}
      </button>
      <small>{recording ? "Chạm để dừng" : "Chạm để ghi âm"}</small>
      {preview && <audio className="audio-player" controls src={preview} />}
      {busy && <div className="voice-result-skeleton"><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /></div>}
      {assessment && !busy && (
        <div className="voice-feedback">
          {assessment.score !== undefined && <div className="feedback-score">{assessment.score}<small>/100</small></div>}
          <div>
            {assessment.transcript && <p><b>Transcript:</b> {assessment.transcript}</p>}
            {assessment.message && <p>{assessment.message}</p>}
            {assessment.words && <div className="word-feedback">{assessment.words.map((item, index) => <span className={(item.accuracy || 0) >= 80 ? "good" : (item.accuracy || 0) >= 60 ? "fair" : "weak"} key={`${item.word}-${index}`}>{item.word}<small>{Math.round(item.accuracy || 0)}</small></span>)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
