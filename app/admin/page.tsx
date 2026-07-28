"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDebounce } from "@/lib/hooks/use-debounce";

type AdminCourse = { id: string; title: string; slug: string; cefr_level: string; status: string; created_at: string };
type AdminUser = { id: string; display_name: string | null; role: string; cefr_level: string; created_at: string };
type AdminUnit = { id: string; title: string; course_id: string };
type AdminLesson = { id: string; title: string; unit_id: string };

export default function AdminPage() {
  const { profile, supabase, loading } = useAuth();
  const [tab, setTab] = useState<"content" | "users">("content");
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);

  async function reload() {
    const [courseResult, userResult] = await Promise.all([
      supabase.from("courses").select("id,title,slug,cefr_level,status,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,display_name,role,cefr_level,created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    setCourses((courseResult.data || []) as AdminCourse[]);
    setUsers((userResult.data || []) as AdminUser[]);
  }
  useEffect(() => { if (profile?.role === "admin") reload(); }, [profile]);
  useEffect(() => {
    if (!selectedCourse) { setUnits([]); return; }
    supabase.from("units").select("id,title,course_id").eq("course_id", selectedCourse).order("sort_order").then(({ data }) => setUnits((data || []) as AdminUnit[]));
  }, [selectedCourse, supabase]);
  useEffect(() => {
    if (!selectedUnit) { setLessons([]); return; }
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

  if (!loading && profile?.role !== "admin") return <div className="auth-required"><div className="brand-mark">K</div><h1>Khu vực quản trị</h1><p>Tài khoản của bạn không có quyền admin.</p></div>;
  return (
    <PageShell eyebrow="KAYENG CMS" title="Quản trị nội dung">
      <div className="admin-tabs"><button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>Nội dung</button><button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Người dùng</button></div>
      {tab === "content" ? <><div className="admin-layout"><form className="cms-form" onSubmit={createCourse}><p className="section-kicker">KHÓA HỌC MỚI</p><label>Tên khóa học<input name="title" required /></label><label>Slug<input name="slug" required pattern="[a-z0-9-]+" /></label><label>Trình độ<select name="level"><option>A1</option><option>A2</option><option>B1</option><option>B2</option></select></label><label>Mô tả<textarea name="description" /></label><button className="lesson-primary">Tạo bản nháp</button></form><div className="cms-list">{courses.map((course) => <article className={selectedCourse === course.id ? "selected-row" : ""} key={course.id} onClick={() => { setSelectedCourse(course.id); setSelectedUnit(""); setSelectedLesson(""); }}><span className={`content-status ${course.status}`}>{course.status}</span><div><small>{course.cefr_level} • /{course.slug}</small><h2>{course.title}</h2></div><select value={course.status} onClick={(event) => event.stopPropagation()} onChange={async (event) => { await supabase.from("courses").update({ status: event.target.value }).eq("id", course.id); reload(); }}><option>draft</option><option>review</option><option>approved</option><option>published</option><option>archived</option></select></article>)}</div></div>
      {selectedCourse && <section className="content-builder"><div><p className="section-kicker">UNIT</p><form onSubmit={createUnit}><input name="title" placeholder="Tên unit" required /><input name="description" placeholder="Mô tả" /><button>+</button></form>{units.map((unit) => <button className={selectedUnit === unit.id ? "selected" : ""} onClick={() => { setSelectedUnit(unit.id); setSelectedLesson(""); }} key={unit.id}>{unit.title}</button>)}</div><div><p className="section-kicker">LESSON</p>{selectedUnit ? <><form onSubmit={createLesson}><input name="title" placeholder="Tên bài học" required /><input name="slug" placeholder="slug-bai-hoc" required /><input name="description" placeholder="Mô tả" /><input name="minutes" type="number" defaultValue="15" /><button>+</button></form>{lessons.map((lesson) => <button className={selectedLesson === lesson.id ? "selected" : ""} onClick={() => setSelectedLesson(lesson.id)} key={lesson.id}>{lesson.title}</button>)}</> : <p>Chọn một unit</p>}</div><div><p className="section-kicker">ACTIVITY</p>{selectedLesson ? <form onSubmit={createActivity}><input name="title" placeholder="Tên hoạt động" required /><select name="type"><option>vocabulary</option><option>grammar</option><option>listening</option><option>pronunciation</option><option>speaking</option><option>roleplay</option><option>quiz</option></select><input name="instructions" placeholder="Hướng dẫn" /><input name="referenceText" placeholder="Câu mẫu (nếu có)" /><button>Thêm activity</button></form> : <p>Chọn một lesson</p>}</div></section>}</> :
      <div><label className="search-box admin-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm người dùng" /></label><div className="user-table"><header><span>Người học</span><span>Trình độ</span><span>Vai trò</span></header>{filteredUsers.map((user) => <article key={user.id}><span><b>{user.display_name || "Chưa đặt tên"}</b><small>{new Date(user.created_at).toLocaleDateString("vi-VN")}</small></span><span>{user.cefr_level}</span><select value={user.role} onChange={async (event) => { await supabase.from("profiles").update({ role: event.target.value }).eq("id", user.id); reload(); }}><option>learner</option><option>teacher</option><option>content_editor</option><option>reviewer</option><option>support</option><option>admin</option></select></article>)}</div></div>}
    </PageShell>
  );
}
