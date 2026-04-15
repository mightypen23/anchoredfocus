import { useRef, useCallback, useState, useEffect } from "react";
import type { SessionType } from "./useTimer";
import type { StoredTrack } from "./useMusicStorage";

export function useAudio() {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionType>("focus");

  const [selectedFocusTrack, setSelectedFocusTrack] = useState<StoredTrack | null>(null);
  const [selectedBreakTrack, setSelectedBreakTrack] = useState<StoredTrack | null>(null);

  // --- Preview (independent of timer) ---
  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = "";
      previewAudioRef.current = null;
    }
    setPreviewingTrackId(null);
  }, []);

  const togglePreview = useCallback((track: StoredTrack) => {
    if (previewingTrackId === track.id) {
      stopPreview();
      return;
    }
    stopPreview();
    const url = URL.createObjectURL(track.blob);
    const audio = new Audio(url);
    audio.loop = false;
    audio.volume = 0.5;
    audio.onended = () => setPreviewingTrackId(null);
    audio.play();
    previewAudioRef.current = audio;
    setPreviewingTrackId(track.id);
  }, [previewingTrackId, stopPreview]);

  // --- Main playback (tied to timer) ---
  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
      audioElementRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioElementRef.current && audioElementRef.current.src) {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const playTrack = useCallback((track: StoredTrack) => {
    stopAudio();
    stopPreview(); // stop any preview when main playback starts
    const url = URL.createObjectURL(track.blob);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
    audioElementRef.current = audio;
    setIsPlaying(true);
  }, [stopAudio, stopPreview]);

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

  // Select track without auto-playing
  const selectFocusTrack = useCallback((track: StoredTrack | null) => {
    setSelectedFocusTrack(track);
  }, []);

  const selectBreakTrack = useCallback((track: StoredTrack | null) => {
    setSelectedBreakTrack(track);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
      stopPreview();
    };
  }, [stopAudio, stopPreview]);

  return {
    isPlaying,
    currentSession,
    selectedFocusTrack,
    selectedBreakTrack,
    selectFocusTrack,
    selectBreakTrack,
    startAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    switchToSession,
    previewingTrackId,
    togglePreview,
    stopPreview,
  };
}
