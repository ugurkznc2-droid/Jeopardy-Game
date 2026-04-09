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
  const remainingRef = useRef(remaining);

  useEffect(() => { onExpiredRef.current = onExpired; }, [onExpired]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running || remainingRef.current <= 0) return;
    const interval = setInterval(() => {
      const next = remainingRef.current - 1;
      setRemaining(next);
      // Call callbacks outside of setState to avoid updating parent during render
      if (next > 0) {
        onTickRef.current?.(next);
      } else {
        clearInterval(interval);
        onTickRef.current?.(0);
        onExpiredRef.current?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

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
