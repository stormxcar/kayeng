"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpenCheck, Clock3, GraduationCap, Search, Sparkles, Target } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { courseCatalog } from "./catalog";

type DatabaseCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cefr_level: string;
  units: Array<{ id: string; lessons: Array<{ id: string }> }>;
};

const categories = ["Tất cả", "Lộ trình CEFR", "Kỹ năng", "Mục tiêu", "Chuyên sâu"] as const;
const levels = ["Tất cả", "A0", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

async function getPublishedCourses() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [] as DatabaseCourse[];
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("courses")
    .select("id,slug,title,description,cefr_level,units(id,lessons(id))")
    .eq("status", "published")
    .order("sort_order");
  return (data || []) as DatabaseCourse[];
}

function LearnCatalog() {
  const searchParams = useSearchParams();
  const [databaseCourses, setDatabaseCourses] = useState<DatabaseCourse[]>([]);
  useEffect(() => { void getPublishedCourses().then(setDatabaseCourses); }, []);
  const query = (searchParams.get("q") || "").trim();
  const requestedCategory = searchParams.get("category");
  const requestedLevel = searchParams.get("level");
  const category = categories.includes(requestedCategory as (typeof categories)[number]) ? requestedCategory! : "Tất cả";
  const level = levels.includes(requestedLevel as (typeof levels)[number]) ? requestedLevel! : "Tất cả";
  const merged = courseCatalog.map((course) => {
    const stored = databaseCourses.find((item) => item.slug === course.slug);
    return {
      ...course,
      title: stored?.title || course.title,
      description: stored?.description || course.description,
      target: stored ? `/learn/${stored.slug}` : course.target,
      lessonCount: stored?.units.reduce((sum, unit) => sum + unit.lessons.length, 0) || 0,
      live: Boolean(stored),
    };
  });
  const needle = query.toLocaleLowerCase("vi");
  const filtered = merged.filter((course) =>
    (category === "Tất cả" || course.category === category) &&
    (level === "Tất cả" || course.level.includes(level)) &&
    (!needle || `${course.title} ${course.description} ${course.level} ${course.skills.join(" ")}`.toLocaleLowerCase("vi").includes(needle))
  );
  const featured = merged.filter((course) => course.featured);
  const filterHref = (next: { category?: string; level?: string }) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    const nextCategory = next.category ?? category;
    const nextLevel = next.level ?? level;
    if (nextCategory !== "Tất cả") search.set("category", nextCategory);
    if (nextLevel !== "Tất cả") search.set("level", nextLevel);
    return `/learn${search.size ? `?${search}` : ""}`;
  };

  return <PageShell eyebrow="LEARNING CATALOG" title="Tất cả khóa học">
    <section className="learn-catalog-hero"><div><span><Sparkles/> KHO KIẾN THỨC MIỄN PHÍ</span><h2>Một nơi để học tiếng Anh<br/>từ con số 0 đến làm chủ.</h2><p>Lộ trình CEFR, bốn kỹ năng, phát âm, ngữ pháp, từ vựng, tiếng Anh công việc và luyện thi — không khóa nội dung theo XP.</p><div><b>{courseCatalog.length}</b><small>khóa học</small><b>A0–C2</b><small>đủ trình độ</small><b>4</b><small>kỹ năng</small></div></div><aside><GraduationCap/><b>Bắt đầu đúng cấp độ</b><p>Làm bài kiểm tra nhanh để biết lộ trình phù hợp, hoặc tự chọn bất kỳ khóa nào.</p><Link href="/tests">Kiểm tra trình độ <ArrowRight/></Link></aside></section>
    <section className="learn-featured"><header><div><small>LỘ TRÌNH CHÍNH</small><h2>Đi từng bước theo CEFR</h2></div><Link href="/tests">Chưa biết trình độ? Làm quick test <ArrowRight/></Link></header><div>{featured.map((course,index)=><Link href={course.target} className={`featured-path path-${index}`} key={course.slug}><span>{course.level}</span><div><h3>{course.title.replace(/^.*?— /,"")}</h3><p>{course.description}</p></div><ArrowRight/></Link>)}</div></section>
    <section className="catalog-browser"><header><div><small>COURSE EXPLORER</small><h2>Khám phá toàn bộ chương trình</h2></div><form className="catalog-search" action="/learn"><Search/><input name="q" defaultValue={query} placeholder="Tìm theo tên, kỹ năng, mục tiêu…"/>{category !== "Tất cả" && <input type="hidden" name="category" value={category}/>} {level !== "Tất cả" && <input type="hidden" name="level" value={level}/>}<button type="submit">Tìm</button></form></header>
      <div className="catalog-controls"><div>{categories.map(item=><Link className={category===item?"active":""} href={filterHref({category:item})} key={item}>{item}</Link>)}</div><div>{levels.map(item=><Link className={level===item?"active":""} href={filterHref({level:item})} key={item}>{item}</Link>)}</div></div>
      <div className="catalog-course-grid">{filtered.map((course,index)=><Link href={course.target} className={`catalog-course tone-${index%4}`} key={course.slug}><header><span>{course.level}</span><small>{course.category}</small></header><div className="catalog-course-icon">{course.category==="Lộ trình CEFR"?<GraduationCap/>:course.category==="Kỹ năng"?<BookOpenCheck/>:course.category==="Mục tiêu"?<Target/>:<Sparkles/>}</div><h3>{course.title}</h3><p>{course.description}</p><div className="catalog-skill-chips">{course.skills.map(skill=><span key={skill}>{skill}</span>)}</div><footer><span><Clock3/> {course.duration}</span><b>{course.live&&course.lessonCount?`${course.lessonCount} bài trong LMS`:`${course.units} chặng học`}</b><ArrowRight/></footer></Link>)}</div>
      {!filtered.length&&<div className="empty-state"><Search/><h2>Chưa tìm thấy khóa phù hợp</h2><p>Thử bỏ bớt bộ lọc hoặc tìm theo một kỹ năng khác.</p></div>}
    </section>
    <section className="catalog-principles"><article><BookOpenCheck/><h3>Kiến thức có cấu trúc</h3><p>Mỗi khóa đi từ input, nhận biết, luyện có hướng dẫn đến sử dụng trong ngữ cảnh.</p></article><article><Target/><h3>Đo được đầu ra</h3><p>Mỗi chặng gắn với một “can-do statement” thay vì chỉ đếm số câu đã làm.</p></article><article><Sparkles/><h3>Miễn phí và mở</h3><p>XP ghi nhận nỗ lực; không có khóa học nào bị khóa vì cấp độ hay thành tích.</p></article></section>
  </PageShell>;
}

export default function LearnPage() {
  return <Suspense fallback={<div className="route-skeleton"><div className="skeleton hero-skeleton" /></div>}><LearnCatalog /></Suspense>;
}
