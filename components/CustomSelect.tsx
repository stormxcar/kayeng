"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string; description?: string };

export function CustomSelect({
  name,
  options,
  defaultValue,
  value: controlledValue,
  onValueChange,
  required = false,
  disabled = false,
  placeholder = "Chọn một lựa chọn",
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string | null;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const value = controlledValue ?? internalValue;
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div className="custom-select" ref={root}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className="custom-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || placeholder}</span><ChevronDown className="select-chevron" size={18} />
      </button>
      {open && (
        <div className="custom-select-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={value === option.value ? "selected" : ""}
              key={option.value}
              onClick={() => { setInternalValue(option.value); onValueChange?.(option.value); setOpen(false); }}
            >
              <span>{option.label}</span>
              {option.description && <small>{option.description}</small>}
              {value === option.value && <b><Check size={16} /></b>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const occupationOptions: SelectOption[] = [
  { value: "student", label: "Học sinh / Sinh viên", description: "Đang học tại trường hoặc đại học" },
  { value: "teacher", label: "Giáo viên / Giảng viên" },
  { value: "technology", label: "Công nghệ thông tin" },
  { value: "design", label: "Thiết kế / Sáng tạo" },
  { value: "business", label: "Kinh doanh / Khởi nghiệp" },
  { value: "marketing", label: "Marketing / Truyền thông" },
  { value: "finance", label: "Tài chính / Kế toán" },
  { value: "healthcare", label: "Y tế / Chăm sóc sức khỏe" },
  { value: "engineering", label: "Kỹ thuật / Sản xuất" },
  { value: "hospitality", label: "Du lịch / Nhà hàng / Khách sạn" },
  { value: "office", label: "Nhân viên văn phòng" },
  { value: "freelancer", label: "Freelancer" },
  { value: "other", label: "Lĩnh vực khác" },
];

export const levelOptions: SelectOption[] = [
  { value: "A0", label: "A0 · Mới bắt đầu" }, { value: "A1", label: "A1 · Cơ bản" },
  { value: "A2", label: "A2 · Sơ trung cấp" }, { value: "B1", label: "B1 · Trung cấp" },
  { value: "B2", label: "B2 · Trên trung cấp" }, { value: "C1", label: "C1 · Nâng cao" },
  { value: "C2", label: "C2 · Thành thạo" },
];
export const dailyGoalOptions: SelectOption[] = [10,15,20,30,45,60].map((minutes) => ({
  value: String(minutes), label: `${minutes} phút mỗi ngày`,
  description: minutes <= 15 ? "Phù hợp để duy trì đều đặn" : minutes >= 45 ? "Lộ trình chuyên sâu" : undefined,
}));
export const accentOptions: SelectOption[] = [
  { value: "american", label: "Anh–Mỹ", description: "General American" },
  { value: "british", label: "Anh–Anh", description: "Modern Received Pronunciation" },
];
