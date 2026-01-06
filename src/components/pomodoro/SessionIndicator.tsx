import type { SessionType } from "@/hooks/useTimer";

interface SessionIndicatorProps {
  sessionType: SessionType;
  completedSessions: number;
}

export function SessionIndicator({
  sessionType,
  completedSessions,
}: SessionIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`text-sm font-medium uppercase tracking-widest ${
          sessionType === "focus" ? "text-focus" : "text-break"
        }`}
      >
        {sessionType === "focus" ? "Focus" : "Break"}
      </span>
      <div className="flex gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < completedSessions % 4
                ? sessionType === "focus"
                  ? "bg-focus"
                  : "bg-break"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {completedSessions} sessions completed
      </span>
    </div>
  );
}
