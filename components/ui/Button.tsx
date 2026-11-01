"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "ink" | "ghost" | "light";

const styles: Record<Variant, string> = {
  accent: "bg-accent text-accent-ink",
  ink: "bg-ink text-white",
  light: "bg-white text-ink",
  ghost: "bg-transparent text-current ring-1 ring-inset ring-current/20 hover:ring-current/40",
};

/** Magnetic pill button with a rolling-label hover + arrow chip. */
export function Button({
  href,
  children,
  variant = "ink",
  className,
  onClick,
  type = "button",
  disabled,
  icon = true,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const inner = (
    <span
      className={cn(
        "group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full pl-6 text-[15px] font-medium tracking-tight transition-[transform,opacity] active:scale-[0.97]",
        icon ? "pr-1.5" : "pr-6",
        styles[variant],
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full">{children}</span>
        <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0">
          {children}
        </span>
      </span>
      {icon && (
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45",
            variant === "accent" ? "bg-ink text-white" : variant === "ink" ? "bg-accent text-accent-ink" : "bg-ink text-white",
          )}
        >
          <ArrowUpRight size={16} strokeWidth={2.2} />
        </span>
      )}
    </span>
  );

  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className="inline-block">
      {href ? (
        <Link href={href} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}
