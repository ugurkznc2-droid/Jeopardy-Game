import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Team } from '../types';

interface ScoreboardProps {
  teams: Team[];
  compact?: boolean;
}

export default function Scoreboard({ teams, compact }: ScoreboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {sorted.map(team => (
          <CompactScore key={team.id} team={team} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-6 flex-wrap">
      {sorted.map((team, i) => (
        <motion.div
          key={team.id}
          layout
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
        >
          <AnimatedScore score={team.score} color={team.color} large />
          <div
            className="mt-2 px-4 py-2 rounded-lg font-bold text-sm"
            style={{ backgroundColor: team.color }}
          >
            {team.name}
          </div>
          {i === 0 && sorted.length > 1 && team.score > sorted[1].score && (
            <span className="text-jeopardy-gold text-xs mt-1">Leading</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function CompactScore({ team }: { team: Team }) {
  return (
    <motion.div
      layout
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: `${team.color}30`, borderLeft: `3px solid ${team.color}` }}
    >
      <span className="font-medium text-sm">{team.name}</span>
      <AnimatedScore score={team.score} color={team.color} />
    </motion.div>
  );
}

function AnimatedScore({ score, color, large }: { score: number; color: string; large?: boolean }) {
  const [display, setDisplay] = useState(score);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (display === score) return;
    setAnimating(true);
    const diff = score - display;
    const steps = 20;
    const step = diff / steps;
    let current = display;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      current += step;
      if (count >= steps) {
        setDisplay(score);
        setAnimating(false);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(current));
      }
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <span
      className={`font-black tabular-nums transition-transform ${large ? 'text-4xl' : 'text-lg'} ${animating ? 'animate-score-pop' : ''}`}
      style={{ color }}
    >
      ${display.toLocaleString()}
    </span>
  );
}
