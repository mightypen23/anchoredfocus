import { useRef, useCallback, useState, useEffect } from "react";
import type { SessionType } from "./useTimer";

export interface Playlist {
  id: string;
  name: string;
  icon: string;
  audioUrl?: string;
}

export const FOCUS_PLAYLISTS: Playlist[] = [
  { id: "lofi", name: "Lo-Fi Beats", icon: "🎧" },
  { id: "classical", name: "Classical Focus", icon: "🎻" },
  { id: "nature", name: "Nature Sounds", icon: "🌿" },
  { id: "ambient", name: "Ambient", icon: "🌌" },
  { id: "silence", name: "Silence", icon: "🤫" },
];

export const BREAK_PLAYLISTS: Playlist[] = [
  { id: "chill", name: "Chill Vibes", icon: "☕" },
  { id: "jazz", name: "Café Jazz", icon: "🎷" },
  { id: "rain", name: "Rain Sounds", icon: "🌧️" },
  { id: "birds", name: "Birds & Forest", icon: "🐦" },
  { id: "silence", name: "Silence", icon: "🤫" },
];

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>("focus");

  const [focusPlaylist, setFocusPlaylist] = useState<Playlist>(
    FOCUS_PLAYLISTS[0]
  );
  const [breakPlaylist, setBreakPlaylist] = useState<Playlist>(
    BREAK_PLAYLISTS[0]
  );

  const getFrequencyForPlaylist = (playlist: Playlist, session: SessionType) => {
    // Different ambient frequencies for different moods
    const focusFreqs: Record<string, number> = {
      lofi: 180,
      classical: 256,
      nature: 120,
      ambient: 140,
      silence: 0,
    };
    const breakFreqs: Record<string, number> = {
      chill: 200,
      jazz: 220,
      rain: 100,
      birds: 280,
      silence: 0,
    };
    return session === "focus"
      ? focusFreqs[playlist.id] || 150
      : breakFreqs[playlist.id] || 180;
  };

  const startAudio = useCallback(
    (session: SessionType) => {
      const playlist = session === "focus" ? focusPlaylist : breakPlaylist;
      if (playlist.id === "silence") {
        stopAudio();
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // Stop existing
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      // Create ambient sound
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = getFrequencyForPlaylist(playlist, session);

      gain.gain.value = 0.08; // Subtle volume

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainRef.current = gain;
      setIsPlaying(true);
      setCurrentSession(session);
    },
    [focusPlaylist, breakPlaylist]
  );

  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const switchToSession = useCallback(
    (session: SessionType) => {
      if (isPlaying) {
        startAudio(session);
      }
      setCurrentSession(session);
    },
    [isPlaying, startAudio]
  );

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    currentSession,
    focusPlaylist,
    breakPlaylist,
    setFocusPlaylist,
    setBreakPlaylist,
    startAudio,
    stopAudio,
    switchToSession,
    focusPlaylists: FOCUS_PLAYLISTS,
    breakPlaylists: BREAK_PLAYLISTS,
  };
}
