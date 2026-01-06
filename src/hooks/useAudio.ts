import { useRef, useCallback, useState, useEffect } from "react";
import type { SessionType } from "./useTimer";
import type { StoredTrack } from "./useMusicStorage";

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
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>("focus");

  const [focusPlaylist, setFocusPlaylist] = useState<Playlist>(
    FOCUS_PLAYLISTS[0]
  );
  const [breakPlaylist, setBreakPlaylist] = useState<Playlist>(
    BREAK_PLAYLISTS[0]
  );

  // Custom track selection
  const [selectedFocusTrack, setSelectedFocusTrack] = useState<StoredTrack | null>(null);
  const [selectedBreakTrack, setSelectedBreakTrack] = useState<StoredTrack | null>(null);

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

  const stopOscillator = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
  }, []);

  const stopAudioElement = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
      audioElementRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    stopOscillator();
    stopAudioElement();
    setIsPlaying(false);
  }, [stopOscillator, stopAudioElement]);

  const playCustomTrack = useCallback((track: StoredTrack) => {
    stopOscillator();
    stopAudioElement();

    const url = URL.createObjectURL(track.blob);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
    
    audioElementRef.current = audio;
    setIsPlaying(true);
  }, [stopOscillator, stopAudioElement]);

  const startAudio = useCallback(
    (session: SessionType) => {
      const customTrack = session === "focus" ? selectedFocusTrack : selectedBreakTrack;
      
      // If custom track is selected, play it
      if (customTrack) {
        playCustomTrack(customTrack);
        setCurrentSession(session);
        return;
      }

      const playlist = session === "focus" ? focusPlaylist : breakPlaylist;
      if (playlist.id === "silence") {
        stopAudio();
        return;
      }

      stopAudioElement();

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // Stop existing oscillator
      stopOscillator();

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
    [focusPlaylist, breakPlaylist, selectedFocusTrack, selectedBreakTrack, playCustomTrack, stopAudio, stopOscillator, stopAudioElement]
  );

  const switchToSession = useCallback(
    (session: SessionType) => {
      if (isPlaying) {
        startAudio(session);
      }
      setCurrentSession(session);
    },
    [isPlaying, startAudio]
  );

  const selectFocusTrack = useCallback((track: StoredTrack | null) => {
    setSelectedFocusTrack(track);
    // Clear preset playlist selection when custom track is selected
    if (track) {
      setFocusPlaylist({ id: "custom", name: track.name, icon: "🎵" });
    }
  }, []);

  const selectBreakTrack = useCallback((track: StoredTrack | null) => {
    setSelectedBreakTrack(track);
    if (track) {
      setBreakPlaylist({ id: "custom", name: track.name, icon: "🎵" });
    }
  }, []);

  const selectFocusPlaylist = useCallback((playlist: Playlist) => {
    setFocusPlaylist(playlist);
    setSelectedFocusTrack(null); // Clear custom track when preset is selected
  }, []);

  const selectBreakPlaylist = useCallback((playlist: Playlist) => {
    setBreakPlaylist(playlist);
    setSelectedBreakTrack(null);
  }, []);

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
    selectedFocusTrack,
    selectedBreakTrack,
    setFocusPlaylist: selectFocusPlaylist,
    setBreakPlaylist: selectBreakPlaylist,
    selectFocusTrack,
    selectBreakTrack,
    startAudio,
    stopAudio,
    switchToSession,
    focusPlaylists: FOCUS_PLAYLISTS,
    breakPlaylists: BREAK_PLAYLISTS,
  };
}
