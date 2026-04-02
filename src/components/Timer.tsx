import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  seconds: number;
  running: boolean;
  onTick?: (remaining: number) => void;
  onExpired?: () => void;
}

export default function Timer({ seconds, running, onTick, onExpired }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpiredRef = useRef(onExpired);
  const onTickRef = useRef(onTick);

  useEffect(() => { onExpiredRef.current = onExpired; }, [onExpired]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        onTickRef.current?.(next);
        if (next <= 0) {
          clearInterval(interval);
          onExpiredRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, remaining <= 0]);

  const pct = (remaining / seconds) * 100;
  const isLow = remaining <= 5;
  const isExpired = remaining <= 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-4xl font-black tabular-nums transition-colors ${
        isExpired ? 'text-red-500' : isLow ? 'text-red-400 animate-pulse' : 'text-white'
      }`}>
        {remaining}
      </div>
      <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isExpired ? 'bg-red-600' : isLow ? 'bg-red-500' : 'bg-jeopardy-gold'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
