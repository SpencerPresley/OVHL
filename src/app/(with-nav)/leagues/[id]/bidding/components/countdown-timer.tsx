'use client';

import { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  endTime: number;
  onEnd?: () => void;
}

export function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  const [isExpiring, setIsExpiring] = useState(false);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpiring(true);

        // Call the onEnd callback if provided
        if (onEnd) {
          onEnd();
        }

        return false;
      }

      // Set isExpiring flag when less than 10 minutes remain
      setIsExpiring(diff < 10 * 60 * 1000);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
      return true;
    };

    // Calculate immediately
    const shouldContinue = calculateTimeRemaining();

    if (!shouldContinue) {
      return; // End timer if expired
    }

    // Set up RAF-based timing with 1-second frequency
    let lastUpdateTime = 0;
    const animate = (time: number) => {
      // Only update roughly every second
      if (time - lastUpdateTime >= 1000) {
        lastUpdateTime = time;
        calculateTimeRemaining();
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [endTime, onEnd]);

  // Format the time display
  const formatTime = () => {
    const { hours, minutes, seconds } = timeRemaining;

    if (isExpiring && hours === 0 && minutes === 0 && seconds === 0) {
      return 'Ending...';
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return <span className={isExpiring ? 'text-amber-400' : ''}>{formatTime()}</span>;
}
