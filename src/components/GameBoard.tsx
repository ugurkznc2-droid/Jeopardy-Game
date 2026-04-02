import { motion } from 'framer-motion';
import type { Round } from '../types';

interface GameBoardProps {
  round: Round;
  onSelectQuestion: (categoryId: string, questionId: string) => void;
}

export default function GameBoard({ round, onSelectQuestion }: GameBoardProps) {
  const categories = round.categories;
  if (categories.length === 0) return null;

  const maxQuestions = Math.max(...categories.map(c => c.questions.length));

  const sortedCategories = categories.map(c => ({
    ...c,
    questions: [...c.questions].sort((a, b) => a.pointValue - b.pointValue),
  }));

  return (
    <div className="flex-1 flex flex-col p-2 md:p-3 min-h-0 overflow-hidden">
      {/* Category headers */}
      <div
        className="grid gap-1.5 md:gap-2 shrink-0 mb-1.5 md:mb-2"
        style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
      >
        {sortedCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-jeopardy-blue rounded-lg px-2 py-2 md:py-3 flex items-center justify-center text-center"
          >
            <span className="text-xs md:text-sm lg:text-base font-bold text-white uppercase tracking-wide leading-tight">
              {cat.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Question grid */}
      <div
        className="grid gap-1.5 md:gap-2 flex-1 min-h-0"
        style={{
          gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
          gridTemplateRows: `repeat(${maxQuestions}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: maxQuestions }).map((_, rowIdx) =>
          sortedCategories.map((cat) => {
            const q = cat.questions[rowIdx];
            if (!q) return <div key={`${cat.id}-${rowIdx}`} />;

            const isUsed = q.isRevealed;

            return (
              <motion.button
                key={q.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (rowIdx * categories.length) * 0.02 }}
                onClick={() => !isUsed && onSelectQuestion(cat.id, q.id)}
                disabled={isUsed}
                className={`rounded-lg flex items-center justify-center cursor-pointer transition-all relative overflow-hidden
                  ${isUsed
                    ? 'bg-jeopardy-used opacity-30 cursor-default'
                    : 'bg-jeopardy-cell hover:bg-jeopardy-cell-hover hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'
                  }`}
              >
                {isUsed ? (
                  <span className="text-white/20 text-lg">&mdash;</span>
                ) : (
                  <span className="text-xl md:text-2xl lg:text-4xl font-black text-jeopardy-gold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    ${q.pointValue}
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
