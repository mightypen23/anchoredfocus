import type { SessionType } from "@/hooks/useTimer";

interface ProgressRingProps {
  progress: number;
  sessionType: SessionType;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  sessionType,
  size = 280,
  strokeWidth = 8,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  const strokeColor = sessionType === "focus" ? "stroke-focus" : "stroke-break";
  const glowClass =
    sessionType === "focus" ? "timer-glow-focus" : "timer-glow-break";

  return (
    <div className={`relative ${glowClass} rounded-full transition-shadow duration-500`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`${strokeColor} transition-all duration-300 ease-out`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
