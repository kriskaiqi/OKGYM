import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownReturn {
  timeLeft: number;
  isActive: boolean;
  startCountdown: (duration: number) => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
}

/**
 * Custom hook for implementing a countdown timer
 * Used for rest periods between exercise sets
 */
const useCountdown = (initialTime: number = 0): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(0);

  // Start countdown with specified duration
  const startCountdown = useCallback((duration: number) => {
    if (isActive) {
      stopCountdown();
    }
    
    setTimeLeft(duration);
    setIsActive(true);
    endTimeRef.current = Date.now() + duration * 1000;
    
    intervalRef.current = setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      
      setTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        stopCountdown();
      }
    }, 1000);
  }, [isActive]);

  // Stop the countdown
  const stopCountdown = useCallback(() => {
    if (!isActive) return;
    
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isActive]);

  // Reset the countdown
  const resetCountdown = useCallback(() => {
    stopCountdown();
    setTimeLeft(0);
    endTimeRef.current = 0;
  }, [stopCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { timeLeft, isActive, startCountdown, stopCountdown, resetCountdown };
};

export default useCountdown;
