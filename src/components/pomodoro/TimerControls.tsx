import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      <Button
        onClick={isRunning ? onPause : onStart}
        size="lg"
        className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
      >
        {isRunning ? (
          <Pause className="h-7 w-7" />
        ) : (
          <Play className="h-7 w-7 ml-1" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onSkip}
        className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
