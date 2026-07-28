"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string; description?: string };

export function CustomSelect({
  name,
  options,
  defaultValue,
  placeholder = "Chọn một lựa chọn",
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");
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
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || placeholder}</span><span className="select-chevron">⌄</span>
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
              onClick={() => { setValue(option.value); setOpen(false); }}
            >
              <span>{option.label}</span>
              {option.description && <small>{option.description}</small>}
              {value === option.value && <b>✓</b>}
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
