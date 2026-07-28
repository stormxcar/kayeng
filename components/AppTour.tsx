"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "driver.js/dist/driver.css";

const TOUR_KEY = "kayeng-app-tour-v1";

export function AppTour() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" || localStorage.getItem(TOUR_KEY)) return;
    const timer = window.setTimeout(async () => {
      const { driver } = await import("driver.js");
      const tour = driver({
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        showProgress: true,
        nextBtnText: "Tiếp theo",
        prevBtnText: "Quay lại",
        doneBtnText: "Bắt đầu học",
        progressText: "{{current}} / {{total}}",
        popoverClass: "kayeng-tour",
        onDestroyed: () => localStorage.setItem(TOUR_KEY, "done"),
        steps: [
          { popover: { title: "Chào mừng đến Kayeng 👋", description: "Một vòng giới thiệu ngắn để bạn bắt đầu học hiệu quả hơn." } },
          { element: "[data-tour='navigation']", popover: { title: "Không gian học tập", description: "Truy cập khóa học, luyện nói, lịch sử và hồ sơ tại đây." } },
          { element: "[data-tour='daily-plan']", popover: { title: "Kế hoạch hôm nay", description: "Hoàn thành mục tiêu mỗi ngày để duy trì streak." } },
          { element: "[data-tour='continue-learning']", popover: { title: "Tiếp tục học", description: "Kayeng ghi nhớ tiến độ để bạn luôn tiếp tục đúng nơi." } },
          { element: "[data-tour='profile']", popover: { title: "Cá nhân hóa", description: "Cập nhật mục tiêu, nghề nghiệp và ảnh đại diện của bạn." } },
        ],
      });
      tour.drive();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
