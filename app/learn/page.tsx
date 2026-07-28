"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDebounce } from "@/lib/hooks/use-debounce";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cefr_level: string;
  units: Array<{ id: string; lessons: Array<{ id: string }> }>;
};

export default function LearnPage() {
  const { supabase } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    supabase
      .from("courses")
      .select("id,slug,title,description,cefr_level,units(id,lessons(id))")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => {
        setCourses((data || []) as Course[]);
        setLoading(false);
      });
  }, [supabase]);

  const filtered = useMemo(() => {
    const normalized = debouncedQuery.trim().toLocaleLowerCase("vi");
    if (!normalized) return courses;
    return courses.filter((course) =>
      `${course.title} ${course.description || ""} ${course.cefr_level}`.toLocaleLowerCase("vi").includes(normalized),
    );
  }, [courses, debouncedQuery]);

  return (
    <PageShell
      eyebrow="THƯ VIỆN HỌC TẬP"
      title="Chọn lộ trình của bạn"
      actions={
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khóa học" />
        </label>
      }
    >
      {loading ? (
        <div className="course-grid">{[1, 2, 3].map((item) => <div className="skeleton course-skeleton" key={item} />)}</div>
      ) : (
        <div className="course-grid">
          {filtered.map((course, index) => {
            const lessonCount = course.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
            return (
              <Link href={`/learn/${course.slug}`} className={`course-card course-tone-${index % 3}`} key={course.id}>
                <div className="course-card-top"><span>{course.cefr_level}</span><b>{lessonCount} bài</b></div>
                <div>
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                </div>
                <strong>Khám phá lộ trình <span>→</span></strong>
              </Link>
            );
          })}
          {!filtered.length && <div className="empty-state"><span>⌕</span><h2>Không tìm thấy khóa học</h2><p>Thử một từ khóa hoặc trình độ khác.</p></div>}
        </div>
      )}
    </PageShell>
  );
}
