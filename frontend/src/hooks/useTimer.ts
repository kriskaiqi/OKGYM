import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  lap: () => number;
}

/**
 * Custom hook for implementing a timer
 * Used to track workout duration
 */
const useTimer = (initialTime: number = 0): UseTimerReturn => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const laps = useRef<number[]>([]);

  // Start the timer
  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now() - time * 1000;
    
    intervalRef.current = setInterval(() => {
      setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [isRunning, time]);

  // Pause the timer
  const pause = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning]);

  // Reset the timer
  const reset = useCallback(() => {
    pause();
    setTime(0);
    laps.current = [];
    startTimeRef.current = 0;
  }, [pause]);

  // Record a lap time
  const lap = useCallback((): number => {
    laps.current.push(time);
    return time;
  }, [time]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { time, isRunning, start, pause, reset, lap };
};

export default useTimer; 