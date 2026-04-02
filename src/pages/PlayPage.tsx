import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import GameBoard from '../components/GameBoard';
import QuestionModal from '../components/QuestionModal';
import Scoreboard from '../components/Scoreboard';
import SoundToggle from '../components/SoundToggle';
import FinalJeopardy from '../components/FinalJeopardy';
import ConfirmDialog from '../components/ConfirmDialog';
import { playSelectSound } from '../utils/sounds';

export default function PlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore(s => s.games.find(g => g.id === gameId));
  const { updateGame, updateScore, revealQuestion, advanceRound, completeGame, resetBoard } = useGameStore();

  const [activeQuestion, setActiveQuestion] = useState<{ categoryId: string; questionId: string } | null>(null);
  const [showFinalJeopardy, setShowFinalJeopardy] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);

  if (!game || !gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jeopardy-dark">
        <p className="text-white/50 text-xl">Game not found</p>
        <button onClick={() => navigate('/')} className="ml-4 px-4 py-2 bg-jeopardy-gold text-black rounded-lg font-bold cursor-pointer">
          Home
        </button>
      </div>
    );
  }

  const currentRound = game.rounds[game.currentRound];
  if (!currentRound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jeopardy-dark">
        <p className="text-white/50 text-xl">No rounds configured</p>
      </div>
    );
  }

  const selectedQuestion = activeQuestion
    ? currentRound.categories.find(c => c.id === activeQuestion.categoryId)
      ?.questions.find(q => q.id === activeQuestion.questionId)
    : null;

  const selectedCategoryName = activeQuestion
    ? currentRound.categories.find(c => c.id === activeQuestion.categoryId)?.name || ''
    : '';

  // Check if current round is complete
  const isRoundComplete = currentRound.type === 'standard' &&
    currentRound.categories.every(c => c.questions.every(q => q.isRevealed));

  const hasNextRound = game.currentRound < game.rounds.length - 1;
  const nextRound = hasNextRound ? game.rounds[game.currentRound + 1] : null;

  const handleSelectQuestion = (categoryId: string, questionId: string) => {
    if (game.soundEnabled) playSelectSound();
    setActiveQuestion({ categoryId, questionId });
  };

  const handleAnswer = (teamId: string, correct: boolean, wager?: number) => {
    if (!activeQuestion) return;
    const q = currentRound.categories
      .find(c => c.id === activeQuestion.categoryId)
      ?.questions.find(q => q.id === activeQuestion.questionId);
    if (!q) return;

    const points = wager ?? q.pointValue;
    updateScore(gameId, teamId, correct ? points : -points);
    revealQuestion(gameId, currentRound.id, activeQuestion.categoryId, activeQuestion.questionId, teamId, correct);
    setActiveQuestion(null);
  };

  const handleSkip = () => {
    if (!activeQuestion) return;
    revealQuestion(gameId, currentRound.id, activeQuestion.categoryId, activeQuestion.questionId);
    setActiveQuestion(null);
  };

  const handleAdvanceRound = () => {
    if (nextRound?.type === 'final') {
      setShowFinalJeopardy(true);
    } else {
      advanceRound(gameId);
    }
    setRoundComplete(false);
  };

  const handleFinalJeopardyComplete = (results: { teamId: string; wager: number; correct: boolean }[]) => {
    results.forEach(r => {
      updateScore(gameId, r.teamId, r.correct ? r.wager : -r.wager);
    });
    // Mark final jeopardy question as revealed
    const finalRound = game.rounds.find(r => r.type === 'final');
    if (finalRound?.categories[0]?.questions[0]) {
      revealQuestion(gameId, finalRound.id, finalRound.categories[0].id, finalRound.categories[0].questions[0].id);
    }
    completeGame(gameId);
    setShowFinalJeopardy(false);
    navigate(`/scoreboard/${gameId}`);
  };

  const toggleSound = () => {
    updateGame(gameId, { soundEnabled: !game.soundEnabled });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeQuestion) return; // modal handles its own shortcuts
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'm' || e.key === 'M') toggleSound();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeQuestion, game.soundEnabled]);

  // Show round complete dialog
  useEffect(() => {
    if (isRoundComplete && !roundComplete && !activeQuestion) {
      setRoundComplete(true);
    }
  }, [isRoundComplete, activeQuestion]);

  return (
    <div className="h-screen flex flex-col bg-jeopardy-dark overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmExit(true)}
            className="text-white/40 hover:text-white cursor-pointer text-xl px-2"
          >
            &larr;
          </button>
          <h1 className="text-lg font-bold text-jeopardy-gold">{game.title}</h1>
          <span className="text-white/40 text-sm px-2 py-0.5 bg-white/10 rounded">
            {currentRound.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/scoreboard/${gameId}`)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer text-sm"
          >
            Scoreboard
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
            title="Fullscreen (F)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          <SoundToggle enabled={game.soundEnabled} onToggle={toggleSound} />
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 rounded-lg cursor-pointer text-sm text-red-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Game board */}
      {currentRound.type === 'standard' && (
        <GameBoard round={currentRound} onSelectQuestion={handleSelectQuestion} />
      )}

      {/* Bottom scoreboard */}
      <div className="shrink-0 px-4 py-3 bg-black/30 border-t border-white/10">
        <Scoreboard teams={game.teams} compact />
      </div>

      {/* Question modal */}
      {selectedQuestion && activeQuestion && (
        <QuestionModal
          question={selectedQuestion}
          categoryName={selectedCategoryName}
          teams={game.teams}
          timerSeconds={game.timerSeconds}
          soundEnabled={game.soundEnabled}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      {/* Final Jeopardy */}
      {showFinalJeopardy && nextRound?.type === 'final' && (
        <FinalJeopardy
          round={nextRound}
          teams={game.teams}
          soundEnabled={game.soundEnabled}
          onComplete={handleFinalJeopardyComplete}
          onBack={() => setShowFinalJeopardy(false)}
        />
      )}

      {/* Round complete dialog */}
      {roundComplete && !activeQuestion && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-[#1a1a4e] border border-jeopardy-gold/30 rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-2xl font-bold text-jeopardy-gold mb-2">Round Complete!</h3>
            <p className="text-white/60 mb-6">{currentRound.name} is finished.</p>
            <Scoreboard teams={game.teams} />
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => setRoundComplete(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                Stay on Board
              </button>
              {hasNextRound && (
                <button
                  onClick={handleAdvanceRound}
                  className="px-6 py-2 bg-jeopardy-gold text-black font-bold rounded-lg hover:bg-yellow-400 cursor-pointer"
                >
                  {nextRound?.type === 'final' ? 'Final Jeopardy!' : `Next: ${nextRound?.name}`}
                </button>
              )}
              {!hasNextRound && (
                <button
                  onClick={() => { completeGame(gameId); navigate(`/scoreboard/${gameId}`); }}
                  className="px-6 py-2 bg-jeopardy-gold text-black font-bold rounded-lg hover:bg-yellow-400 cursor-pointer"
                >
                  Finish Game
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirm exit */}
      <ConfirmDialog
        open={confirmExit}
        title="Leave Game"
        message="Your progress is saved. You can resume from the home screen."
        confirmLabel="Leave"
        onConfirm={() => { setConfirmExit(false); navigate('/'); }}
        onCancel={() => setConfirmExit(false)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset Game"
        message="This will clear all scores and reset all questions to unanswered. This cannot be undone."
        confirmLabel="Reset Everything"
        danger
        onConfirm={() => { resetBoard(gameId); setConfirmReset(false); navigate(`/setup/${gameId}`); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
