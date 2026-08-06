// Character Creator — register a commander callsign before entering the game.
// A hidden founder sign-in (no password): entering a founder alias recognises
// you as that founder. Not documented in-game — an Easter egg told in person.
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { findFounderByAlias } from '@/lib/contributors';
import { Rocket, ChevronRight } from 'lucide-react';

export default function CharacterCreator() {
  const { update } = useGameState();
  const [callsign, setCallsign] = useState('');
  const trimmed = callsign.trim();
  const candidate = trimmed.startsWith('CMDR ') ? trimmed : `CMDR ${trimmed}`;
  const founderMatch = trimmed.length >= 3 ? findFounderByAlias(candidate) : null;

  const begin = () => {
    if (!trimmed) return;
    if (founderMatch) {
      update({ commanderName: founderMatch.alias, isFounderSignIn: true });
    } else {
      update({ commanderName: candidate, isFounderSignIn: false });
    }
  };

  return (
    <div className="crt-container w-full h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1">
          <Rocket className="w-6 h-6 text-orange-500 mx-auto" />
          <h1 className="text-orange-300 text-xl font-bold uppercase tracking-widest">Create Commander</h1>
          <p className="text-orange-700 text-xs">Register your callsign with the Pilots' Guild to begin your career among the stars.</p>
        </div>

        <div className="border border-orange-900 p-3 space-y-2">
          <label className="text-orange-500 text-[10px] uppercase">Callsign</label>
          <div className="flex items-center border border-orange-700 bg-black">
            <span className="px-2 text-orange-500 text-sm font-bold border-r border-orange-800">CMDR</span>
            <input
              autoFocus
              value={callsign}
              onChange={e => setCallsign(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && begin()}
              placeholder="Enter callsign"
              className="flex-1 bg-transparent text-orange-300 text-sm px-2 py-2 outline-none"
            />
          </div>
          <div className="text-orange-700 text-[10px]">Your pilot name appears as <span className="text-orange-400">CMDR {trimmed || '...'}</span> across the galaxy and on first-discovery records.</div>
          {founderMatch && (
            <div className="border border-yellow-700 bg-yellow-950/20 p-2 text-yellow-400 text-[10px]">
              ★ Founder credentials recognized — welcome back, {founderMatch.alias}.
            </div>
          )}
        </div>

        <button
          onClick={begin}
          disabled={!trimmed}
          className="w-full py-2.5 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-sm font-bold uppercase disabled:opacity-30 flex items-center justify-center gap-2"
        >
          Begin Career <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}