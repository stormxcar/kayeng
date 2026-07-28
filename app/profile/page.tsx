"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { CustomSelect, occupationOptions } from "@/components/CustomSelect";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ProfilePage() {
  const { user, profile, supabase, loading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [stats, setStats] = useState({ lessons: 0, recordings: 0, streak: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("audio_recordings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
    ]).then(([lessons, recordings, streak]) => setStats({ lessons: lessons.count || 0, recordings: recordings.count || 0, streak: streak.data?.current_streak || 0 }));
  }, [supabase, user]);

  useEffect(() => setAvatarUrl(profile?.avatar_url || null), [profile?.avatar_url]);

  async function uploadAvatar(file?: File) {
    if (!file || !user) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setUploadError("Vui lòng chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 5 MB.");
      return;
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploading(true);
    setUploadError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const signatureResponse = await fetch("/api/avatar/signature", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionData.session?.access_token || ""}` },
      });
      const signed = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(signed.error || "Không thể ký yêu cầu upload.");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signed.apiKey);
      body.append("timestamp", String(signed.timestamp));
      body.append("folder", signed.folder);
      body.append("public_id", signed.publicId);
      body.append("overwrite", "true");
      body.append("signature", signed.signature);
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: "POST", body });
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploaded.error?.message || "Upload ảnh thất bại.");
      const url = uploaded.secure_url as string;
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw error;
      setAvatarUrl(url);
      setAvatarPreview(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Không thể upload ảnh.");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(preview);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    await supabase.from("profiles").update({
      display_name: form.get("displayName"),
      occupation: form.get("occupation"),
      cefr_level: form.get("level"),
      learning_goal: form.get("goal"),
      daily_goal_minutes: Number(form.get("minutes")),
      preferred_accent: form.get("accent"),
    }).eq("id", user.id);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <PageShell eyebrow="TÀI KHOẢN" title="Hồ sơ học tập" actions={profile?.role === "admin" ? <Link className="admin-link" href="/admin">Mở Admin</Link> : undefined}>
      {!loading && !user ? <div className="empty-state"><h2>Bạn chưa đăng nhập</h2><Link href="/">Đăng nhập tại trang chủ</Link></div> : profile && (
        <div className="profile-layout">
          <aside className="profile-summary">
            <div className="avatar-editor">
              <div className="profile-avatar">
                {avatarPreview || avatarUrl ? <img src={avatarPreview || avatarUrl || ""} alt={`Ảnh đại diện của ${profile.display_name || "bạn"}`} /> : (profile.display_name || "K").slice(0, 1).toUpperCase()}
                {uploading && <span className="avatar-upload-progress" aria-label="Đang tải ảnh"><i /></span>}
              </div>
              <label className="avatar-upload-button" data-tooltip="JPG, PNG hoặc WebP · tối đa 5 MB">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadAvatar(event.target.files?.[0])} disabled={uploading} />
                {uploading ? "Đang xử lý…" : "Đổi ảnh"}
              </label>
              {uploadError && <small className="form-error">{uploadError}</small>}
            </div>
            <h2>{profile.display_name}</h2><p>{user?.email}</p><span className="role-badge">{profile.role}</span>
            <div className="profile-stats"><div><strong>{stats.lessons}</strong><small>Bài học</small></div><div><strong>{stats.recordings}</strong><small>Bản ghi</small></div><div><strong>{stats.streak}</strong><small>Streak</small></div></div>
          </aside>
          <form className="profile-form" onSubmit={save}>
            <div className="form-section"><p className="section-kicker">THÔNG TIN CÁ NHÂN</p><div className="form-grid"><label>Tên hiển thị<input name="displayName" defaultValue={profile.display_name || ""} /></label><label>Nghề nghiệp<CustomSelect name="occupation" options={occupationOptions} defaultValue={profile.occupation} /></label></div></div>
            <div className="form-section"><p className="section-kicker">CÀI ĐẶT HỌC</p><div className="form-grid"><label>Trình độ<select name="level" defaultValue={profile.cefr_level}>{["A0","A1","A2","B1","B2"].map((level) => <option key={level}>{level}</option>)}</select></label><label>Mục tiêu mỗi ngày<select name="minutes" defaultValue={profile.daily_goal_minutes}>{[10,15,20,30,45].map((minutes) => <option value={minutes} key={minutes}>{minutes} phút</option>)}</select></label><label>Giọng ưu tiên<select name="accent" defaultValue="american"><option value="american">Anh-Mỹ</option><option value="british">Anh-Anh</option></select></label></div><label>Mục tiêu<textarea name="goal" defaultValue={profile.learning_goal || ""} /></label></div>
            <button className="lesson-primary">{saved ? "✓ Đã lưu" : "Lưu thay đổi"}</button>
          </form>
        </div>
      )}
    </PageShell>
  );
}
