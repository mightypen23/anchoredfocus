import { useState, useEffect, useCallback } from "react";

export interface StoredTrack {
  id: string;
  name: string;
  sessionType: "focus" | "break";
  blob: Blob;
  createdAt: number;
}

const DB_NAME = "anchored-focus-music";
const DB_VERSION = 1;
const STORE_NAME = "tracks";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("sessionType", "sessionType", { unique: false });
      }
    };
  });
}

export function useMusicStorage() {
  const [focusTracks, setFocusTracks] = useState<StoredTrack[]>([]);
  const [breakTracks, setBreakTracks] = useState<StoredTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTracks = useCallback(async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const tracks: StoredTrack[] = request.result;
        setFocusTracks(tracks.filter((t) => t.sessionType === "focus"));
        setBreakTracks(tracks.filter((t) => t.sessionType === "break"));
        setIsLoading(false);
      };

      request.onerror = () => {
        console.error("Failed to load tracks:", request.error);
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Failed to open database:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const addTrack = useCallback(
    async (file: File, sessionType: "focus" | "break"): Promise<StoredTrack | null> => {
      try {
        const db = await openDatabase();
        const track: StoredTrack = {
          id: `${sessionType}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          sessionType,
          blob: file,
          createdAt: Date.now(),
        };

        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.add(track);

          request.onsuccess = () => {
            loadTracks();
            resolve(track);
          };

          request.onerror = () => {
            console.error("Failed to add track:", request.error);
            reject(request.error);
          };
        });
      } catch (error) {
        console.error("Failed to add track:", error);
        return null;
      }
    },
    [loadTracks]
  );

  const removeTrack = useCallback(
    async (trackId: string): Promise<boolean> => {
      try {
        const db = await openDatabase();

        return new Promise((resolve) => {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(trackId);

          request.onsuccess = () => {
            loadTracks();
            resolve(true);
          };

          request.onerror = () => {
            console.error("Failed to remove track:", request.error);
            resolve(false);
          };
        });
      } catch (error) {
        console.error("Failed to remove track:", error);
        return false;
      }
    },
    [loadTracks]
  );

  const getTrackUrl = useCallback((track: StoredTrack): string => {
    return URL.createObjectURL(track.blob);
  }, []);

  return {
    focusTracks,
    breakTracks,
    isLoading,
    addTrack,
    removeTrack,
    getTrackUrl,
  };
}
