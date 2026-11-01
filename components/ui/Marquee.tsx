import { cn } from "@/lib/utils";

export function Marquee({
  children,
  reverse,
  duration = 40,
  className,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={cn("pause-on-hover relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]", className)}>
      <div
        className={cn("flex w-max shrink-0", reverse ? "animate-marquee-reverse" : "animate-marquee")}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
