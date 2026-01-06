import { useState, useEffect, useCallback, useRef } from "react";

export type SessionType = "focus" | "break";

interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
}

interface TimerState {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  sessionType: SessionType;
  completedSessions: number;
  settings: TimerSettings;
}

export function useTimer(initialSettings?: Partial<TimerSettings>) {
  const [state, setState] = useState<TimerState>({
    timeRemaining: (initialSettings?.focusDuration ?? 25) * 60,
    isRunning: false,
    sessionType: "focus",
    completedSessions: 0,
    settings: {
      focusDuration: initialSettings?.focusDuration ?? 25,
      breakDuration: initialSettings?.breakDuration ?? 5,
    },
  });

  const intervalRef = useRef<number | null>(null);
  const onSessionChangeRef = useRef<((type: SessionType) => void) | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchSession = useCallback(() => {
    setState((prev) => {
      const newType = prev.sessionType === "focus" ? "break" : "focus";
      const newDuration =
        newType === "focus"
          ? prev.settings.focusDuration
          : prev.settings.breakDuration;

      // Trigger callback
      if (onSessionChangeRef.current) {
        onSessionChangeRef.current(newType);
      }

      return {
        ...prev,
        sessionType: newType,
        timeRemaining: newDuration * 60,
        completedSessions:
          prev.sessionType === "focus"
            ? prev.completedSessions + 1
            : prev.completedSessions,
      };
    });
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Session complete - switch automatically
            const newType = prev.sessionType === "focus" ? "break" : "focus";
            const newDuration =
              newType === "focus"
                ? prev.settings.focusDuration
                : prev.settings.breakDuration;

            // Trigger callback
            setTimeout(() => {
              if (onSessionChangeRef.current) {
                onSessionChangeRef.current(newType);
              }
            }, 0);

            return {
              ...prev,
              sessionType: newType,
              timeRemaining: newDuration * 60,
              completedSessions:
                prev.sessionType === "focus"
                  ? prev.completedSessions + 1
                  : prev.completedSessions,
            };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      clearTimerInterval();
    }

    return clearTimerInterval;
  }, [state.isRunning, clearTimerInterval]);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      timeRemaining:
        prev.sessionType === "focus"
          ? prev.settings.focusDuration * 60
          : prev.settings.breakDuration * 60,
    }));
  }, []);

  const skipSession = useCallback(() => {
    clearTimerInterval();
    switchSession();
  }, [clearTimerInterval, switchSession]);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setState((prev) => {
      const updated = { ...prev.settings, ...newSettings };
      return {
        ...prev,
        settings: updated,
        timeRemaining:
          prev.sessionType === "focus"
            ? updated.focusDuration * 60
            : updated.breakDuration * 60,
        isRunning: false,
      };
    });
  }, []);

  const setOnSessionChange = useCallback(
    (callback: (type: SessionType) => void) => {
      onSessionChangeRef.current = callback;
    },
    []
  );

  const progress =
    state.sessionType === "focus"
      ? 1 - state.timeRemaining / (state.settings.focusDuration * 60)
      : 1 - state.timeRemaining / (state.settings.breakDuration * 60);

  return {
    ...state,
    progress,
    start,
    pause,
    reset,
    skipSession,
    updateSettings,
    setOnSessionChange,
  };
}
