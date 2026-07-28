"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";

type TaskOverlayContextValue = {
  active: boolean;
  runTask: <T>(label: string, task: () => Promise<T>) => Promise<T>;
  startTask: (label: string) => () => void;
};

const TaskOverlayContext = createContext<TaskOverlayContextValue | null>(null);

export function TaskOverlayProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Array<{ id: number; label: string }>>([]);
  const nextId = useRef(0);
  const overlay = useRef<HTMLDivElement>(null);

  const startTask = useCallback((label: string) => {
    const id = ++nextId.current;
    setTasks((current) => [...current, { id, label }]);
    let ended = false;
    return () => {
      if (ended) return;
      ended = true;
      setTasks((current) => current.filter((task) => task.id !== id));
    };
  }, []);

  const runTask = useCallback(async <T,>(label: string, task: () => Promise<T>) => {
    const end = startTask(label);
    try {
      return await task();
    } finally {
      end();
    }
  }, [startTask]);

  const active = tasks.length > 0;
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.current?.focus();
    const guardKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") event.preventDefault();
    };
    const guardExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("keydown", guardKey, true);
    window.addEventListener("beforeunload", guardExit);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", guardKey, true);
      window.removeEventListener("beforeunload", guardExit);
    };
  }, [active]);

  const value = useMemo(() => ({ active, runTask, startTask }), [active, runTask, startTask]);
  const label = tasks.at(-1)?.label;
  return (
    <TaskOverlayContext.Provider value={value}>
      {children}
      {active && (
        <div ref={overlay} className="task-lock-overlay" role="alertdialog" aria-modal="true" aria-live="assertive" tabIndex={-1}>
          <div className="task-lock-card">
            <span className="task-lock-spinner"><LoaderCircle size={28} /></span>
            <small>TÁC VỤ ĐANG ĐƯỢC XỬ LÝ</small>
            <strong>{label || "Đang hoàn tất yêu cầu…"}</strong>
            <p><ShieldCheck size={15} /> Vui lòng giữ nguyên trang để dữ liệu được lưu an toàn.</p>
          </div>
        </div>
      )}
    </TaskOverlayContext.Provider>
  );
}

export function useTaskOverlay() {
  const context = useContext(TaskOverlayContext);
  if (!context) throw new Error("useTaskOverlay must be used inside TaskOverlayProvider");
  return context;
}

export function TaskOverlayBridge({ active, label }: { active: boolean; label: string }) {
  const { startTask } = useTaskOverlay();
  useEffect(() => {
    if (!active) return;
    return startTask(label);
  }, [active, label, startTask]);
  return null;
}
