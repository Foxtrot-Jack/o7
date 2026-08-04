// Codex — detailed tutorial/reference for every game mechanic
import React, { useState, useMemo } from 'react';
import { BookOpen, Search, GraduationCap } from 'lucide-react';
import CODEX from '@/lib/codexEntries';
import NavIconText from './NavIconText';

export default function Codex({ onStartTutorial }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeEntry, setActiveEntry] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CODEX;
    const q = search.toLowerCase();
    return CODEX.map(cat => ({
      ...cat,
      entries: cat.entries.filter(e =>
        e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.entries.length > 0);
  }, [search]);

  const currentCategory = filtered[activeCategory] || filtered[0];
  const currentEntry = currentCategory?.entries[activeEntry] || currentCategory?.entries[0];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Search bar */}
      <div className="border-b border-orange-900/50 p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-orange-700 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory(0); setActiveEntry(0); }}
          placeholder="Search the codex..."
          className="flex-1 bg-transparent text-orange-300 text-xs outline-none placeholder-orange-800"
        />
        <BookOpen className="w-4 h-4 text-orange-600 flex-shrink-0" />
        <span className="text-orange-700 text-[10px] uppercase hidden sm:inline">Codex</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Category sidebar */}
        <div className="w-32 sm:w-44 flex-shrink-0 border-r border-orange-900/50 overflow-y-auto">
          {filtered.map((cat, ci) => (
            <button
              key={cat.category}
              onClick={() => { setActiveCategory(ci); setActiveEntry(0); }}
              className={`w-full text-left px-2 py-2 border-b border-orange-950/50 text-[10px] sm:text-xs transition-all ${
                activeCategory === ci ? 'bg-orange-950/40 text-orange-300 border-l-2 border-l-orange-500' : 'text-orange-700 hover:text-orange-500'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.category}</span>
              <span className="sm:hidden">{cat.category.slice(0, 6)}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-orange-800 text-[10px] text-center">No results.</div>
          )}
        </div>

        {/* Entry list */}
        <div className="w-40 sm:w-56 flex-shrink-0 border-r border-orange-900/50 overflow-y-auto">
          {currentCategory?.entries.map((entry, ei) => (
            <button
              key={entry.title}
              onClick={() => setActiveEntry(ei)}
              className={`w-full text-left px-2 py-2 border-b border-orange-950/50 text-[10px] sm:text-xs transition-all ${
                activeEntry === ei ? 'bg-orange-950/30 text-orange-300' : 'text-orange-600 hover:text-orange-400'
              }`}
            >
              {entry.title}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentEntry ? (
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{currentCategory?.icon}</span>
                <h2 className="text-orange-300 font-bold text-sm sm:text-base uppercase">{currentEntry.title}</h2>
              </div>
              <div className="text-orange-700 text-[10px] uppercase mb-3 border-b border-orange-900/50 pb-1">
                {currentCategory?.category}
              </div>
              <div className="text-orange-500/90 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                <NavIconText text={currentEntry.body} />
              </div>
              {currentEntry.tutorialId && onStartTutorial && (
                <button
                  onClick={() => onStartTutorial(currentEntry.tutorialId)}
                  className="mt-4 px-4 py-2 border border-cyan-700 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" /> REPLAY TUTORIAL
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-orange-800 text-xs">
              Select a topic to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}