import type { Metadata } from "next";
import { libraryByKey, libraryItems } from "../../library-data";

export function generateStaticParams() {
  return libraryItems.map(({ type, slug }) => ({ type, slug }));
}

export function generateMetadata({ params }: { params: Promise<{ type: string; slug: string }> }): Promise<Metadata> {
  return params.then(({ type, slug }) => {
    const item = libraryByKey[`${type}/${slug}`];
    if (!item) return { title: "Nội dung không tồn tại | Kayeng English" };
    return {
      title: `${item.title} | Thư viện Kayeng`,
      description: item.description,
      alternates: { canonical: `/library/${item.type}/${item.slug}` },
      openGraph: { title: item.title, description: item.description, images: [item.image], type: "article" },
    };
  });
}

export default async function LibraryItemLayout({ children, params }: { children: React.ReactNode; params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  const item = libraryByKey[`${type}/${slug}`];
  const jsonLd = item ? {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: item.title,
    description: item.description,
    educationalLevel: item.level,
    learningResourceType: item.type,
    inLanguage: ["en", "vi"],
    timeRequired: `PT${item.minutes}M`,
    isAccessibleForFree: true,
  } : null;
  return <>{jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}{children}</>;
}
