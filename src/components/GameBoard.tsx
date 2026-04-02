import { motion } from 'framer-motion';
import type { Round } from '../types';

interface GameBoardProps {
  round: Round;
  onSelectQuestion: (categoryId: string, questionId: string) => void;
}

export default function GameBoard({ round, onSelectQuestion }: GameBoardProps) {
  const categories = round.categories;
  if (categories.length === 0) return null;

  // Get max number of questions across categories
  const maxQuestions = Math.max(...categories.map(c => c.questions.length));

  // Sort questions by point value for each category
  const sortedCategories = categories.map(c => ({
    ...c,
    questions: [...c.questions].sort((a, b) => a.pointValue - b.pointValue),
  }));

  return (
    <div className="flex-1 p-2 md:p-4 min-h-0">
      <div
        className="grid gap-1.5 md:gap-2 h-full"
        style={{
          gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
          gridTemplateRows: `60px repeat(${maxQuestions}, 1fr)`,
        }}
      >
        {/* Category headers */}
        {sortedCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-jeopardy-blue rounded-lg p-2 md:p-3 flex items-center justify-center text-center min-h-[60px]"
          >
            <span className="text-sm md:text-base lg:text-lg font-bold text-white uppercase tracking-wide leading-tight">
              {cat.name}
            </span>
          </motion.div>
        ))}

        {/* Question cells */}
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
                className={`rounded-lg flex items-center justify-center cursor-pointer transition-all relative
                  ${isUsed
                    ? 'bg-jeopardy-used opacity-30 cursor-default'
                    : 'bg-jeopardy-cell hover:bg-jeopardy-cell-hover hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'
                  }`}
              >
                {isUsed ? (
                  <span className="text-white/20 text-lg">&mdash;</span>
                ) : (
                  <span className="text-2xl md:text-3xl lg:text-4xl font-black text-jeopardy-gold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
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
