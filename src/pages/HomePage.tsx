import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { createSampleGame } from '../utils/sampleData';
import { generateId } from '../utils/helpers';
import type { Game } from '../types';
import { useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function HomePage() {
  const navigate = useNavigate();
  const { games, addGame, deleteGame, duplicateGame, importGame } = useGameStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const createNewGame = () => {
    const game: Game = {
      id: generateId(),
      title: 'New Game',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      timerSeconds: 30,
      currentRound: 0,
      soundEnabled: true,
      teams: [],
      rounds: [
        {
          id: generateId(),
          name: 'Round 1',
          type: 'standard',
          categories: [],
        },
      ],
    };
    addGame(game);
    navigate(`/setup/${game.id}`);
  };

  const loadSample = () => {
    const game = createSampleGame();
    addGame(game);
    navigate(`/setup/${game.id}`);
  };

  const handleExport = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        importGame(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-500/20 text-yellow-300',
    active: 'bg-green-500/20 text-green-300',
    completed: 'bg-blue-500/20 text-blue-300',
    archived: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-jeopardy-dark to-[#000a3a] px-8 py-16 overflow-y-auto flex items-start justify-center">
      <motion.div
        className="max-w-4xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-6xl font-black text-jeopardy-gold mb-3 tracking-tight" style={{ textShadow: '0 0 30px rgba(255,215,0,0.3)' }}>
            JEOPARDY!
          </h1>
          <p className="text-white/50 text-lg">Tournament Game Manager</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <button
            onClick={createNewGame}
            className="px-6 py-3 bg-jeopardy-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-all hover:scale-105 text-lg cursor-pointer shadow-lg shadow-yellow-500/20"
          >
            + New Game
          </button>
          <button
            onClick={loadSample}
            className="px-6 py-3 bg-jeopardy-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-all hover:scale-105 text-lg cursor-pointer"
          >
            Load Sample Game
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all cursor-pointer"
          >
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        {/* Game list */}
        {games.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">?</div>
            <p className="text-white/40 text-xl">No games yet</p>
            <p className="text-white/30 mt-2">Create a new game or load the sample to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => game.status === 'active' ? navigate(`/play/${game.id}`) : navigate(`/setup/${game.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{game.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[game.status]}`}>
                        {game.status}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm">
                      {game.teams.length} teams &middot; {game.rounds.filter(r => r.type === 'standard').length} rounds &middot; Updated {new Date(game.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {game.status === 'active' && (
                      <button
                        onClick={() => navigate(`/play/${game.id}`)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium cursor-pointer"
                      >
                        Play
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/setup/${game.id}`)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleExport(game.id)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm cursor-pointer"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => {
                        const newGame = duplicateGame(game.id);
                        navigate(`/setup/${newGame.id}`);
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm cursor-pointer"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => setConfirmDelete(game.id)}
                      className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 rounded-lg text-sm text-red-300 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-white/20 text-sm">
          <p>Keyboard: press any game to open &middot; Data saved locally in your browser</p>
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Game"
        message="Are you sure you want to delete this game? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDelete) deleteGame(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
