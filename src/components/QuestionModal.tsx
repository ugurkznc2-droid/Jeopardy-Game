import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question, Team } from '../types';
import Timer from './Timer';
import { playCorrectSound, playWrongSound, playTimerTickSound, playTimerExpiredSound, playRevealSound } from '../utils/sounds';

interface QuestionModalProps {
  question: Question | null;
  categoryName: string;
  teams: Team[];
  timerSeconds: number;
  soundEnabled: boolean;
  onAnswer: (teamId: string, correct: boolean) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function QuestionModal({
  question, categoryName, teams, timerSeconds, soundEnabled,
  onAnswer, onSkip, onClose,
}: QuestionModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (!question) return;
    setShowAnswer(false);
    setFeedback(null);
    setTimerRunning(true);
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
      onAnswer(teamId, true);
    }, 800);
  }, [soundEnabled, onAnswer]);

  const handleWrong = useCallback((teamId: string) => {
    setFeedback('wrong');
    if (soundEnabled) playWrongSound();
    setTimeout(() => {
      onAnswer(teamId, false);
    }, 800);
  }, [soundEnabled, onAnswer]);

  const handleTimerTick = useCallback((remaining: number) => {
    if (remaining <= 5 && remaining > 0 && soundEnabled) {
      playTimerTickSound();
    }
  }, [soundEnabled]);

  const handleTimerExpired = useCallback(() => {
    if (soundEnabled) playTimerExpiredSound();
    setTimerRunning(false);
  }, [soundEnabled]);

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

        <div className="h-full bg-jeopardy-blue flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-4 bg-black/20 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-white/60 font-medium text-lg">{categoryName}</span>
              <span className="text-jeopardy-gold font-bold text-xl">${question.pointValue}</span>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl cursor-pointer">&times;</button>
          </div>

          {/* Question display + choices */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-4 min-h-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-4xl w-full"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {question.questionText}
              </p>
              {question.imageUrl && (
                <img src={question.imageUrl} alt="" className="max-h-32 mx-auto mb-4 rounded-lg shadow-xl" />
              )}
              {/* Multiple choice grid */}
              {question.choices && question.choices.length > 0 && (
                <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto mt-2">
                  {question.choices.map((choice, idx) => {
                    const letter = ['A', 'B', 'C', 'D'][idx];
                    const isCorrect = idx === question.correctChoice;
                    const revealed = showAnswer;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-left transition-all ${
                          revealed && isCorrect
                            ? 'bg-green-600/40 border-2 border-green-400 scale-[1.02]'
                            : revealed && !isCorrect
                            ? 'bg-white/5 border-2 border-white/10 opacity-50'
                            : 'bg-white/10 border-2 border-white/20'
                        }`}
                      >
                        <span className={`text-xl font-black shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          revealed && isCorrect ? 'bg-green-500 text-white' : 'bg-white/20 text-white/70'
                        }`}>
                          {letter}
                        </span>
                        <span className={`text-lg md:text-xl font-medium ${
                          revealed && isCorrect ? 'text-green-300' : 'text-white'
                        }`}>
                          {choice}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
          <div className="bg-black/30 px-8 py-4 shrink-0">
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

              <button
                onClick={onSkip}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer text-white/60"
              >
                No Answer / Skip
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
