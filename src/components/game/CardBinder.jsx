// Card Binder — collection view (grouped by manufacturer), duplicate Trader,
// and the Arena (play the three card games). Lives in the Commander Profile.
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { useCardSystem } from '@/lib/useCardSystem';
import { CARD_MANUFACTURERS, CARD_DECKS, getCard, mfrCardIds, getMissingCardIds, isMfrDeckComplete, DECK_REWARD_BY_KEY, DECK_TITLE_BY_MFR } from '@/lib/cardDeck';
import { soundEngine } from '@/lib/soundEngine';
import PlayCard from './PlayCard';
import CardArena from './CardArena';
import { BookOpen, Repeat, Swords, X } from 'lucide-react';

const TABS = [
  { id: 'binder', label: 'Binder', icon: BookOpen },
  { id: 'trader', label: 'Trader', icon: Repeat },
  { id: 'arena', label: 'Arena', icon: Swords },
];

export default function CardBinder() {
  const { state } = useGameState();
  const { tradeDuplicates } = useCardSystem();
  const owned = state.cards?.owned || {};
  const [tab, setTab] = useState('binder');
  const [mfr, setMfr] = useState(CARD_MANUFACTURERS[0].key);
  const [detail, setDetail] = useState(null);
  const [flash, setFlash] = useState(null);

  const ids = useMemo(() => mfrCardIds(mfr), [mfr]);
  const ownedCount = ids.filter(id => owned[id] > 0).length;
  const complete = isMfrDeckComplete(owned, mfr);
  const mfrObj = CARD_DECKS.find(m => m.key === mfr);

  return (
    <div className="w-full h-full flex flex-col bg-black">
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

      <div className="flex-1 overflow-y-auto p-3">
        {flash && <div className="mb-2 border border-green-700 text-green-400 text-[10px] p-1.5">{flash}</div>}

        {tab === 'binder' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {CARD_DECKS.map(m => {
                const c = mfrCardIds(m.key).filter(id => owned[id] > 0).length;
                return (
                  <button key={m.key} onClick={() => { setMfr(m.key); setDetail(null); soundEngine.play('click'); }}
                    className={`px-2 py-1 border text-[10px] ${mfr === m.key ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-700'}`}>
                    <span style={{ color: m.color }}>{m.short}</span> {c}/{m.size}
                  </button>
                );
              })}
            </div>

            <div className="border border-orange-900 p-2">
              <div className="flex items-center justify-between">
                <div className="text-orange-300 text-xs font-bold" style={{ color: mfrObj.color }}>{mfrObj.name} Deck</div>
                <div className="text-[10px] text-orange-700">{ownedCount}/100{complete && <span className="text-green-500 ml-1">✓ COMPLETE</span>}</div>
              </div>
              <div className="text-[9px] text-orange-700">{mfrObj.desc}</div>
              <div className="text-[8px] text-orange-800 mt-0.5">Reward for full deck: {(DECK_REWARD_BY_KEY[mfr] || 50000000).toLocaleString()} CR + title "{DECK_TITLE_BY_MFR[mfr]}"</div>
              <div className="w-full h-1.5 bg-black border border-orange-900 mt-1"><div className="h-full" style={{ width: `${ownedCount}%`, background: mfrObj.color }} /></div>
            </div>

            <div className="grid grid-cols-10 gap-1">
              {ids.map(id => {
                const card = getCard(id);
                const has = owned[id] > 0;
                const qty = owned[id] || 0;
                return (
                  <div key={id} className="relative" onClick={() => has && setDetail(card)}>
                    <PlayCard card={card} size="sm" dim={!has} />
                    {qty > 1 && <span className="absolute -top-1 -right-1 bg-cyan-700 text-black text-[7px] font-bold px-0.5">×{qty}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'trader' && (
          <Trader owned={owned} tradeDuplicates={tradeDuplicates} onResult={(msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2500); }} />
        )}

        {tab === 'arena' && <CardArena />}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="border border-orange-700 bg-black p-3 flex gap-3 items-start" onClick={e => e.stopPropagation()}>
            <PlayCard card={detail} size="lg" />
            <div className="space-y-1 max-w-[14rem]">
              <div className="text-orange-300 font-bold text-sm">{detail.name}</div>
              <div className="text-orange-700 text-[10px]">{detail.manufacturer} · {detail.rarity} · Class {detail.class}</div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-orange-400">
                <span>Firepower: {detail.firepower}</span><span>Speed: {detail.speed}</span>
                <span>Armor: {detail.armor}</span><span>Cargo: {detail.cargo}</span>
                <span className="text-orange-300 font-bold">Power: {detail.power}</span>
              </div>
              <div className="text-orange-700 text-[9px] leading-relaxed">{detail.flavor}</div>
            </div>
            <button onClick={() => setDetail(null)} className="text-orange-700"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function Trader({ owned, tradeDuplicates, onResult }) {
  const [giveId, setGiveId] = useState(null);
  const [pickMode, setPickMode] = useState(null); // 'random' | 'choose'
  const [chooseMfr, setChooseMfr] = useState(CARD_MANUFACTURERS[0].key);

  const dups = useMemo(() => Object.keys(owned).filter(id => owned[id] > 1), [owned]);
  const giveCard = giveId ? getCard(giveId) : null;
  const giveQty = giveId ? owned[giveId] : 0;

  const missing = useMemo(() => getMissingCardIds(owned, chooseMfr), [owned, chooseMfr]);

  const doRandom = () => {
    if (!giveId) return;
    const got = tradeDuplicates(giveId, null);
    if (got) { onResult(`Traded 3 × ${getCard(giveId).name} for ${got.name} (${got.manufacturer}).`); setGiveId(null); }
    else onResult('Trade failed — no missing cards left or not enough duplicates.');
  };
  const doChoose = (wantId) => {
    if (!giveId) return;
    const got = tradeDuplicates(giveId, wantId);
    if (got) { onResult(`Traded 5 × ${getCard(giveId).name} for ${got.name}.`); setGiveId(null); setPickMode(null); }
    else onResult('Trade failed — not enough duplicates.');
  };

  return (
    <div className="space-y-3">
      <div className="text-orange-700 text-[9px]">Spend duplicate cards to acquire missing ones. 3 duplicates → 1 random missing card. 5 duplicates → a specific missing card of your choice.</div>

      <div className="space-y-1">
        <div className="text-orange-500 text-[10px] uppercase font-bold">Your Duplicates ({dups.length})</div>
        {dups.length === 0 && <div className="text-orange-800 text-[10px]">No duplicates yet — visit more stations to collect extras.</div>}
        <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
          {dups.map(id => (
            <div key={id} className="relative">
              <PlayCard card={getCard(id)} size="sm" selected={giveId === id} onClick={() => { setGiveId(giveId === id ? null : id); setPickMode(null); }} />
              <span className="absolute -top-1 -right-1 bg-cyan-700 text-black text-[7px] font-bold px-0.5">×{owned[id]}</span>
            </div>
          ))}
        </div>
      </div>

      {giveCard && (
        <div className="border border-orange-900 p-2 space-y-2">
          <div className="text-[10px] text-orange-400">Staked: <span className="text-orange-300 font-bold">{giveCard.name}</span> (×{giveQty} owned)</div>
          <div className="flex gap-1">
            <button onClick={doRandom} className="flex-1 py-1.5 border border-orange-700 text-orange-300 hover:bg-orange-950/40 text-[10px] font-bold uppercase">Trade 3 → Random</button>
            <button onClick={() => setPickMode(pickMode === 'choose' ? null : 'choose')} className="flex-1 py-1.5 border border-orange-700 text-orange-300 hover:bg-orange-950/40 text-[10px] font-bold uppercase">Trade 5 → Choose</button>
          </div>
          {pickMode === 'choose' && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {CARD_MANUFACTURERS.map(m => (
                  <button key={m.key} onClick={() => setChooseMfr(m.key)} className={`px-1.5 py-0.5 border text-[9px] ${chooseMfr === m.key ? 'border-orange-500 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{m.short} ({getMissingCardIds(owned, m.key).length})</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                {missing.length === 0 && <span className="text-orange-800 text-[10px]">No missing cards for this manufacturer.</span>}
                {missing.map(id => (
                  <PlayCard key={id} card={getCard(id)} size="sm" onClick={() => doChoose(id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}