"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, X } from "lucide-react";

type Toast = { id: number; text: string; tone: "ok" | "error" };
const Ctx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export const useToast = () => useContext(Ctx);

/** Toasts look like status-board messages. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-[260px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 overflow-hidden rounded-[12px] bg-ink py-2 pl-2 pr-5 text-sm text-white shadow-2xl"
            >
              <span className={`grid h-8 w-8 place-items-center rounded-[8px] ${t.tone === "ok" ? "bg-signal text-ink" : "bg-red-500 text-white"}`}>
                {t.tone === "ok" ? <CircleCheck size={16} /> : <X size={16} />}
              </span>
              <span className="board text-[12px] tracking-[0.1em] text-white/45">{t.tone === "ok" ? "OK" : "ERR"}</span>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
