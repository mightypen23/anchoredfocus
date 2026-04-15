import { Volume2, VolumeX, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionType } from "@/hooks/useTimer";
import type { StoredTrack } from "@/hooks/useMusicStorage";

interface NowPlayingProps {
  isPlaying: boolean;
  track: StoredTrack | null;
  sessionType: SessionType;
  onToggle: () => void;
  onOpenSettings?: () => void;
}

export function NowPlaying({
  isPlaying,
  track,
  sessionType,
  onToggle,
  onOpenSettings,
}: NowPlayingProps) {
  const accentColor = sessionType === "focus" ? "text-focus" : "text-break";

  if (!track) {
    return (
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
      >
        <Music className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Tap to add music</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border">
      <span className="text-lg">🎵</span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground">Now playing</span>
        <span className={`text-sm font-medium truncate ${accentColor}`}>
          {track.name}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-8 w-8 rounded-full ml-2"
      >
        {isPlaying ? (
          <Volume2 className={`h-4 w-4 ${accentColor}`} />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
