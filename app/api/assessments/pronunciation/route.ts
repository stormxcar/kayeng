import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase/authenticated";

export const dynamic = "force-static";

type AzureWord = {
  Word?: string;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
  Phonemes?: Array<{ Phoneme?: string; PronunciationAssessment?: { AccuracyScore?: number } }>;
};

export async function POST(request: Request) {
  const supabase = createAuthenticatedClient(request);
  if (!supabase) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });

  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;
  if (!azureKey || !azureRegion) {
    return NextResponse.json(
      { error: "Azure Speech chưa được cấu hình trên server.", code: "AZURE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const { recordingId } = (await request.json()) as { recordingId: string };
  const { data: recording, error: recordingError } = await supabase
    .from("audio_recordings")
    .select("*")
    .eq("id", recordingId)
    .eq("user_id", userData.user.id)
    .single();
  if (recordingError || !recording) {
    return NextResponse.json({ error: "Không tìm thấy bản ghi âm." }, { status: 404 });
  }

  await supabase.from("audio_recordings").update({ status: "processing" }).eq("id", recordingId);
  const { data: signed, error: signedError } = await supabase.storage
    .from("speaking-recordings")
    .createSignedUrl(recording.storage_path, 120);
  if (signedError) return NextResponse.json({ error: signedError.message }, { status: 400 });

  const audio = await fetch(signed.signedUrl).then((response) => response.arrayBuffer());
  const assessmentConfig = Buffer.from(
    JSON.stringify({
      ReferenceText: recording.reference_text || "",
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true,
      EnableProsodyAssessment: true,
      PhonemeAlphabet: "IPA",
    }),
  ).toString("base64");

  const endpoint = new URL(
    `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
  );
  endpoint.searchParams.set("language", "en-US");
  endpoint.searchParams.set("format", "detailed");

  const azureResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": azureKey,
      "Pronunciation-Assessment": assessmentConfig,
      "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
      Accept: "application/json",
    },
    body: audio,
  });
  const result = await azureResponse.json();
  if (!azureResponse.ok || !result.NBest?.[0]) {
    await supabase.from("audio_recordings").update({ status: "failed" }).eq("id", recordingId);
    return NextResponse.json({ error: result?.DisplayText || "Azure không thể chấm bản ghi âm." }, { status: 502 });
  }

  const best = result.NBest[0];
  const scores = best.PronunciationAssessment || {};
  const words = (best.Words || []).map((word: AzureWord) => ({
    word: word.Word,
    accuracy: word.PronunciationAssessment?.AccuracyScore,
    errorType: word.PronunciationAssessment?.ErrorType,
    phonemes: word.Phonemes?.map((phoneme) => ({
      phoneme: phoneme.Phoneme,
      accuracy: phoneme.PronunciationAssessment?.AccuracyScore,
    })),
  }));
  const feedback = {
    strengths: words.filter((word: { accuracy?: number }) => (word.accuracy || 0) >= 80).slice(0, 2),
    priorities: words.filter((word: { accuracy?: number }) => (word.accuracy || 0) < 60).slice(0, 3),
  };

  const { data: saved, error: saveError } = await supabase.rpc("save_speaking_assessment", {
    p_recording_id: recordingId,
    p_transcript: result.DisplayText || best.Display,
    p_pronunciation_score: scores.PronScore,
    p_fluency_score: scores.FluencyScore,
    p_completeness_score: scores.CompletenessScore,
    p_prosody_score: scores.ProsodyScore,
    p_word_results: words,
    p_feedback: feedback,
  });
  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 400 });
  return NextResponse.json({ assessment: saved, scores, transcript: result.DisplayText, words, feedback });
}
