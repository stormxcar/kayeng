"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Headphones, LoaderCircle, Search, Sparkles, Volume2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useAuth } from "@/lib/hooks/use-auth";

type Result = {
  word: string; phonetic: string; phonetics: string[]; audio: string; related: string[]; attribution: string;
  meanings: Array<{ partOfSpeech: string; definitions: Array<{ definition: string; example?: string }>; synonyms: string[]; antonyms: string[] }>;
};

export default function DictionaryPage() {
  const { user, supabase } = useAuth();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (debounced.length < 2 || result?.word === debounced.toLowerCase()) { setSuggestions([]); return; }
    const controller = new AbortController();
    fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(debounced)}&max=7`, { signal: controller.signal })
      .then((response) => response.json()).then((data: Array<{ word: string }>) => setSuggestions(data.map((item) => item.word))).catch(() => {});
    return () => controller.abort();
  }, [debounced, result?.word]);

  async function lookup(word: string) {
    if (!word.trim()) return;
    setQuery(word.trim()); setSuggestions([]); setLoading(true); setError(""); setSaved(false);
    const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word.trim())}`);
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setResult(null); setError(data.error); return; }
    setResult(data);
    if (user) {
      supabase.from("dictionary_search_history").insert({ user_id: user.id, query: word.trim().toLowerCase() }).then(() => {});
      supabase.from("user_vocabulary").select("word").eq("user_id", user.id).eq("word", data.word).maybeSingle().then(({ data: item }) => setSaved(Boolean(item)));
    }
  }

  async function toggleSave() {
    if (!user || !result) return;
    if (saved) await supabase.from("user_vocabulary").delete().eq("user_id", user.id).eq("word", result.word);
    else await supabase.from("user_vocabulary").upsert({ user_id: user.id, word: result.word, phonetic: result.phonetic, definition: result.meanings[0]?.definitions[0]?.definition || "", source: "dictionaryapi.dev" });
    setSaved(!saved);
  }

  return (
    <PageShell eyebrow="KNOWLEDGE HUB" title="Từ điển thông minh">
      <section className="dictionary-hero">
        <div><span><Sparkles size={18} />TRA CỨU MIỄN PHÍ</span><h2>Hiểu một từ.<br />Dùng được cả câu.</h2><p>Định nghĩa, IPA, audio, ví dụ, từ đồng nghĩa và từ liên quan trong một nơi.</p></div>
        <form className="dictionary-search" onSubmit={(event: FormEvent) => { event.preventDefault(); lookup(query); }}>
          <Search size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nhập một từ tiếng Anh…" autoFocus /><button>Tra từ</button>
          {suggestions.length > 0 && <div className="dictionary-suggestions">{suggestions.map((word) => <button type="button" key={word} onClick={() => lookup(word)}>{word}</button>)}</div>}
        </form>
      </section>
      {loading && <div className="dictionary-loading"><LoaderCircle className="spin-icon" /><span>Đang mở kho từ vựng</span></div>}
      {error && <div className="empty-state"><Search size={42} /><h2>Chưa tìm thấy</h2><p>{error}</p></div>}
      {result && !loading && (
        <article className="dictionary-entry">
          <header>
            <div><small>ENGLISH WORD</small><h1>{result.word}</h1><p>{result.phonetic}</p></div>
            <div className="entry-actions">
              <button onClick={() => result.audio ? audio.current?.play() : speechSynthesis.speak(new SpeechSynthesisUtterance(result.word))}><Volume2 size={20} />Nghe</button>
              <button onClick={toggleSave} disabled={!user}>{saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}{saved ? "Đã lưu" : "Lưu từ"}</button>
              {result.audio && <audio ref={audio} src={result.audio} preload="none" />}
            </div>
          </header>
          <div className="meaning-layout">
            <main>{result.meanings.map((meaning, index) => <section className="meaning-card" key={`${meaning.partOfSpeech}-${index}`}><div className="part-of-speech">{meaning.partOfSpeech}</div>{meaning.definitions.map((definition, definitionIndex) => <div className="definition" key={definitionIndex}><b>{definitionIndex + 1}</b><div><p>{definition.definition}</p>{definition.example && <blockquote>“{definition.example}”</blockquote>}</div></div>)}{meaning.synonyms.length > 0 && <div className="word-chips"><strong>Đồng nghĩa</strong>{meaning.synonyms.map((word) => <button onClick={() => lookup(word)} key={word}>{word}</button>)}</div>}{meaning.antonyms.length > 0 && <div className="word-chips antonyms"><strong>Trái nghĩa</strong>{meaning.antonyms.map((word) => <button onClick={() => lookup(word)} key={word}>{word}</button>)}</div>}</section>)}</main>
            <aside><h3>Từ liên quan</h3><div className="related-grid">{result.related.map((word) => <button onClick={() => lookup(word)} key={word}>{word}</button>)}</div><div className="practice-prompt"><Headphones size={22} /><b>Biến từ này thành kỹ năng</b><p>Lưu từ để đưa vào hàng đợi flashcard và ôn tập.</p></div><small>{result.attribution}</small></aside>
          </div>
        </article>
      )}
    </PageShell>
  );
}
