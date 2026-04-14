import { useEffect, useRef, useState } from 'react';

type Options = {
  enabled: boolean;
  isComplete: boolean;
  delayMs?: number;
  resetKey?: string | number;
  onAdvance: () => void;
};

export function useAutoAdvance({
  enabled,
  isComplete,
  delayMs = 1400,
  resetKey,
  onAdvance,
}: Options) {
  const [countdownMs, setCountdownMs] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasCompleteRef = useRef(isComplete);
  const latestCompleteRef = useRef(isComplete);

  latestCompleteRef.current = isComplete;

  useEffect(() => {
    wasCompleteRef.current = latestCompleteRef.current;
    setCountdownMs(null);
  }, [resetKey]);

  useEffect(() => {
    const becameComplete = !wasCompleteRef.current && isComplete;
    wasCompleteRef.current = isComplete;

    if (!enabled || !isComplete || !becameComplete) {
      setCountdownMs(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setCountdownMs(delayMs);
    const startedAt = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setCountdownMs(Math.max(delayMs - elapsed, 0));
    }, 100);

    timeoutRef.current = setTimeout(() => {
      onAdvance();
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delayMs, enabled, isComplete, onAdvance, resetKey]);

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdownMs(null);
  };

  return {
    active: countdownMs != null,
    countdownMs,
    cancel,
  };
}
