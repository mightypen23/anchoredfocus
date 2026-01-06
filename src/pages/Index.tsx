import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useTheme } from "@/hooks/useTheme";
import { useAudio } from "@/hooks/useAudio";
import { ProgressRing } from "@/components/pomodoro/ProgressRing";
import { TimerDisplay } from "@/components/pomodoro/TimerDisplay";
import { TimerControls } from "@/components/pomodoro/TimerControls";
import { SessionIndicator } from "@/components/pomodoro/SessionIndicator";
import { PlaylistSelector } from "@/components/pomodoro/PlaylistSelector";
import { NowPlaying } from "@/components/pomodoro/NowPlaying";
import { ThemeToggle } from "@/components/pomodoro/ThemeToggle";
import { SettingsPanel } from "@/components/pomodoro/SettingsPanel";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const timer = useTimer({ focusDuration: 25, breakDuration: 5 });
  const audio = useAudio();

  // Sync audio with session changes
  useEffect(() => {
    timer.setOnSessionChange((newSession) => {
      audio.switchToSession(newSession);
    });
  }, [timer.setOnSessionChange, audio.switchToSession]);

  const handleStart = () => {
    timer.start();
    audio.startAudio(timer.sessionType);
  };

  const handlePause = () => {
    timer.pause();
    audio.stopAudio();
  };

  const handleReset = () => {
    timer.reset();
    audio.stopAudio();
  };

  const handleSkip = () => {
    timer.skipSession();
    if (timer.isRunning) {
      audio.startAudio(timer.sessionType === "focus" ? "break" : "focus");
    }
  };

  const toggleAudio = () => {
    if (audio.isPlaying) {
      audio.stopAudio();
    } else {
      audio.startAudio(timer.sessionType);
    }
  };

  const currentPlaylist =
    timer.sessionType === "focus" ? audio.focusPlaylist : audio.breakPlaylist;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg font-semibold text-foreground">Anchored Focus</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="h-10 w-10 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 gap-8">
        {/* Timer Section */}
        <div className="flex flex-col items-center gap-6">
          <SessionIndicator
            sessionType={timer.sessionType}
            completedSessions={timer.completedSessions}
          />

          <ProgressRing
            progress={timer.progress}
            sessionType={timer.sessionType}
            size={280}
          >
            <TimerDisplay timeRemaining={timer.timeRemaining} />
          </ProgressRing>

          <TimerControls
            isRunning={timer.isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onSkip={handleSkip}
          />

          {/* Now Playing */}
          <NowPlaying
            isPlaying={audio.isPlaying}
            playlist={currentPlaylist}
            sessionType={timer.sessionType}
            onToggle={toggleAudio}
          />
        </div>

        {/* Settings & Playlists */}
        {showSettings && (
          <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SettingsPanel
              focusDuration={timer.settings.focusDuration}
              breakDuration={timer.settings.breakDuration}
              onFocusChange={(v) => timer.updateSettings({ focusDuration: v })}
              onBreakChange={(v) => timer.updateSettings({ breakDuration: v })}
            />

            <PlaylistSelector
              sessionType="focus"
              playlists={audio.focusPlaylists}
              selected={audio.focusPlaylist}
              onSelect={audio.setFocusPlaylist}
            />

            <PlaylistSelector
              sessionType="break"
              playlists={audio.breakPlaylists}
              selected={audio.breakPlaylist}
              onSelect={audio.setBreakPlaylist}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
