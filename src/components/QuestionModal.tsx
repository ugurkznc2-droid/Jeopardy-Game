import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question, Team } from '../types';
import Timer from './Timer';
import { playCorrectSound, playWrongSound, playDailyDoubleSound, playTimerTickSound, playTimerExpiredSound, playRevealSound } from '../utils/sounds';

interface QuestionModalProps {
  question: Question | null;
  categoryName: string;
  teams: Team[];
  timerSeconds: number;
  soundEnabled: boolean;
  onAnswer: (teamId: string, correct: boolean, wager?: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

type Phase = 'dailyDouble' | 'question' | 'answered';

export default function QuestionModal({
  question, categoryName, teams, timerSeconds, soundEnabled,
  onAnswer, onSkip, onClose,
}: QuestionModalProps) {
  const [phase, setPhase] = useState<Phase>('question');
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [wager, setWager] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (!question) return;
    if (question.isDailyDouble) {
      setPhase('dailyDouble');
      if (soundEnabled) playDailyDoubleSound();
    } else {
      setPhase('question');
      setTimerRunning(true);
    }
    setShowAnswer(false);
    setSelectedTeam(null);
    setFeedback(null);
    setWager(0);
  }, [question?.id]);

  const handleRevealAnswer = useCallback(() => {
    setShowAnswer(true);
    setTimerRunning(false);
    if (soundEnabled) playRevealSound();
  }, [soundEnabled]);

  const handleCorrect = useCallback((teamId: string) => {
    setFeedback('correct');
    if (soundEnabled) playCorrectSound();
    setTimeout(() => {
      onAnswer(teamId, true, question?.isDailyDouble ? wager : undefined);
    }, 800);
  }, [soundEnabled, question, wager, onAnswer]);

  const handleWrong = useCallback((teamId: string) => {
    setFeedback('wrong');
    if (soundEnabled) playWrongSound();
    setTimeout(() => {
      onAnswer(teamId, false, question?.isDailyDouble ? wager : undefined);
    }, 800);
  }, [soundEnabled, question, wager, onAnswer]);

  const handleTimerTick = useCallback((remaining: number) => {
    if (remaining <= 5 && remaining > 0 && soundEnabled) {
      playTimerTickSound();
    }
  }, [soundEnabled]);

  const handleTimerExpired = useCallback(() => {
    if (soundEnabled) playTimerExpiredSound();
    setTimerRunning(false);
  }, [soundEnabled]);

  const handleStartDailyDouble = () => {
    if (!selectedTeam) return;
    setPhase('question');
    setTimerRunning(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!question) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        setTimerRunning(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        handleRevealAnswer();
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < teams.length && showAnswer) {
          handleCorrect(teams[idx].id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [question, teams, showAnswer, handleRevealAnswer, handleCorrect, onClose]);

  if (!question) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-jeopardy-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Feedback overlay */}
        {feedback && (
          <div className={`absolute inset-0 z-[60] pointer-events-none ${feedback === 'correct' ? 'flash-correct' : 'flash-wrong'}`} />
        )}

        {/* Daily Double phase */}
        {phase === 'dailyDouble' && (
          <motion.div className="flex-1 bg-jeopardy-dark flex flex-col items-center justify-center gap-8">
            <motion.div
              className="animate-dd-spin"
            >
              <h2 className="text-7xl md:text-8xl font-black text-jeopardy-gold" style={{ textShadow: '0 0 40px rgba(255,215,0,0.5)' }}>
                DAILY DOUBLE!
              </h2>
            </motion.div>
            <p className="text-white/60 text-xl">Category: {categoryName}</p>

            <div className="space-y-4 w-full max-w-md">
              <div>
                <label className="text-white/50 text-sm block mb-2">Select Team</label>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((team, i) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className={`px-4 py-3 rounded-lg font-bold cursor-pointer transition-all text-lg ${
                        selectedTeam === team.id
                          ? 'ring-2 ring-white scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name} <span className="text-sm font-normal opacity-70">({i + 1})</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/50 text-sm block mb-2">Wager Amount</label>
                <input
                  type="number"
                  value={wager}
                  onChange={e => setWager(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-2xl font-bold text-jeopardy-gold text-center focus:outline-none focus:border-jeopardy-gold"
                  min={0}
                />
              </div>
              <button
                onClick={handleStartDailyDouble}
                disabled={!selectedTeam}
                className="w-full py-3 bg-jeopardy-gold text-black font-bold rounded-lg text-xl hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Show Question
              </button>
            </div>
          </motion.div>
        )}

        {/* Question phase */}
        {phase === 'question' && (
          <div className="h-full bg-jeopardy-blue flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-black/20 shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-medium">{categoryName}</span>
                {!question.isDailyDouble && (
                  <span className="text-jeopardy-gold font-bold text-xl">${question.pointValue}</span>
                )}
                {question.isDailyDouble && (
                  <span className="text-yellow-300 font-bold">Daily Double - Wager: ${wager}</span>
                )}
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white text-2xl cursor-pointer">&times;</button>
            </div>

            {/* Question display */}
            <div className="flex-1 flex items-center justify-center p-8 min-h-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center max-w-4xl"
              >
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  {question.questionText}
                </p>
                {question.imageUrl && (
                  <img src={question.imageUrl} alt="" className="max-h-48 mx-auto mt-6 rounded-lg shadow-xl" />
                )}
              </motion.div>
            </div>

            {/* Timer */}
            <div className="flex justify-center py-3 shrink-0">
              <Timer
                seconds={timerSeconds}
                running={timerRunning}
                onTick={handleTimerTick}
                onExpired={handleTimerExpired}
              />
            </div>

            {/* Answer reveal */}
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/50 border-t border-green-500/30 px-8 py-4 text-center shrink-0"
              >
                <p className="text-sm text-green-400 mb-1 uppercase tracking-wide">Answer</p>
                <p className="text-2xl md:text-3xl font-bold text-green-300">{question.answer}</p>
              </motion.div>
            )}

            {/* Controls */}
            <div className="bg-black/30 px-6 py-3 shrink-0">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!showAnswer && (
                  <>
                    <button
                      onClick={() => setTimerRunning(r => !r)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer font-medium"
                    >
                      {timerRunning ? '⏸ Pause' : '▶ Start'} <span className="text-white/40 text-xs ml-1">Space</span>
                    </button>
                    <button
                      onClick={handleRevealAnswer}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg cursor-pointer font-bold"
                    >
                      Reveal Answer <span className="text-white/60 text-xs ml-1">R</span>
                    </button>
                  </>
                )}

                {showAnswer && (
                  <>
                    {question.isDailyDouble && selectedTeam ? (
                      <div className="flex gap-2">
                        {teams.filter(t => t.id === selectedTeam).map(team => (
                          <div key={team.id} className="flex items-center gap-2">
                            <span className="font-bold px-3 py-1 rounded" style={{ backgroundColor: team.color }}>
                              {team.name}
                            </span>
                            <button
                              onClick={() => handleCorrect(team.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg cursor-pointer font-bold text-lg"
                            >
                              ✓ Correct
                            </button>
                            <button
                              onClick={() => handleWrong(team.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer font-bold text-lg"
                            >
                              ✗ Wrong
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {teams.map((team, i) => (
                          <div key={team.id} className="flex items-center gap-1">
                            <span className="font-bold px-2 py-1 rounded text-sm" style={{ backgroundColor: team.color }}>
                              {team.name} <span className="opacity-60">({i + 1})</span>
                            </span>
                            <button
                              onClick={() => handleCorrect(team.id)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg cursor-pointer font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleWrong(team.id)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer font-bold"
                            >
                              ✗
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}

                <button
                  onClick={onSkip}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer text-white/60"
                >
                  No Answer / Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
