interface TimerDisplayProps {
  timeRemaining: number;
}

export function TimerDisplay({ timeRemaining }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-6xl md:text-7xl font-light tracking-tight text-foreground">
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
}
