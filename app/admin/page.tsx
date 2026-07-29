"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";
import { CustomSelect, levelOptions } from "@/components/CustomSelect";
import { useDebounce } from "@/lib/hooks/use-debounce";

type AdminCourse = { id: string; title: string; slug: string; cefr_level: string; status: string; created_at: string };
type AdminUser = { id: string; display_name: string | null; role: string; cefr_level: string; created_at: string };
type AdminUnit = { id: string; title: string; course_id: string };
type AdminLesson = { id: string; title: string; unit_id: string };
type DictionaryItem = { id: string; word: string; phonetic: string | null; definition: string | null; vietnamese_definition: string | null; source: string };

export default function AdminPage() {
  const { profile, supabase, loading } = useAuth();
  const [tab, setTab] = useState<"content" | "dictionary" | "users">("content");
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [query, setQuery] = useState("");
  const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
  const [cmsMessage, setCmsMessage] = useState("");
  const debounced = useDebounce(query);

  const reload = useCallback(async () => {
    const [courseResult, userResult, dictionaryResult] = await Promise.all([
      supabase.from("courses").select("id,title,slug,cefr_level,status,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,display_name,role,cefr_level,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("dictionary_entries").select("id,word,phonetic,definition,vietnamese_definition,source").order("updated_at", { ascending: false }).limit(100),
    ]);
    setCourses((courseResult.data || []) as AdminCourse[]);
    setUsers((userResult.data || []) as AdminUser[]);
    setDictionary((dictionaryResult.data || []) as DictionaryItem[]);
  }, [supabase]);
  useEffect(() => {
    if (profile?.role !== "admin") return;
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [profile?.role, reload]);
  useEffect(() => {
    if (!selectedCourse) return;
    supabase.from("units").select("id,title,course_id").eq("course_id", selectedCourse).order("sort_order").then(({ data }) => setUnits((data || []) as AdminUnit[]));
  }, [selectedCourse, supabase]);
  useEffect(() => {
    if (!selectedUnit) return;
    supabase.from("lessons").select("id,title,unit_id").eq("unit_id", selectedUnit).order("sort_order").then(({ data }) => setLessons((data || []) as AdminLesson[]));
  }, [selectedUnit, supabase]);

  const filteredUsers = useMemo(() => users.filter((user) => `${user.display_name || ""} ${user.role} ${user.cefr_level}`.toLocaleLowerCase("vi").includes(debounced.toLocaleLowerCase("vi"))), [users, debounced]);

  async function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    await supabase.from("courses").insert({ title, slug: String(form.get("slug")), cefr_level: form.get("level"), description: form.get("description"), status: "draft" });
    event.currentTarget.reset();
    reload();
  }

  async function createUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await supabase.from("units").insert({ course_id: selectedCourse, title: form.get("title"), description: form.get("description"), sort_order: units.length + 1 });
    event.currentTarget.reset();
    const { data } = await supabase.from("units").select("id,title,course_id").eq("course_id", selectedCourse).order("sort_order");
    setUnits((data || []) as AdminUnit[]);
  }
  async function createLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await supabase.from("lessons").insert({ unit_id: selectedUnit, title: form.get("title"), slug: form.get("slug"), description: form.get("description"), estimated_minutes: Number(form.get("minutes")), status: "draft", sort_order: lessons.length + 1 });
    event.currentTarget.reset();
    const { data } = await supabase.from("lessons").select("id,title,unit_id").eq("unit_id", selectedUnit).order("sort_order");
    setLessons((data || []) as AdminLesson[]);
  }
  async function createActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await supabase.from("lesson_activities").insert({
      lesson_id: selectedLesson,
      title: form.get("title"),
      activity_type: form.get("type"),
      instructions: form.get("instructions"),
      content: { referenceText: form.get("referenceText") || undefined },
      sort_order: 1,
    });
    event.currentTarget.reset();
  }

  async function saveDictionaryEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const word = String(form.get("word") || "").trim().toLowerCase();
    const definition = String(form.get("definition") || "").trim();
    const vietnamese = String(form.get("vietnamese") || "").trim();
    if (!/^[a-z][a-z '-]{0,48}$/.test(word)) return setCmsMessage("Từ tiếng Anh không hợp lệ.");
    if (definition.length < 5 || definition.length > 1000 || vietnamese.length < 2 || vietnamese.length > 1000) return setCmsMessage("Định nghĩa cần từ 2–1.000 ký tự.");
    const { error } = await supabase.from("dictionary_entries").upsert({
      word, phonetic: String(form.get("phonetic") || "").trim(), definition,
      vietnamese_definition: vietnamese, source: String(form.get("source") || "editorial"),
      updated_at: new Date().toISOString(),
    }, { onConflict: "word" });
    if (error) return setCmsMessage(error.message);
    setCmsMessage("Đã lưu mục từ.");
    event.currentTarget.reset();
    reload();
  }

  if (!loading && profile?.role !== "admin") return <div className="auth-required"><div className="brand-mark">K</div><h1>Khu vực quản trị</h1><p>Tài khoản của bạn không có quyền admin.</p></div>;
  return (
    <PageShell eyebrow="KAYENG CMS" title="Quản trị nội dung">
      <div className="admin-tabs"><button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>Nội dung</button><button className={tab === "dictionary" ? "active" : ""} onClick={() => setTab("dictionary")}>Từ điển Việt</button><button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Người dùng</button></div>
      {tab === "content" ? <><div className="admin-layout"><form className="cms-form" onSubmit={createCourse}><p className="section-kicker">KHÓA HỌC MỚI</p><label>Tên khóa học<input name="title" minLength={3} maxLength={100} required /></label><label>Slug<input name="slug" required pattern="[a-z0-9-]{3,80}" /></label><label>Trình độ<CustomSelect name="level" options={levelOptions.slice(1,6)} defaultValue="A1" required /></label><label>Mô tả<textarea name="description" maxLength={500} /></label><button className="lesson-primary">Tạo bản nháp</button></form><div className="cms-list">{courses.map((course) => <article className={selectedCourse === course.id ? "selected-row" : ""} key={course.id} onClick={() => { setSelectedCourse(course.id); setSelectedUnit(""); setSelectedLesson(""); }}><span className={`content-status ${course.status}`}>{course.status}</span><div><small>{course.cefr_level} • /{course.slug}</small><h2>{course.title}</h2></div><CustomSelect name={`status-${course.id}`} value={course.status} options={["draft","review","approved","published","archived"].map((value) => ({ value, label: value }))} onValueChange={async (value) => { await supabase.from("courses").update({ status: value }).eq("id", course.id); reload(); }} /></article>)}</div></div>
      {selectedCourse && <section className="content-builder"><div><p className="section-kicker">UNIT</p><form onSubmit={createUnit}><input name="title" placeholder="Tên unit" minLength={3} maxLength={100} required /><input name="description" placeholder="Mô tả" maxLength={500} /><button>+</button></form>{units.map((unit) => <button className={selectedUnit === unit.id ? "selected" : ""} onClick={() => { setSelectedUnit(unit.id); setSelectedLesson(""); }} key={unit.id}>{unit.title}</button>)}</div><div><p className="section-kicker">LESSON</p>{selectedUnit ? <><form onSubmit={createLesson}><input name="title" placeholder="Tên bài học" minLength={3} maxLength={100} required /><input name="slug" placeholder="slug-bai-hoc" pattern="[a-z0-9-]{3,80}" required /><input name="description" placeholder="Mô tả" maxLength={500} /><input name="minutes" type="number" min="3" max="180" defaultValue="15" /><button>+</button></form>{lessons.map((lesson) => <button className={selectedLesson === lesson.id ? "selected" : ""} onClick={() => setSelectedLesson(lesson.id)} key={lesson.id}>{lesson.title}</button>)}</> : <p>Chọn một unit</p>}</div><div><p className="section-kicker">ACTIVITY</p>{selectedLesson ? <form onSubmit={createActivity}><input name="title" placeholder="Tên hoạt động" minLength={3} maxLength={100} required /><CustomSelect name="type" defaultValue="vocabulary" options={["vocabulary","grammar","listening","pronunciation","speaking","roleplay","quiz","multiple_choice","multiple_select","fill_blank","ordering","matching","dictation","image_choice","video_checkpoint","short_answer","essay","reading"].map((value) => ({ value, label: value.replaceAll("_"," ") }))} required /><input name="instructions" placeholder="Hướng dẫn" maxLength={500} /><input name="referenceText" placeholder="Câu mẫu (nếu có)" maxLength={500} /><button>Thêm activity</button></form> : <p>Chọn một lesson</p>}</div></section>}</> :
      tab === "dictionary" ? <section className="dictionary-cms"><form className="cms-form" onSubmit={saveDictionaryEntry}><p className="section-kicker">BIÊN TẬP MỤC TỪ</p><label>Từ tiếng Anh<input name="word" minLength={1} maxLength={49} pattern="[A-Za-z][A-Za-z '\-]*" required /></label><label>IPA<input name="phonetic" maxLength={100} placeholder="/ˈɪŋ.ɡlɪʃ/" /></label><label>Định nghĩa tiếng Anh<textarea name="definition" minLength={5} maxLength={1000} required /></label><label>Nghĩa tiếng Việt<textarea name="vietnamese" minLength={2} maxLength={1000} required /></label><label>Nguồn<CustomSelect name="source" defaultValue="editorial" options={[{value:"editorial",label:"Kayeng biên tập"},{value:"dictionaryapi.dev",label:"Free Dictionary API"},{value:"wiktionary",label:"Wiktionary"}]} /></label>{cmsMessage && <p className="form-message">{cmsMessage}</p>}<button className="lesson-primary">Lưu mục từ</button></form><div className="cms-list">{dictionary.length ? dictionary.map((item) => <article key={item.id}><span className="content-status published">{item.source}</span><div><small>{item.phonetic || "Chưa có IPA"}</small><h2>{item.word}</h2><p>{item.vietnamese_definition}</p></div></article>) : <p>Chưa có mục từ biên tập.</p>}</div></section> :
      <div><label className="search-box admin-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm người dùng" /></label><div className="user-table"><header><span>Người học</span><span>Trình độ</span><span>Vai trò</span></header>{filteredUsers.map((user) => <article key={user.id}><span><b>{user.display_name || "Chưa đặt tên"}</b><small>{new Date(user.created_at).toLocaleDateString("vi-VN")}</small></span><span>{user.cefr_level}</span><CustomSelect name={`role-${user.id}`} value={user.role} options={["learner","teacher","content_editor","reviewer","support","admin"].map((value) => ({ value, label: value }))} onValueChange={async (value) => { await supabase.from("profiles").update({ role: value }).eq("id", user.id); reload(); }} /></article>)}</div></div>}
    </PageShell>
  );
}
