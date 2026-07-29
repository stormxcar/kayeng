"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const menuId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function focusOption(index: number) {
    const buttons = root.current?.querySelectorAll<HTMLButtonElement>("[role='option']");
    buttons?.[Math.max(0, Math.min(index, buttons.length - 1))]?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setOpen(true);
    window.requestAnimationFrame(() => {
      const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
      focusOption(event.key === "End" ? options.length - 1 : event.key === "Home" ? 0 : selectedIndex);
    });
  }

  function handleOptionKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      root.current?.querySelector<HTMLButtonElement>(".custom-select-trigger")?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusOption(event.key === "Home" ? 0 : options.length - 1);
    }
  }

  return (
    <div className="custom-select" ref={root}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className="custom-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selected?.label || placeholder}</span><ChevronDown className="select-chevron" size={18} />
      </button>
      {required && <input className="custom-select-validity" tabIndex={-1} aria-hidden="true" required value={value} onChange={() => {}} />}
      {open && (
        <div className="custom-select-menu" role="listbox" id={menuId} aria-label={placeholder}>
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={value === option.value ? "selected" : ""}
              key={option.value}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
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
