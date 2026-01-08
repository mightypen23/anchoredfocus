import { useRef, useCallback, useState, useEffect } from "react";
import type { SessionType } from "./useTimer";
import type { StoredTrack } from "./useMusicStorage";

export function useAudio() {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>("focus");

  // Custom track selection
  const [selectedFocusTrack, setSelectedFocusTrack] = useState<StoredTrack | null>(null);
  const [selectedBreakTrack, setSelectedBreakTrack] = useState<StoredTrack | null>(null);

  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
      audioElementRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playTrack = useCallback((track: StoredTrack) => {
    stopAudio();

    const url = URL.createObjectURL(track.blob);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
    
    audioElementRef.current = audio;
    setIsPlaying(true);
  }, [stopAudio]);

  const startAudio = useCallback(
    (session: SessionType) => {
      const customTrack = session === "focus" ? selectedFocusTrack : selectedBreakTrack;
      
      if (customTrack) {
        playTrack(customTrack);
        setCurrentSession(session);
      } else {
        stopAudio();
      }
    },
    [selectedFocusTrack, selectedBreakTrack, playTrack, stopAudio]
  );

  const switchToSession = useCallback(
    (session: SessionType) => {
      setCurrentSession(session);
      const customTrack = session === "focus" ? selectedFocusTrack : selectedBreakTrack;
      if (customTrack) {
        playTrack(customTrack);
      } else {
        stopAudio();
      }
    },
    [selectedFocusTrack, selectedBreakTrack, playTrack, stopAudio]
  );

  const selectFocusTrack = useCallback((track: StoredTrack | null) => {
    setSelectedFocusTrack(track);
    // Auto-play if this is the current session
    if (track && currentSession === "focus") {
      playTrack(track);
    } else if (!track && currentSession === "focus") {
      stopAudio();
    }
  }, [currentSession, playTrack, stopAudio]);

  const selectBreakTrack = useCallback((track: StoredTrack | null) => {
    setSelectedBreakTrack(track);
    if (track && currentSession === "break") {
      playTrack(track);
    } else if (!track && currentSession === "break") {
      stopAudio();
    }
  }, [currentSession, playTrack, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    currentSession,
    selectedFocusTrack,
    selectedBreakTrack,
    selectFocusTrack,
    selectBreakTrack,
    startAudio,
    stopAudio,
    switchToSession,
  };
}
