import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Game, Team, Round, Category, Question } from '../types';
import { generateId, TEAM_COLORS } from '../utils/helpers';

interface GameStore {
  games: Game[];
  addGame: (game: Game) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  duplicateGame: (id: string) => Game;
  getGame: (id: string) => Game | undefined;

  // Team actions
  addTeam: (gameId: string, name: string) => void;
  removeTeam: (gameId: string, teamId: string) => void;
  updateTeam: (gameId: string, teamId: string, updates: Partial<Team>) => void;
  updateScore: (gameId: string, teamId: string, delta: number) => void;
  resetScores: (gameId: string) => void;

  // Round actions
  addRound: (gameId: string, round: Round) => void;
  updateRound: (gameId: string, roundId: string, updates: Partial<Round>) => void;
  removeRound: (gameId: string, roundId: string) => void;

  // Category actions
  addCategory: (gameId: string, roundId: string, category: Category) => void;
  updateCategory: (gameId: string, roundId: string, categoryId: string, updates: Partial<Category>) => void;
  removeCategory: (gameId: string, roundId: string, categoryId: string) => void;

  // Question actions
  updateQuestion: (gameId: string, roundId: string, categoryId: string, questionId: string, updates: Partial<Question>) => void;
  addQuestion: (gameId: string, roundId: string, categoryId: string, question: Question) => void;
  removeQuestion: (gameId: string, roundId: string, categoryId: string, questionId: string) => void;
  revealQuestion: (gameId: string, roundId: string, categoryId: string, questionId: string, teamId?: string, correct?: boolean) => void;

  // Game flow
  startGame: (gameId: string) => void;
  resetBoard: (gameId: string) => void;
  advanceRound: (gameId: string) => void;
  completeGame: (gameId: string) => void;

  // Import/Export
  importGame: (gameData: Game) => void;
  exportGame: (gameId: string) => Game | undefined;
}

function updateGameHelper(games: Game[], id: string, updater: (g: Game) => Game): Game[] {
  return games.map(g => g.id === id ? updater({ ...g, updatedAt: new Date().toISOString() }) : g);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: [],

      addGame: (game) => set(s => ({ games: [...s.games, game] })),

      updateGame: (id, updates) => set(s => ({
        games: updateGameHelper(s.games, id, g => ({ ...g, ...updates }))
      })),

      deleteGame: (id) => set(s => ({ games: s.games.filter(g => g.id !== id) })),

      duplicateGame: (id) => {
        const original = get().games.find(g => g.id === id);
        if (!original) throw new Error('Game not found');
        const newGame: Game = {
          ...JSON.parse(JSON.stringify(original)),
          id: generateId(),
          title: `${original.title} (Copy)`,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Regenerate all IDs
        newGame.teams = newGame.teams.map((t: Team) => ({ ...t, id: generateId(), score: 0 }));
        newGame.rounds = newGame.rounds.map((r: Round) => ({
          ...r, id: generateId(),
          categories: r.categories.map((c: Category) => ({
            ...c, id: generateId(),
            questions: c.questions.map((q: Question) => ({
              ...q, id: generateId(), isRevealed: false, answeredBy: undefined, answeredCorrectly: undefined,
            })),
          })),
        }));
        set(s => ({ games: [...s.games, newGame] }));
        return newGame;
      },

      getGame: (id) => get().games.find(g => g.id === id),

      addTeam: (gameId, name) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => {
          const color = TEAM_COLORS[g.teams.length % TEAM_COLORS.length];
          return { ...g, teams: [...g.teams, { id: generateId(), name, score: 0, color }] };
        })
      })),

      removeTeam: (gameId, teamId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, teams: g.teams.filter(t => t.id !== teamId)
        }))
      })),

      updateTeam: (gameId, teamId, updates) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, teams: g.teams.map(t => t.id === teamId ? { ...t, ...updates } : t)
        }))
      })),

      updateScore: (gameId, teamId, delta) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, teams: g.teams.map(t => t.id === teamId ? { ...t, score: t.score + delta } : t)
        }))
      })),

      resetScores: (gameId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, teams: g.teams.map(t => ({ ...t, score: 0 }))
        }))
      })),

      addRound: (gameId, round) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: [...g.rounds, round]
        }))
      })),

      updateRound: (gameId, roundId, updates) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r => r.id === roundId ? { ...r, ...updates } : r)
        }))
      })),

      removeRound: (gameId, roundId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.filter(r => r.id !== roundId)
        }))
      })),

      addCategory: (gameId, roundId, category) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? { ...r, categories: [...r.categories, category] } : r
          )
        }))
      })),

      updateCategory: (gameId, roundId, categoryId, updates) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? {
              ...r, categories: r.categories.map(c =>
                c.id === categoryId ? { ...c, ...updates } : c
              )
            } : r
          )
        }))
      })),

      removeCategory: (gameId, roundId, categoryId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? { ...r, categories: r.categories.filter(c => c.id !== categoryId) } : r
          )
        }))
      })),

      updateQuestion: (gameId, roundId, categoryId, questionId, updates) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? {
              ...r, categories: r.categories.map(c =>
                c.id === categoryId ? {
                  ...c, questions: c.questions.map(q =>
                    q.id === questionId ? { ...q, ...updates } : q
                  )
                } : c
              )
            } : r
          )
        }))
      })),

      addQuestion: (gameId, roundId, categoryId, question) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? {
              ...r, categories: r.categories.map(c =>
                c.id === categoryId ? { ...c, questions: [...c.questions, question] } : c
              )
            } : r
          )
        }))
      })),

      removeQuestion: (gameId, roundId, categoryId, questionId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? {
              ...r, categories: r.categories.map(c =>
                c.id === categoryId ? { ...c, questions: c.questions.filter(q => q.id !== questionId) } : c
              )
            } : r
          )
        }))
      })),

      revealQuestion: (gameId, roundId, categoryId, questionId, teamId, correct) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, rounds: g.rounds.map(r =>
            r.id === roundId ? {
              ...r, categories: r.categories.map(c =>
                c.id === categoryId ? {
                  ...c, questions: c.questions.map(q =>
                    q.id === questionId ? { ...q, isRevealed: true, answeredBy: teamId, answeredCorrectly: correct } : q
                  )
                } : c
              )
            } : r
          )
        }))
      })),

      startGame: (gameId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({ ...g, status: 'active', currentRound: 0 }))
      })),

      resetBoard: (gameId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g,
          status: 'draft',
          currentRound: 0,
          teams: g.teams.map(t => ({ ...t, score: 0 })),
          rounds: g.rounds.map(r => ({
            ...r,
            categories: r.categories.map(c => ({
              ...c,
              questions: c.questions.map(q => ({
                ...q, isRevealed: false, answeredBy: undefined, answeredCorrectly: undefined,
              })),
            })),
          })),
        }))
      })),

      advanceRound: (gameId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({
          ...g, currentRound: Math.min(g.currentRound + 1, g.rounds.length - 1)
        }))
      })),

      completeGame: (gameId) => set(s => ({
        games: updateGameHelper(s.games, gameId, g => ({ ...g, status: 'completed' }))
      })),

      importGame: (gameData) => {
        const newGame: Game = {
          ...gameData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
        };
        set(s => ({ games: [...s.games, newGame] }));
      },

      exportGame: (gameId) => get().games.find(g => g.id === gameId),
    }),
    {
      name: 'jeopardy-game-store',
      version: 2,
      // Migrate stale persisted data from older app versions so it doesn't crash
      migrate: (persistedState: unknown) => {
        const state = persistedState as { games?: unknown[] } | null;
        if (!state || !Array.isArray(state.games)) {
          return { games: [] } as Partial<GameStore>;
        }
        // Backfill any missing fields on questions (e.g., choices/correctChoice from older versions)
        try {
          const games = state.games.map((g: any) => ({
            ...g,
            soundEnabled: g.soundEnabled ?? true,
            currentRound: g.currentRound ?? 0,
            timerSeconds: g.timerSeconds ?? 30,
            teams: Array.isArray(g.teams) ? g.teams : [],
            rounds: Array.isArray(g.rounds) ? g.rounds.map((r: any) => ({
              ...r,
              categories: Array.isArray(r.categories) ? r.categories.map((c: any) => ({
                ...c,
                questions: Array.isArray(c.questions) ? c.questions.map((q: any) => ({
                  ...q,
                  choices: Array.isArray(q.choices) && q.choices.length === 4 ? q.choices : ['', '', '', ''],
                  correctChoice: typeof q.correctChoice === 'number' ? q.correctChoice : 0,
                  answer: q.answer ?? '',
                  isRevealed: !!q.isRevealed,
                })) : [],
              })) : [],
            })) : [],
          }));
          return { games } as Partial<GameStore>;
        } catch {
          // If migration fails, start fresh rather than crashing
          return { games: [] } as Partial<GameStore>;
        }
      },
    }
  )
);
