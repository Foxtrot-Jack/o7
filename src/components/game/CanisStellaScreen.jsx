// Canis Stella Screen — join, oppose, climb the corporate ladder, claim guilded carriers
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { CANIS_STELLA_RANKS, CEO_TITLE, GUILDED_CARRIER_COST, GUILDED_MULTIPLIER, getCanisStellaRank, getNextRank, hasGuildedCarrier } from '@/lib/canisStella';
import { Building, Crown, Star, Swords, ArrowUp, Check, Rocket } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

export default function CanisStellaScreen() {
  const { state, joinCanisStella, opposeCanisStella, buyGuildedCarrier, claimGuildedCarrierAsCEO, startOwnFaction } = useGameState();
  const [factionName, setFactionName] = useState('');
  const [carrierName, setCarrierName] = useState('');

  const cs = state.canisStella || { stance: 'neutral', reputation: 0, isCEO: false, ownFactionName: null };
  const rankInfo = getCanisStellaRank(cs.reputation || 0);
  const nextRank = getNextRank(cs.reputation || 0);
  const guildedOwned = hasGuildedCarrier(state);
  const isSandbox = state.saveMode === 'sandbox';

  const handleJoin = () => { soundEngine.play('select'); joinCanisStella(); };
  const handleOppose = () => { soundEngine.play('select'); opposeCanisStella(); };

  const handleClaimCarrier = () => {
    soundEngine.play('dock');
    claimGuildedCarrierAsCEO(carrierName || 'Canis Stella Sovereign');
    setCarrierName('');
  };

  const handleBuyGuilded = () => {
    if (!isSandbox && state.credits < GUILDED_CARRIER_COST) { soundEngine.play('error'); return; }
    soundEngine.play('dock');
    buyGuildedCarrier(carrierName || 'Guilded Carrier');
    setCarrierName('');
  };

  const handleFoundFaction = () => {
    if (!factionName.trim()) return;
    soundEngine.play('select');
    startOwnFaction(factionName.trim());
    setFactionName('');
  };

  const fmt = (n) => n.toLocaleString();

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-yellow-700 p-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-yellow-500" />
        <h2 className="text-yellow-300 font-bold uppercase">Canis Stella</h2>
        <span className="text-yellow-700 text-[10px] ml-auto uppercase">Micro Faction</span>
      </div>

      {/* Lore */}
      <div className="border border-orange-900/50 p-3 text-orange-600 text-xs leading-relaxed">
        Canis Stella is a shadow corporate power operating across the galaxy. Through strategic
        acquisitions, logistics monopolies, and private security forces, it has grown into one of
        the most influential non-state entities in known space. Its corporate ladder is legendary —
        those who reach the summit gain access to a Guilded Fleet Carrier, a vessel 25× superior
        to anything on the open market.
      </div>

      {/* Stance display */}
      <div className={`border p-3 space-y-2 ${cs.stance === 'member' ? 'border-yellow-700' : cs.stance === 'opposed' ? 'border-red-800' : 'border-orange-900'}`}>
        <div className="flex items-center justify-between">
          <span className="text-orange-700 text-[10px] uppercase">Current Standing</span>
          <span className={`text-xs font-bold uppercase ${cs.stance === 'member' ? 'text-yellow-400' : cs.stance === 'opposed' ? 'text-red-400' : 'text-orange-500'}`}>
            {cs.stance === 'neutral' ? 'Unaligned' : cs.stance === 'member' ? 'Member' : 'Opposed'}
          </span>
        </div>

        {cs.stance === 'neutral' && (
          <div className="flex gap-2 pt-2">
            <button onClick={handleJoin} className="flex-1 py-2 border border-yellow-600 text-yellow-400 hover:bg-yellow-950/30 text-xs font-bold flex items-center justify-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> JOIN CANIS STELLA
            </button>
            <button onClick={handleOppose} className="flex-1 py-2 border border-red-800 text-red-500 hover:bg-red-950/30 text-xs font-bold flex items-center justify-center gap-1.5">
              <Swords className="w-3.5 h-3.5" /> OPPOSE
            </button>
          </div>
        )}
      </div>

      {/* Member path */}
      {cs.stance === 'member' && (
        <>
          {/* CEO banner */}
          {cs.isCEO && (
            <div className="border border-yellow-500 bg-yellow-950/20 p-3 text-center space-y-2">
              <Crown className="w-6 h-6 text-yellow-400 mx-auto" />
              <div className="text-yellow-300 font-bold uppercase text-sm">{CEO_TITLE}</div>
              <div className="text-yellow-600 text-[10px]">You are the CEO of Canis Stella — the top of the corporate food chain.</div>
            </div>
          )}

          {/* Rank progress */}
          <div className="border border-orange-900 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-700 text-[10px] uppercase">Rank</div>
                <div className="text-yellow-300 font-bold text-sm">{rankInfo.name}</div>
              </div>
              <div className="text-right">
                <div className="text-orange-700 text-[10px] uppercase">Reputation</div>
                <div className="text-orange-300 text-sm">{fmt(cs.reputation || 0)}</div>
              </div>
            </div>

            {nextRank ? (
              <>
                <div className="w-full h-2 bg-black border border-orange-900">
                  <div className="h-full bg-yellow-600 transition-all" style={{ width: `${Math.min(100, ((cs.reputation - rankInfo.threshold) / (nextRank.threshold - rankInfo.threshold)) * 100)}%` }} />
                </div>
                <div className="text-orange-600 text-[10px] flex justify-between">
                  <span>Next: {nextRank.name}</span>
                  <span>{fmt(nextRank.threshold - (cs.reputation || 0))} rep to go</span>
                </div>
              </>
            ) : (
              <div className="text-yellow-500 text-[10px] text-center">★ MAXIMUM RANK ACHIEVED ★</div>
            )}

            <div className="text-orange-700 text-[10px]">Gain reputation by completing missions while aligned with Canis Stella.</div>
          </div>

          {/* Rank ladder */}
          <div className="border border-orange-900 p-3 space-y-1">
            <div className="text-orange-500 text-xs font-bold uppercase mb-1">Corporate Ladder</div>
            {CANIS_STELLA_RANKS.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-[10px] py-0.5 ${i === rankInfo.rank ? 'text-yellow-400 font-bold' : i <= rankInfo.rank ? 'text-orange-500' : 'text-orange-800'}`}>
                <span className="w-4">{i <= rankInfo.rank ? <Check className="w-3 h-3" /> : '○'}</span>
                <span className="flex-1">{r.name}</span>
                <span className="text-orange-800">{fmt(r.threshold)} rep</span>
                {i === rankInfo.rank && <span className="text-yellow-500">← YOU</span>}
              </div>
            ))}
          </div>

          {/* Guilded carrier claim (CEO only) */}
          {cs.isCEO && (
            <div className="border border-yellow-600 bg-yellow-950/10 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-300 font-bold uppercase text-xs">Guilded Fleet Carrier — CEO Inheritance</span>
              </div>
              <div className="text-yellow-600 text-[10px]">
                As CEO, you may inherit the Canis Stella Guilded Carrier. This vessel is {GUILDED_MULTIPLIER}× superior
                to any standard carrier — {fmt(25000)} tritium capacity, {fmt(500)} ship capacity, all services enabled.
                Only one can exist at a time.
              </div>
              {guildedOwned ? (
                <div className="text-yellow-500 text-[10px] text-center py-1 border border-yellow-900">★ GUILDED CARRIER ALREADY OWNED ★</div>
              ) : (
                <>
                  <input value={carrierName} onChange={e => setCarrierName(e.target.value)} placeholder="Carrier name (optional)" className="w-full bg-black border border-yellow-800 text-yellow-300 px-2 py-1.5 text-xs" maxLength={30} />
                  <button onClick={handleClaimCarrier} className="w-full py-2 border border-yellow-500 text-yellow-300 hover:bg-yellow-950/30 text-xs font-bold">CLAIM GUILDED CARRIER</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Opposed path */}
      {cs.stance === 'opposed' && (
        <>
          <div className="border border-red-900 p-3 space-y-2">
            <div className="text-red-400 text-xs font-bold uppercase">Standing in Opposition</div>
            <div className="text-orange-600 text-[10px]">You have chosen to defy Canis Stella. Their corporate machinery is your adversary.</div>
          </div>

          {/* Buy guilded carrier */}
          <div className="border border-yellow-700 bg-yellow-950/10 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-300 font-bold uppercase text-xs">Guilded Fleet Carrier — Black Market Acquisition</span>
            </div>
            <div className="text-yellow-600 text-[10px]">
              A Guilded Carrier can be acquired outside Canis Stella's ranks — for a price. {GUILDED_MULTIPLIER}× stats
              in every aspect. Only one can exist at a time.
            </div>
            <div className="text-yellow-500 text-sm font-bold">{fmt(GUILDED_CARRIER_COST)} CR</div>
            {guildedOwned ? (
              <div className="text-yellow-500 text-[10px] text-center py-1 border border-yellow-900">★ GUILDED CARRIER ALREADY OWNED ★</div>
            ) : state.fleetCarriers.length >= 5 ? (
              <div className="text-red-500 text-[10px] text-center py-1">CARRIER SLOTS FULL (5/5)</div>
            ) : (
              <>
                <input value={carrierName} onChange={e => setCarrierName(e.target.value)} placeholder="Carrier name (optional)" className="w-full bg-black border border-yellow-800 text-yellow-300 px-2 py-1.5 text-xs" maxLength={30} />
                <button onClick={handleBuyGuilded} disabled={!isSandbox && state.credits < GUILDED_CARRIER_COST} className="w-full py-2 border border-yellow-500 text-yellow-300 hover:bg-yellow-950/30 text-xs font-bold disabled:opacity-30">
                  {isSandbox ? 'PURCHASE — FREE' : `PURCHASE — ${fmt(GUILDED_CARRIER_COST)} CR`}
                </button>
              </>
            )}
          </div>

          {/* Start own faction */}
          <div className="border border-orange-900 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-orange-500" />
              <span className="text-orange-300 font-bold uppercase text-xs">Found Your Own Micro Faction</span>
            </div>
            <div className="text-orange-600 text-[10px]">
              {cs.ownFactionName
                ? `Your faction "${cs.ownFactionName}" operates from your Guilded Carrier, challenging Canis Stella's dominance.`
                : 'With a Guilded Carrier as your throne, establish a rival power in the galaxy.'}
            </div>
            {!cs.ownFactionName && (
              <>
                <input value={factionName} onChange={e => setFactionName(e.target.value)} placeholder="Faction name..." className="w-full bg-black border border-orange-700 text-orange-300 px-2 py-1.5 text-xs" maxLength={30} />
                <button onClick={handleFoundFaction} disabled={!factionName.trim() || !guildedOwned} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30">
                  {guildedOwned ? 'FOUND FACTION' : 'REQUIRES GUILDED CARRIER'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}