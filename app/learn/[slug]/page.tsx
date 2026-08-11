"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";

type CourseDetail = {
  id: string;
  title: string;
  description: string | null;
  cefr_level: string;
  units: Array<{
    id: string;
    title: string;
    description: string | null;
    lessons: Array<{ id: string; title: string; description: string | null; estimated_minutes: number; xp_reward: number }>;
  }>;
};

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { supabase, user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [unitProgress, setUnitProgress] = useState<Record<string, number>>({});
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    supabase
      .from("courses")
      .select("id,title,description,cefr_level,units(id,title,description,lessons(id,title,description,estimated_minutes,xp_reward))")
      .eq("slug", slug)
      .eq("status", "published")
      .order("sort_order", { referencedTable: "units" })
      .single()
      .then(({ data }) => setCourse(data as CourseDetail | null));
  }, [slug, supabase]);

  useEffect(() => {
    if (!user) return;
    supabase.from("lesson_progress").select("lesson_id,percent_complete").eq("user_id", user.id).then(({ data }) => {
      setProgress(Object.fromEntries((data || []).map((item) => [item.lesson_id, item.percent_complete])));
    });
  }, [supabase, user]);

  useEffect(() => {
    if (!user || !course) return;
    Promise.all([
      supabase.from("user_unit_progress").select("unit_id,percent_complete").eq("course_id", course.id),
      supabase.from("user_course_progress").select("percent_complete").eq("course_id", course.id).maybeSingle(),
    ]).then(([units, summary]) => {
      setUnitProgress(Object.fromEntries((units.data || []).map((item) => [item.unit_id, item.percent_complete])));
      setCourseProgress(summary.data?.percent_complete || 0);
    });
  }, [course, supabase, user]);

  if (!course) return <CourseLoadingView />;

  return (
    <PageShell eyebrow={`LỘ TRÌNH ${course.cefr_level}`} title={course.title}>
      <section className="course-hero">
        <div><p>{course.description}</p><div className="course-meta"><span>◷ 15 phút/ngày</span><span>✦ Phản xạ giao tiếp</span>{user&&<span>✓ {courseProgress}% khóa học</span>}</div></div>
        <div className="course-level">{course.cefr_level}</div>
      </section>
      <div className="unit-list">
        {course.units.map((unit, unitIndex) => (
          <section className="unit-card" key={unit.id}>
            <header><span>{String(unitIndex + 1).padStart(2, "0")}</span><div><h2>{unit.title}</h2><p>{unit.description}</p>{user&&<div className="unit-rollup"><i style={{width:`${unitProgress[unit.id]||0}%`}}/><small>{unitProgress[unit.id]||0}% unit</small></div>}</div></header>
            <div className="unit-lessons">
              {unit.lessons.map((lesson, lessonIndex) => {
                const percent = progress[lesson.id] || 0;
                return (
                  <Link href={`/lesson?id=${lesson.id}`} key={lesson.id} className="course-lesson">
                    <span className={percent === 100 ? "lesson-number completed" : "lesson-number"}>{percent === 100 ? "✓" : lessonIndex + 1}</span>
                    <div><strong>{lesson.title}</strong><small>{lesson.estimated_minutes} phút • {lesson.xp_reward} XP</small></div>
                    <div className="mini-progress"><i style={{ width: `${percent}%` }} /></div>
                    <b>{percent ? `${percent}%` : "→"}</b>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function CourseLoadingView() {
  return <div className="route-skeleton"><div className="skeleton hero-skeleton" />{[1, 2].map((item) => <div className="skeleton unit-skeleton" key={item} />)}</div>;
}
