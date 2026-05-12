// Dev data events: рассылает события обновления demo-data между экранами без перезапуска app.
import { useEffect, useState } from 'react';

let version = 0;
const listeners = new Set<() => void>();

export function emitDevDataChanged() {
  version += 1;
  for (const listener of listeners) listener();
}

export function useDevDataVersion() {
  const [currentVersion, setCurrentVersion] = useState(version);

  useEffect(() => {
    const listener = () => setCurrentVersion(version);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return currentVersion;
}
