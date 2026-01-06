import { useRef } from "react";
import { Upload, X, Music } from "lucide-react";
import type { StoredTrack } from "@/hooks/useMusicStorage";
import type { SessionType } from "@/hooks/useTimer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MusicUploaderProps {
  sessionType: SessionType;
  tracks: StoredTrack[];
  selectedTrackId: string | null;
  onUpload: (file: File) => void;
  onRemove: (trackId: string) => void;
  onSelect: (track: StoredTrack) => void;
}

export function MusicUploader({
  sessionType,
  tracks,
  selectedTrackId,
  onUpload,
  onRemove,
  onSelect,
}: MusicUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      onUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const accentClass = sessionType === "focus" ? "focus" : "break";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Your {sessionType === "focus" ? "Focus" : "Break"} Tracks
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-7 text-xs gap-1"
        >
          <Upload className="h-3 w-3" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {tracks.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No custom tracks uploaded yet
        </p>
      ) : (
        <div className="space-y-1.5">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all group cursor-pointer",
                selectedTrackId === track.id
                  ? sessionType === "focus"
                    ? "border-focus bg-focus/10"
                    : "border-break bg-break/10"
                  : "border-border bg-card hover:bg-muted"
              )}
              onClick={() => onSelect(track)}
            >
              <Music className={cn(
                "h-4 w-4 shrink-0",
                selectedTrackId === track.id
                  ? sessionType === "focus" ? "text-focus" : "text-break"
                  : "text-muted-foreground"
              )} />
              <span className="text-sm truncate flex-1">{track.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(track.id);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
