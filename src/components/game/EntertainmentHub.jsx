// Entertainment Hub — games, library, notes, galnet, and the commander's
// auto-journal. Reachable from the Commander Profile (Entertainment tab)
// and as a travel overlay during auto-journeys, so commanders can read,
// play, or write while the ship jumps.
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateNews, NEWS_CATEGORIES } from '@/lib/galnet';
import { LIBRARY_BOOKS } from '@/lib/libraryBooks';
import { soundEngine } from '@/lib/soundEngine';
import HackingMinigame from './HackingMinigame';
import SurfaceScannerMinigame from './SurfaceScannerMinigame';
import FSDTuningGame from './FSDTuningGame';
import SignalDecryptGame from './SignalDecryptGame';
import BrickBreakerGame from './BrickBreakerGame';
import SpaceBattleshipGame from './SpaceBattleshipGame';
import SudokuGame from './SudokuGame';
import SolitaireGame from './SolitaireGame';
import { Gamepad2, BookOpen, Newspaper, StickyNote, ScrollText, Play, X, Zap, Radio, Terminal, Radar, Clock, Square, Crosshair, LayoutGrid, Layers } from 'lucide-react';

const GAMES = [
  { id: 'fsd', name: 'FSD Tuning', desc: 'Stop the resonance marker in the green zone to charge your drive.', Comp: FSDTuningGame, icon: Zap },
  { id: 'signal', name: 'Signal Decrypt', desc: 'Watch the alien transmission, then repeat the pattern.', Comp: SignalDecryptGame, icon: Radio },
  { id: 'hack', name: 'Data Terminal Hack', desc: 'Crack a 4-symbol access code before lockout.', Comp: HackingMinigame, icon: Terminal },
  { id: 'probe', name: 'Surface Probe Scan', desc: 'Triangulate a surface signal before probes run out.', Comp: SurfaceScannerMinigame, icon: Radar },
  { id: 'brick', name: 'Brick Breaker', desc: 'Arcade classic — bounce the ball, clear every brick before you lose all lives.', Comp: BrickBreakerGame, icon: Square },
  { id: 'battleship', name: 'Voidstrike', desc: 'Space-themed fleet duel. Deploy ships, then hunt the enemy fleet across the grid.', Comp: SpaceBattleshipGame, icon: Crosshair },
  { id: 'sudoku', name: 'Sudoku', desc: 'Fill the 9×9 grid so every row, column, and box holds 1–9 with no repeats.', Comp: SudokuGame, icon: LayoutGrid },
  { id: 'solitaire', name: 'Solitaire', desc: 'Klondike — build the four foundations up by suit, A through K, to win.', Comp: SolitaireGame, icon: Layers },
];

const TABS = [
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'galnet', label: 'StarNet', icon: Newspaper },
  { id: 'journal', label: 'Journal', icon: ScrollText },
];

export default function EntertainmentHub({ embedded }) {
  const { state, updateNotebook, addCredits, update } = useGameState();
  const [tab, setTab] = useState('games');
  const [activeGame, setActiveGame] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [flash, setFlash] = useState(null);

  const articles = useMemo(() => generateNews(state), [state.totalJumps, state.communityGoals, state.powerPlay]);
  const journal = state.commanderLog || [];

  const play = (game) => {
    soundEngine.play('select');
    setActiveGame(game);
  };

  const handleComplete = (game, result) => {
    let reward = 2500;
    let suffix = '';
    if (typeof result === 'number') { reward = Math.max(2500, Math.round(result * 1000)); suffix = ` — score ${result}`; }
    else if (result === true) { reward = 5000; suffix = ' — success'; }
    else if (result === false) { reward = 1000; suffix = ' — failed'; }
    addCredits(reward);
    update(prev => ({ commanderLog: [...(prev.commanderLog || []), { id: Date.now() + Math.random(), ts: Date.now(), text: `Played ${game.name}${suffix}. (+${reward.toLocaleString()} CR)`, type: 'game' }].slice(-200) }));
    setFlash(`+${reward.toLocaleString()} CR`);
    setTimeout(() => setFlash(null), 1500);
    setActiveGame(null);
  };

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`w-full flex flex-col ${embedded ? 'h-full' : 'min-h-[70vh]'} bg-black`}>
      {/* tab bar */}
      <div className="flex border-b border-orange-900 flex-shrink-0">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => { soundEngine.play('click'); setTab(t.id); }}
              className={`flex items-center gap-1 px-3 py-2 text-[11px] uppercase border-b-2 whitespace-nowrap ${active ? 'border-orange-500 text-orange-300 bg-orange-950/20' : 'border-transparent text-orange-700 hover:text-orange-500'}`}>
              <Icon className="w-3 h-3" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-3 relative">
        {flash && (
          <div className="absolute top-2 right-2 z-30 bg-green-950/80 border border-green-600 px-2 py-1 text-green-300 text-[10px] font-bold">{flash}</div>
        )}

        {/* GAMES */}
        {tab === 'games' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GAMES.map(g => {
              const Icon = g.icon;
              return (
                <div key={g.id} className="border border-orange-900 p-3 flex flex-col gap-2 hover:border-orange-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-300 font-bold text-sm uppercase">{g.name}</span>
                  </div>
                  <p className="text-orange-700 text-[10px] leading-relaxed flex-1">{g.desc}</p>
                  <button onClick={() => play(g)} className="w-full py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/40 text-[11px] font-bold uppercase flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" /> Play
                  </button>
                </div>
              );
            })}
            <div className="col-span-full text-orange-800 text-[9px] text-center pt-1">
              Completing a game awards a small credit bonus and logs to your journal.
            </div>
          </div>
        )}

        {/* LIBRARY */}
        {tab === 'library' && (
          <div className="space-y-2">
            {LIBRARY_BOOKS.map(b => (
              <button key={b.id} onClick={() => { soundEngine.play('click'); setActiveBook(b); }}
                className="w-full text-left border border-orange-900 p-2.5 hover:border-orange-700 hover:bg-orange-950/20">
                <div className="text-orange-300 font-bold text-sm">{b.title}</div>
                <div className="text-orange-700 text-[10px]">{b.author} · {b.category}</div>
              </button>
            ))}
          </div>
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          <div className="space-y-2">
            <div className="text-orange-500 text-[10px] uppercase">Commander's Notebook</div>
            <textarea
              value={state.notebook || ''}
              onChange={(e) => updateNotebook(e.target.value)}
              placeholder="Jot coordinates, trade routes, mission targets, or your thoughts while the stars slide past…"
              className="w-full h-64 bg-black border border-orange-900 p-2 text-xs text-orange-300 focus:outline-none focus:border-orange-500 resize-none"
            />
            <div className="text-orange-800 text-[9px]">Saved to your commander profile. Persists across jumps.</div>
          </div>
        )}

        {/* GALNET */}
        {tab === 'galnet' && (
          <div className="space-y-1.5">
            {articles.map(a => {
              const cat = NEWS_CATEGORIES[a.category] || {};
              return (
                <div key={a.id} className="border border-orange-950 p-2">
                  <div className={`text-[9px] uppercase ${cat.color || 'text-orange-600'}`}>{cat.label || a.category}</div>
                  <div className="text-orange-300 text-xs leading-relaxed">{a.headline}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* JOURNAL */}
        {tab === 'journal' && (
          <div className="space-y-1">
            {journal.length === 0 && <div className="text-orange-800 text-[10px] text-center py-8">No journal entries yet. Complete a journey or collect company income to begin your log.</div>}
            {[...journal].reverse().map(e => (
              <div key={e.id} className="border-l-2 border-orange-800 pl-2 py-1">
                <div className="flex items-center gap-1 text-orange-800 text-[9px]"><Clock className="w-2.5 h-2.5" /> {fmtTime(e.ts)}</div>
                <div className={`text-xs ${e.type === 'company' ? 'text-green-400' : e.type === 'game' ? 'text-cyan-400' : 'text-orange-300'}`}>{e.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* active game overlay (games render fixed full-screen) */}
      {activeGame && (
        <activeGame.Comp
          onClose={() => setActiveGame(null)}
          onComplete={(result) => handleComplete(activeGame, result)}
        />
      )}

      {/* book reader overlay */}
      {activeBook && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[80vh] flex flex-col border border-orange-700 bg-black">
            <div className="flex items-center justify-between border-b border-orange-900 p-3">
              <div>
                <div className="text-orange-300 font-bold text-sm">{activeBook.title}</div>
                <div className="text-orange-700 text-[10px]">{activeBook.author} · {activeBook.category}</div>
              </div>
              <button onClick={() => setActiveBook(null)}><X className="w-4 h-4 text-orange-700" /></button>
            </div>
            <div className="overflow-y-auto p-4 text-orange-400 text-xs leading-relaxed whitespace-pre-line">
              {activeBook.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}