import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Playlist } from "@/hooks/useAudio";
import type { SessionType } from "@/hooks/useTimer";

interface NowPlayingProps {
  isPlaying: boolean;
  playlist: Playlist;
  sessionType: SessionType;
  onToggle: () => void;
}

export function NowPlaying({
  isPlaying,
  playlist,
  sessionType,
  onToggle,
}: NowPlayingProps) {
  const accentColor = sessionType === "focus" ? "text-focus" : "text-break";

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border">
      <span className="text-lg">{playlist.icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground">Now playing</span>
        <span className={`text-sm font-medium truncate ${accentColor}`}>
          {playlist.name}
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
