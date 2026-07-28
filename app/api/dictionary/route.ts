import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type DictionaryEntry = {
  word: string; phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<{ partOfSpeech: string; synonyms?: string[]; antonyms?: string[]; definitions: Array<{ definition: string; example?: string; synonyms?: string[]; antonyms?: string[] }> }>;
  sourceUrls?: string[];
};

export async function GET(request: Request) {
  const word = new URL(request.url).searchParams.get("word")?.trim().toLowerCase();
  if (!word || !/^[a-z][a-z '-]{0,48}$/i.test(word)) return NextResponse.json({ error: "Từ khóa không hợp lệ." }, { status: 400 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { data: editorial } = await supabase.from("dictionary_entries").select("phonetic,definition,vietnamese_definition,source").eq("word", word).maybeSingle();
  const [dictionaryResult, relatedResult] = await Promise.allSettled([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { next: { revalidate: 86400 } }),
    fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=12`, { next: { revalidate: 86400 } }),
  ]);
  if ((dictionaryResult.status === "rejected" || !dictionaryResult.value.ok) && !editorial) {
    return NextResponse.json({ error: "Không tìm thấy từ này. Hãy kiểm tra chính tả hoặc thử dạng nguyên mẫu." }, { status: 404 });
  }
  const entries = dictionaryResult.status === "fulfilled" && dictionaryResult.value.ok ? await dictionaryResult.value.json() as DictionaryEntry[] : [];
  const related = relatedResult.status === "fulfilled" && relatedResult.value.ok
    ? await relatedResult.value.json() as Array<{ word: string }> : [];
  const entry: DictionaryEntry = entries[0] || { word, meanings: editorial?.definition ? [{ partOfSpeech: "entry", definitions: [{ definition: editorial.definition }] }] : [] };
  const phonetics = [...new Set((entry.phonetics || []).map((item) => item.text).filter(Boolean))];
  return NextResponse.json({
    word: entry.word,
    phonetic: entry.phonetic || phonetics[0] || "",
    vietnameseDefinition: editorial?.vietnamese_definition || "",
    phonetics,
    audio: entry.phonetics?.find((item) => item.audio)?.audio || "",
    meanings: (entry.meanings || []).map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech,
      definitions: meaning.definitions.slice(0, 5),
      synonyms: [...new Set([...(meaning.synonyms || []), ...meaning.definitions.flatMap((item) => item.synonyms || [])])].slice(0, 12),
      antonyms: [...new Set([...(meaning.antonyms || []), ...meaning.definitions.flatMap((item) => item.antonyms || [])])].slice(0, 12),
    })),
    related: related.map((item) => item.word),
    sources: entry.sourceUrls || [],
    attribution: "Definitions: Free Dictionary API · Related words: Datamuse",
  }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
