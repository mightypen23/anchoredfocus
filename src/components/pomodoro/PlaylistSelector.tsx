import type { Playlist } from "@/hooks/useAudio";
import type { SessionType } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";

interface PlaylistSelectorProps {
  sessionType: SessionType;
  playlists: Playlist[];
  selected: Playlist;
  onSelect: (playlist: Playlist) => void;
}

export function PlaylistSelector({
  sessionType,
  playlists,
  selected,
  onSelect,
}: PlaylistSelectorProps) {
  const accentColor = sessionType === "focus" ? "focus" : "break";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {sessionType === "focus" ? "🎯 Focus Music" : "☕ Break Music"}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => onSelect(playlist)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left",
              selected.id === playlist.id
                ? sessionType === "focus"
                  ? "border-focus bg-focus/10 text-focus"
                  : "border-break bg-break/10 text-break"
                : "border-border bg-card hover:bg-muted text-foreground"
            )}
          >
            <span className="text-lg">{playlist.icon}</span>
            <span className="text-sm font-medium truncate">{playlist.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
