# 🇬🇧 Kayeng English - Ứng Dụng Học Tiếng Anh Thông Minh

**Kayeng English** là ứng dụng học tiếng Anh đa nền tảng (Web / Android App) được tích hợp công nghệ AI tiên tiến, hỗ trợ học từ vựng theo lặp lại ngắt quãng (FSRS), luyện phát âm chuẩn AI, dịch thuật và đọc chữ từ hình ảnh (OCR).

---

## ✨ Tính Năng Nổi Bật

- 🗣️ **Luyện Phát Âm AI (Azure Speech):** Đánh giá phát âm chuẩn từng từ, độ lưu khoát và độ chính xác của người học.
- 🧠 **Thuật Toán Ghi Nhớ FSRS (`ts-fsrs`):** Tối ưu hóa thời gian ôn tập từ vựng theo phương pháp Lặp lại ngắt quãng (Spaced Repetition).
- 🌐 **Dịch Thuật Anh - Việt:** Tích hợp bộ dịch song song MyMemory & LibreTranslate.
- 📷 **Nhận Diện Chữ Từ Ảnh (OCR):** Quét văn bản tiếng Anh từ tệp hình ảnh / PDF qua `OCR.Space`.
- 📱 **Ứng Dụng Di Động Android:** Đóng gói ứng dụng native qua Capacitor & Tự động xuất file APK trên GitHub Actions.
- ⚡ **Hiệu Năng Cao:** Xây dựng trên Next.js 16 / ViNext, React 19, TailwindCSS v4 và Supabase.

---

## 🚀 Hướng Dẫn Chạy Dự Án (Local Development)

### 1. Cài đặt môi trường
- **Node.js**: phiên bản `>= 22.13.0`

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc dự án và điền các API key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Azure Speech Services (Gói Free F0)
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=eastasia

# Cloudinary (Lưu trữ media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OCR & Translate
LIBRETRANSLATE_URL=
LIBRETRANSLATE_API_KEY=
OCR_SPACE_API_KEY=your-ocr-space-key
```

### 4. Chạy ứng dụng chế độ dev
```bash
npm run dev
```
Mở trình duyệt tại đường dẫn: `http://localhost:3000`

---

## 📱 Tự Động Build File APK Qua GitHub Actions

Dự án đã được tích hợp quy trình **CI/CD Tự động xuất file APK** mỗi khi bạn push code lên GitHub mà không cần cài Android Studio trên máy local:

1. Đẩy code lên GitHub:
   ```bash
   git add .
   git commit -m "update: your message"
   git push origin main
   ```
2. Truy cập vào kho chứa GitHub $\rightarrow$ chọn tab **Actions**.
3. Chọn workflow **Build Android APK** $\rightarrow$ chờ khoảng 2 phút cho đến khi có dấu tích xanh `✓`.
4. Bấm vào lượt build đó và tải file **`kayeng-english-apk`** tại mục **Artifacts** ở cuối trang.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend / Framework:** Next.js 16, React 19, TailwindCSS v4, Lucide React
- **Mobile Shell:** Capacitor 8 (`@capacitor/android`)
- **Database & Auth:** Supabase (`@supabase/supabase-js`), Drizzle ORM
- **AI Services:** Azure Cognitive Speech Services, OCR.Space API, LibreTranslate / MyMemory API
- **Spaced Repetition:** `ts-fsrs`

---

## 📝 License

Dự án phát triển bởi **StormXCar / Kayeng English**.
