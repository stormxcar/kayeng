import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kayeng.english",
  appName: "Kayeng English",
  webDir: "mobile-shell",
  server: {
    androidScheme: "https",
    url: process.env.CAPACITOR_SERVER_URL || "https://kayeng-english.nguyenkhaa223.chatgpt.site",
    cleartext: false,
    allowNavigation: ["*.supabase.co"],
  },
};

export default config;
