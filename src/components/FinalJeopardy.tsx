import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Round, Team } from '../types';
import { playCorrectSound, playWrongSound, playRevealSound } from '../utils/sounds';

interface FinalJeopardyProps {
  round: Round;
  teams: Team[];
  soundEnabled: boolean;
  onComplete: (results: { teamId: string; wager: number; correct: boolean }[]) => void;
  onBack: () => void;
}

type FJPhase = 'category' | 'wagers' | 'question' | 'reveal';

export default function FinalJeopardy({ round, teams, soundEnabled, onComplete, onBack }: FinalJeopardyProps) {
  const [phase, setPhase] = useState<FJPhase>('category');
  const [wagers, setWagers] = useState<Record<string, number>>(() =>
    Object.fromEntries(teams.map(t => [t.id, 0]))
  );
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [revealedTeams, setRevealedTeams] = useState<string[]>([]);

  const category = round.categories[0];
  const question = category?.questions[0];
  if (!category || !question) return null;

  const handleSetWager = (teamId: string, val: number) => {
    const team = teams.find(t => t.id === teamId);
    const maxWager = Math.max(team?.score || 0, 0);
    setWagers(prev => ({ ...prev, [teamId]: Math.min(Math.max(0, val), maxWager) }));
  };

  const handleRevealTeam = (teamId: string, correct: boolean) => {
    setResults(prev => ({ ...prev, [teamId]: correct }));
    setRevealedTeams(prev => [...prev, teamId]);
    if (soundEnabled) {
      correct ? playCorrectSound() : playWrongSound();
    }
  };

  const handleFinish = () => {
    const finalResults = teams.map(t => ({
      teamId: t.id,
      wager: wagers[t.id] || 0,
      correct: results[t.id] || false,
    }));
    onComplete(finalResults);
  };

  return (
    <div className="fixed inset-0 z-50 bg-jeopardy-dark flex flex-col">
      {/* Category reveal */}
      {phase === 'category' && (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-purple-900/30 to-jeopardy-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-white/50 text-xl uppercase tracking-widest">Final Jeopardy</p>
          <motion.h2
            className="text-5xl md:text-7xl font-black text-purple-300 text-center px-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            style={{ textShadow: '0 0 30px rgba(168,85,247,0.4)' }}
          >
            {category.name}
          </motion.h2>
          <button
            onClick={() => setPhase('wagers')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xl cursor-pointer mt-8"
          >
            Collect Wagers
          </button>
          <button onClick={onBack} className="text-white/40 hover:text-white cursor-pointer mt-4">
            &larr; Back to board
          </button>
        </motion.div>
      )}

      {/* Wager collection */}
      {phase === 'wagers' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <h2 className="text-3xl font-bold text-purple-300 mb-4">Enter Wagers</h2>
          <div className="grid gap-4 w-full max-w-lg">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="font-bold flex-1">{team.name}</span>
                <span className="text-white/40 text-sm">Max: ${Math.max(team.score, 0)}</span>
                <input
                  type="number"
                  value={wagers[team.id] || 0}
                  onChange={e => handleSetWager(team.id, parseInt(e.target.value) || 0)}
                  className="w-28 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-right font-bold text-jeopardy-gold focus:outline-none focus:border-purple-400"
                  min={0}
                  max={Math.max(team.score, 0)}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase('question')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xl cursor-pointer mt-4"
          >
            Show Question
          </button>
        </div>
      )}

      {/* Question display */}
      {phase === 'question' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-jeopardy-blue p-8 overflow-y-auto">
          <p className="text-white/50 uppercase tracking-widest">{category.name}</p>
          <motion.p
            className="text-2xl md:text-4xl font-bold text-center max-w-4xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            {question.questionText}
          </motion.p>
          {/* Multiple choice grid */}
          {question.choices && question.choices.length > 0 && (
            <div className="grid grid-cols-2 gap-3 max-w-3xl w-full">
              {question.choices.map((choice, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx];
                return (
                  <div key={idx} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border-2 border-white/20">
                    <span className="text-xl font-black w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white/70 shrink-0">{letter}</span>
                    <span className="text-lg md:text-xl font-medium text-white">{choice}</span>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => { setPhase('reveal'); if (soundEnabled) playRevealSound(); }}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl cursor-pointer mt-4"
          >
            Reveal Answer &amp; Judge
          </button>
        </div>
      )}

      {/* Reveal & judge */}
      {phase === 'reveal' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 overflow-y-auto">
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-8 py-4 text-center mb-2">
            <p className="text-green-400 text-sm uppercase tracking-wide mb-1">Correct Answer</p>
            <p className="text-2xl md:text-3xl font-bold text-green-300">
              {['A', 'B', 'C', 'D'][question.correctChoice ?? 0]}: {question.answer}
            </p>
          </div>

          <div className="grid gap-3 w-full max-w-lg">
            {teams.map(team => {
              const revealed = revealedTeams.includes(team.id);
              const correct = results[team.id];
              return (
                <div key={team.id} className={`flex items-center gap-4 rounded-xl p-4 transition-colors ${
                  revealed ? (correct ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30') : 'bg-white/5 border border-white/10'
                }`}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="font-bold flex-1">{team.name}</span>
                  <span className="text-jeopardy-gold font-bold">${wagers[team.id] || 0}</span>
                  {!revealed ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRevealTeam(team.id, true)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg cursor-pointer font-bold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRevealTeam(team.id, false)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer font-bold"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <span className={`font-bold ${correct ? 'text-green-400' : 'text-red-400'}`}>
                      {correct ? `+$${wagers[team.id]}` : `-$${wagers[team.id]}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {revealedTeams.length === teams.length && (
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-jeopardy-gold text-black font-bold rounded-xl text-xl cursor-pointer mt-6 hover:bg-yellow-400"
            >
              Finish Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}
