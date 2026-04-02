import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { generateId, getDefaultPointValues } from '../utils/helpers';
import type { Category, Question, Round } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import CSVImportModal from '../components/CSVImportModal';

export default function SetupPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore(s => s.games.find(g => g.id === gameId));
  const {
    updateGame, addTeam, removeTeam, updateTeam,
    addRound, removeRound,
    addCategory, updateCategory, removeCategory,
    addQuestion, updateQuestion, removeQuestion,
    startGame, resetBoard,
  } = useGameStore();

  const [activeRound, setActiveRound] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCSVImport, setShowCSVImport] = useState(false);

  if (!game || !gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jeopardy-dark">
        <div className="text-center">
          <p className="text-white/50 text-xl mb-4">Game not found</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-jeopardy-gold text-black rounded-lg font-bold cursor-pointer">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentRound = game.rounds[activeRound];

  const validate = (): string[] => {
    const errors: string[] = [];
    if (game.teams.length < 2) errors.push('Add at least 2 teams');
    if (game.rounds.filter(r => r.type === 'standard').length === 0) errors.push('Add at least one round with categories');
    game.rounds.forEach(r => {
      if (r.type === 'standard' && r.categories.length === 0) errors.push(`"${r.name}" needs at least one category`);
      r.categories.forEach(c => {
        if (c.questions.length === 0) errors.push(`Category "${c.name}" needs at least one question`);
      });
    });
    return errors;
  };

  const handleStart = () => {
    const errors = validate();
    if (errors.length > 0) {
      alert('Fix these issues before starting:\n\n' + errors.join('\n'));
      return;
    }
    setConfirmStart(true);
  };

  const handleAddCategory = () => {
    if (!currentRound) return;
    const cat: Category = {
      id: generateId(),
      name: `Category ${currentRound.categories.length + 1}`,
      questions: getDefaultPointValues(5).map(pv => ({
        id: generateId(),
        pointValue: pv,
        questionText: '',
        choices: ['', '', '', ''],
        correctChoice: 0,
        answer: '',
        isDailyDouble: false,
        isRevealed: false,
      })),
    };
    addCategory(gameId, currentRound.id, cat);
  };

  const handleAddRound = () => {
    const round: Round = {
      id: generateId(),
      name: `Round ${game.rounds.filter(r => r.type === 'standard').length + 1}`,
      type: 'standard',
      categories: [],
    };
    addRound(gameId, round);
    setActiveRound(game.rounds.length); // new round index
  };

  const handleAddFinalJeopardy = () => {
    if (game.rounds.some(r => r.type === 'final')) return;
    const round: Round = {
      id: generateId(),
      name: 'Final Jeopardy',
      type: 'final',
      categories: [{
        id: generateId(),
        name: 'Final Category',
        questions: [{
          id: generateId(),
          pointValue: 0,
          questionText: '',
          choices: ['', '', '', ''],
          correctChoice: 0,
          answer: '',
          isDailyDouble: false,
          isRevealed: false,
        }],
      }],
    };
    addRound(gameId, round);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-jeopardy-dark to-[#000a3a] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-jeopardy-dark/90 backdrop-blur-md border-b border-white/10 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-white/50 hover:text-white transition-colors cursor-pointer text-2xl">
              &larr;
            </button>
            <input
              type="text"
              value={game.title}
              onChange={e => updateGame(gameId, { title: e.target.value })}
              className="bg-transparent text-2xl font-bold border-b border-transparent hover:border-white/30 focus:border-jeopardy-gold focus:outline-none px-1 py-1 w-80"
            />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              game.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
              game.status === 'active' ? 'bg-green-500/20 text-green-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {game.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4">
              <label className="text-white/50 text-sm">Timer:</label>
              <input
                type="number"
                value={game.timerSeconds}
                onChange={e => updateGame(gameId, { timerSeconds: Math.max(5, parseInt(e.target.value) || 30) })}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 w-20 text-center focus:outline-none focus:border-jeopardy-gold"
                min={5}
                max={120}
              />
              <span className="text-white/50 text-sm">sec</span>
            </div>
            {game.status === 'active' && (
              <>
                <button
                  onClick={() => navigate(`/play/${gameId}`)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold cursor-pointer"
                >
                  Resume Game
                </button>
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg text-red-300 cursor-pointer"
                >
                  Reset
                </button>
              </>
            )}
            {game.status !== 'active' && (
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-jeopardy-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-10">
        {/* Teams */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-bold mb-4 text-jeopardy-gold">Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {game.teams.map((team, i) => (
              <div key={team.id} className="bg-white/5 border border-white/10 rounded-xl p-4 relative group">
                <button
                  onClick={() => removeTeam(gameId, team.id)}
                  className="absolute top-2 right-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-lg"
                >
                  &times;
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={team.color}
                    onChange={e => updateTeam(gameId, team.id, { color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={team.name}
                    onChange={e => updateTeam(gameId, team.id, { name: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-white/30 focus:border-jeopardy-gold focus:outline-none font-medium flex-1"
                    placeholder={`Team ${i + 1}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white/40 text-xs">Score:</label>
                  <input
                    type="number"
                    value={team.score}
                    onChange={e => updateTeam(gameId, team.id, { score: parseInt(e.target.value) || 0 })}
                    className="bg-white/10 rounded px-2 py-1 w-20 text-sm focus:outline-none focus:border-jeopardy-gold border border-transparent"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addTeam(gameId, `Team ${game.teams.length + 1}`)}
              className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-4 hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer flex items-center justify-center gap-2 text-white/50"
            >
              <span className="text-2xl">+</span> Add Team
            </button>
          </div>
        </motion.section>

        {/* Round tabs */}
        <section>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <h2 className="text-lg font-bold text-jeopardy-gold mr-2">Rounds</h2>
            {game.rounds.map((round, i) => (
              <div key={round.id} className="flex items-center">
                <button
                  onClick={() => setActiveRound(i)}
                  className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                    activeRound === i
                      ? 'bg-jeopardy-blue text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                >
                  {round.name}
                </button>
                {game.rounds.length > 1 && (
                  <button
                    onClick={() => {
                      removeRound(gameId, round.id);
                      setActiveRound(Math.max(0, activeRound - 1));
                    }}
                    className="ml-1 text-white/30 hover:text-red-400 cursor-pointer text-sm"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddRound}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 cursor-pointer text-sm"
            >
              + Round
            </button>
            {!game.rounds.some(r => r.type === 'final') && (
              <button
                onClick={handleAddFinalJeopardy}
                className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-purple-300 cursor-pointer text-sm"
              >
                + Final Jeopardy
              </button>
            )}
          </div>

          {/* Categories for active round */}
          {currentRound && (
            <div className="space-y-4">
              {currentRound.type === 'standard' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={currentRound.name}
                      onChange={e => updateGame(gameId, {
                        rounds: game.rounds.map((r, i) => i === activeRound ? { ...r, name: e.target.value } : r)
                      })}
                      className="bg-transparent text-lg font-medium border-b border-transparent hover:border-white/30 focus:border-jeopardy-gold focus:outline-none"
                    />
                  </div>
                  {currentRound.categories.map(category => (
                    <CategoryEditor
                      key={category.id}
                      category={category}
                      gameId={gameId}
                      roundId={currentRound.id}
                      expanded={expandedCategory === category.id}
                      onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      updateCategory={updateCategory}
                      removeCategory={removeCategory}
                      addQuestion={addQuestion}
                      updateQuestion={updateQuestion}
                      removeQuestion={removeQuestion}
                    />
                  ))}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer text-white/50 font-medium"
                    >
                      + Add Category
                    </button>
                    <button
                      onClick={() => setShowCSVImport(true)}
                      className="px-6 py-4 bg-jeopardy-blue/30 border-2 border-dashed border-jeopardy-blue/50 rounded-xl hover:bg-jeopardy-blue/50 hover:border-jeopardy-blue transition-all cursor-pointer text-blue-300 font-medium"
                    >
                      Import CSV
                    </button>
                  </div>
                </>
              )}

              {currentRound.type === 'final' && currentRound.categories[0] && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-4">Final Jeopardy</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/50 text-sm block mb-1">Category Name</label>
                      <input
                        type="text"
                        value={currentRound.categories[0].name}
                        onChange={e => updateCategory(gameId, currentRound.id, currentRound.categories[0].id, { name: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    {currentRound.categories[0].questions[0] && (
                      <>
                        <div>
                          <label className="text-white/50 text-sm block mb-1">Question</label>
                          <textarea
                            value={currentRound.categories[0].questions[0].questionText}
                            onChange={e => updateQuestion(gameId, currentRound.id, currentRound.categories[0].id, currentRound.categories[0].questions[0].id, { questionText: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400 resize-none h-24"
                          />
                        </div>
                        <div>
                          <label className="text-white/50 text-sm block mb-1">Choices (click radio to mark correct)</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['A', 'B', 'C', 'D'].map((letter, idx) => {
                              const fq = currentRound.categories[0].questions[0];
                              return (
                                <div key={letter} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="fj-correct"
                                    checked={(fq.correctChoice ?? 0) === idx}
                                    onChange={() => updateQuestion(gameId, currentRound.id, currentRound.categories[0].id, fq.id, {
                                      correctChoice: idx,
                                      answer: (fq.choices || ['', '', '', ''])[idx],
                                    })}
                                    className="cursor-pointer accent-green-500"
                                  />
                                  <span className={`text-xs font-bold w-5 ${(fq.correctChoice ?? 0) === idx ? 'text-green-400' : 'text-white/40'}`}>{letter}</span>
                                  <input
                                    type="text"
                                    value={(fq.choices || ['', '', '', ''])[idx] || ''}
                                    onChange={e => {
                                      const newChoices = [...(fq.choices || ['', '', '', ''])];
                                      newChoices[idx] = e.target.value;
                                      const updates: Record<string, unknown> = { choices: newChoices };
                                      if ((fq.correctChoice ?? 0) === idx) updates.answer = e.target.value;
                                      updateQuestion(gameId, currentRound.id, currentRound.categories[0].id, fq.id, updates);
                                    }}
                                    className={`flex-1 bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none ${
                                      (fq.correctChoice ?? 0) === idx
                                        ? 'border-green-500/50 text-green-300 focus:border-green-400'
                                        : 'border-white/20 focus:border-purple-400'
                                    }`}
                                    placeholder={`Choice ${letter}...`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset Game"
        message="This will clear all scores and reset all questions. Are you sure?"
        confirmLabel="Reset"
        danger
        onConfirm={() => { resetBoard(gameId); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={confirmStart}
        title="Start Game"
        message="Ready to start? Teams and questions will be locked during play."
        confirmLabel="Start Game!"
        onConfirm={() => { startGame(gameId); setConfirmStart(false); navigate(`/play/${gameId}`); }}
        onCancel={() => setConfirmStart(false)}
      />
      <CSVImportModal
        open={showCSVImport}
        onImport={(categories) => {
          if (!currentRound) return;
          categories.forEach(cat => {
            // Check if category already exists in this round
            const existing = currentRound.categories.find(
              c => c.name.toLowerCase() === cat.name.toLowerCase()
            );
            if (existing) {
              // Append questions to existing category
              cat.questions.forEach(q => {
                addQuestion(gameId, currentRound.id, existing.id, q);
              });
            } else {
              addCategory(gameId, currentRound.id, cat);
            }
          });
        }}
        onClose={() => setShowCSVImport(false)}
      />
    </div>
  );
}

// Category editor subcomponent
function CategoryEditor({
  category, gameId, roundId, expanded, onToggle,
  updateCategory, removeCategory, addQuestion, updateQuestion, removeQuestion,
}: {
  category: Category;
  gameId: string;
  roundId: string;
  expanded: boolean;
  onToggle: () => void;
  updateCategory: (gameId: string, roundId: string, catId: string, updates: Partial<Category>) => void;
  removeCategory: (gameId: string, roundId: string, catId: string) => void;
  addQuestion: (gameId: string, roundId: string, catId: string, q: Question) => void;
  updateQuestion: (gameId: string, roundId: string, catId: string, qId: string, updates: Partial<Question>) => void;
  removeQuestion: (gameId: string, roundId: string, catId: string, qId: string) => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-sm">{expanded ? '▼' : '▶'}</span>
          <input
            type="text"
            value={category.name}
            onChange={e => { e.stopPropagation(); updateCategory(gameId, roundId, category.id, { name: e.target.value }); }}
            onClick={e => e.stopPropagation()}
            className="bg-transparent font-bold text-lg border-b border-transparent hover:border-white/30 focus:border-jeopardy-gold focus:outline-none"
          />
          <span className="text-white/40 text-sm">{category.questions.length} questions</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); removeCategory(gameId, roundId, category.id); }}
          className="text-white/30 hover:text-red-400 cursor-pointer px-2"
        >
          &times;
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/10 px-5 py-4 space-y-3"
        >
          {category.questions.map((q) => (
            <div key={q.id} className="bg-white/5 rounded-lg p-4 relative group">
              <button
                onClick={() => removeQuestion(gameId, roundId, category.id, q.id)}
                className="absolute top-2 right-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                &times;
              </button>
              <div className="grid grid-cols-[100px_1fr] gap-3 mb-2">
                <div>
                  <label className="text-white/40 text-xs block mb-1">Points</label>
                  <input
                    type="number"
                    value={q.pointValue}
                    onChange={e => updateQuestion(gameId, roundId, category.id, q.id, { pointValue: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-jeopardy-gold font-bold focus:outline-none focus:border-jeopardy-gold"
                    step={100}
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1">Question</label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={e => updateQuestion(gameId, roundId, category.id, q.id, { questionText: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 focus:outline-none focus:border-jeopardy-gold"
                    placeholder="Enter question..."
                  />
                </div>
              </div>
              {/* Multiple choice options */}
              <div className="mt-2">
                <label className="text-white/40 text-xs block mb-1">Choices (click radio to mark correct answer)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={(q.correctChoice ?? 0) === idx}
                        onChange={() => updateQuestion(gameId, roundId, category.id, q.id, {
                          correctChoice: idx,
                          answer: (q.choices || ['', '', '', ''])[idx],
                        })}
                        className="cursor-pointer accent-green-500"
                      />
                      <span className={`text-xs font-bold w-5 ${(q.correctChoice ?? 0) === idx ? 'text-green-400' : 'text-white/40'}`}>{letter}</span>
                      <input
                        type="text"
                        value={(q.choices || ['', '', '', ''])[idx] || ''}
                        onChange={e => {
                          const newChoices = [...(q.choices || ['', '', '', ''])];
                          newChoices[idx] = e.target.value;
                          const updates: Record<string, unknown> = { choices: newChoices };
                          if ((q.correctChoice ?? 0) === idx) updates.answer = e.target.value;
                          updateQuestion(gameId, roundId, category.id, q.id, updates);
                        }}
                        className={`flex-1 bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none ${
                          (q.correctChoice ?? 0) === idx
                            ? 'border-green-500/50 text-green-300 focus:border-green-400'
                            : 'border-white/20 focus:border-jeopardy-gold'
                        }`}
                        placeholder={`Choice ${letter}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {q.imageUrl !== undefined && (
                <div className="mt-2">
                  <label className="text-white/40 text-xs block mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    value={q.imageUrl || ''}
                    onChange={e => updateQuestion(gameId, roundId, category.id, q.id, { imageUrl: e.target.value || undefined })}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 focus:outline-none focus:border-jeopardy-gold text-sm"
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addQuestion(gameId, roundId, category.id, {
              id: generateId(),
              pointValue: (category.questions.length + 1) * 200,
              questionText: '',
              choices: ['', '', '', ''],
              correctChoice: 0,
              answer: '',
              isDailyDouble: false,
              isRevealed: false,
            })}
            className="w-full py-2 bg-white/5 border border-dashed border-white/20 rounded-lg hover:bg-white/10 cursor-pointer text-white/50 text-sm"
          >
            + Add Question
          </button>
        </motion.div>
      )}
    </div>
  );
}
