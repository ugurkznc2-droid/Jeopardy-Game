import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useState, useEffect } from 'react';

export default function ScoreboardPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore(s => s.games.find(g => g.id === gameId));

  if (!game || !gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jeopardy-dark">
        <p className="text-white/50">Game not found</p>
      </div>
    );
  }

  const sorted = [...game.teams].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isComplete = game.status === 'completed';

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const podiumHeights = [220, 280, 180]; // 2nd, 1st, 3rd

  return (
    <div className="h-screen bg-gradient-to-b from-jeopardy-dark via-[#000a3a] to-jeopardy-dark flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-10 py-5 shrink-0">
        <button
          onClick={() => navigate(game.status === 'active' ? `/play/${gameId}` : '/')}
          className="text-white/40 hover:text-white cursor-pointer text-xl"
        >
          &larr; {game.status === 'active' ? 'Back to Game' : 'Home'}
        </button>
        <h1 className="text-2xl font-bold text-jeopardy-gold">{game.title}</h1>
        <button
          onClick={toggleFullscreen}
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-center py-6 shrink-0">
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <p className="text-white/40 text-lg uppercase tracking-widest mb-3">Champion</p>
            <h2 className="text-5xl md:text-7xl font-black animate-pulse-glow inline-block px-10 py-3 rounded-2xl" style={{ color: winner?.color, textShadow: `0 0 30px ${winner?.color}40` }}>
              {winner?.name}
            </h2>
          </motion.div>
        )}
        {!isComplete && (
          <h2 className="text-3xl font-bold text-white/80">Scoreboard</h2>
        )}
      </div>

      {/* Podium for top 3 */}
      {sorted.length >= 2 && (
        <div className="flex items-end justify-center gap-6 px-10 mb-6 shrink-0" style={{ minHeight: '320px' }}>
          {[sorted[1], sorted[0], sorted[2]].filter(Boolean).map((team, i) => {
            const place = [2, 1, 3][i];
            const height = podiumHeights[i];
            return (
              <motion.div
                key={team.id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
              >
                <AnimatedScore score={team.score} color={team.color} />
                <div
                  className="font-bold text-lg mt-3 mb-4 px-6 py-2.5 rounded-2xl border-2 shadow-lg"
                  style={{
                    backgroundColor: `${team.color}20`,
                    borderColor: team.color,
                    color: 'white',
                    boxShadow: `0 4px 20px ${team.color}30`,
                  }}
                >
                  {team.name}
                </div>
                <motion.div
                  className="w-36 md:w-44 rounded-t-2xl flex flex-col items-center justify-center gap-1"
                  style={{ backgroundColor: `${team.color}30`, borderTop: `4px solid ${team.color}` }}
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 50 }}
                >
                  <span className="text-5xl font-black text-white/80">#{place}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full standings — centered in remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-10 pb-6">
        <div className="max-w-2xl w-full">
          <h3 className="text-white/40 text-sm uppercase tracking-widest mb-5 text-center">Full Standings</h3>
          <div className="space-y-3">
            {sorted.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-5 rounded-2xl px-6 py-4 border-2"
                style={{
                  backgroundColor: `${team.color}10`,
                  borderColor: `${team.color}40`,
                }}
              >
                <span className="text-2xl font-black w-10" style={{ color: `${team.color}80` }}>#{i + 1}</span>
                <div className="w-5 h-5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: team.color }} />
                <span className="font-bold flex-1 text-lg">{team.name}</span>
                <span className="text-2xl font-black tabular-nums" style={{ color: team.color }}>
                  ${team.score.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-center gap-4 mt-8 shrink-0">
          {game.status === 'active' && (
            <button
              onClick={() => navigate(`/play/${gameId}`)}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold cursor-pointer"
            >
              Back to Game
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

function AnimatedScore({ score, color }: { score: number; color: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const step = score / steps;
    let current = 0;
    let count = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        count++;
        current += step;
        if (count >= steps) {
          setDisplay(score);
          clearInterval(interval);
        } else {
          setDisplay(Math.round(current));
        }
      }, duration / steps);
    }, 800);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <span className="text-4xl md:text-5xl font-black tabular-nums" style={{ color, textShadow: `0 0 20px ${color}40` }}>
      ${display.toLocaleString()}
    </span>
  );
}
