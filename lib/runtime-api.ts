import { Capacitor } from "@capacitor/core";

/**
 * Routes application requests to the current origin on the web and to the
 * protected production API when the UI is running from an installed app.
 * The Capacitor bundle contains only static UI; server-only secrets stay on
 * the API host.
 */
const nativeApiOrigin = (
  process.env.NEXT_PUBLIC_MOBILE_API_URL ||
  "https://kayeng-english.nguyenkhaa223.chatgpt.site"
).replace(/\/$/, "");

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return Capacitor.isNativePlatform() ? `${nativeApiOrigin}${normalizedPath}` : normalizedPath;
}

export const isNativeApp = () => Capacitor.isNativePlatform();
