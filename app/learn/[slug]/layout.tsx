import type { Metadata } from "next";
import { courseCatalog } from "../catalog";

export function generateStaticParams() {
  return courseCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courseCatalog.find((item) => item.slug === slug);
  return {
    title: course ? `${course.title} | Kayeng English` : "Khóa học | Kayeng English",
    description: course?.description || "Khóa học tiếng Anh giao tiếp theo lộ trình CEFR.",
    alternates: { canonical: `/learn/${slug}` },
  };
}

export default async function CourseLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courseCatalog.find((item) => item.slug === slug);
  const jsonLd = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    educationalLevel: course.level,
    timeRequired: course.duration,
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "Kayeng English" },
  } : null;
  return <>{jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}{children}</>;
}
