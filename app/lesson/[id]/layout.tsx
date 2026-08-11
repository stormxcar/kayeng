/**
 * Retains a single legacy deep-link shell while installed apps use /lesson?id=….
 * Dynamic lesson data is intentionally requested client-side from Supabase.
 */
export function generateStaticParams() {
  return [{ id: "offline-placeholder" }];
}

export default function LegacyLessonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
