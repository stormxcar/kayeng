import type { Metadata } from "next";
import { topicBySlug } from "../topic-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicBySlug[slug];
  if (!topic) return { title: "Chủ đề không tồn tại | Kayeng English" };
  return {
    title: `${topic.title} bằng tiếng Anh | Kayeng`,
    description: topic.description,
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

export default async function TopicLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const topic = topicBySlug[(await params).slug];
  const jsonLd = topic ? {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `Tiếng Anh chủ đề ${topic.title}`,
    description: topic.description,
    educationalLevel: [...new Set(topic.units.map((unit) => unit.level))].join(", "),
    teaches: topic.outcome,
    inLanguage: ["en", "vi"],
    isAccessibleForFree: true,
  } : null;
  return <>{jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}{children}</>;
}
