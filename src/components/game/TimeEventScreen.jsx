// Time-Based Events — rare cosmic phenomena
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateTimeEvent, getTimeRemaining, EVENT_TYPES } from '@/lib/timeEvents';
import { Zap, Clock, Plus, Gift, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TimeEventScreen() {
  const { state, update, addCredits } = useGameState();
  const events = state.timeEvents || [];
  const isSandbox = state.saveMode === 'sandbox';

  const handleGenerate = () => {
    const event = generateTimeEvent();
    update(prev => ({ ...prev, timeEvents: [...(prev.timeEvents || []), event] }));
  };

  const handleParticipate = (eventId) => {
    update(prev => ({
      ...prev,
      timeEvents: prev.timeEvents.map(e => {
        if (e.id !== eventId || e.completed) return e;
        addCredits(e.reward);
        return { ...e, completed: true, claimed: true };
      }),
    }));
  };

  const handleClear = () => {
    update(prev => ({
      ...prev,
      timeEvents: prev.timeEvents.filter(e => getTimeRemaining(e.deadline) !== 'EXPIRED' && !e.claimed),
    }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Cosmic Events</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Rare, time-limited phenomena. Each event offers unique rewards but expires after its duration. Participate before the deadline to claim rewards.</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          className="flex-1 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> SCAN FOR EVENTS
        </button>
        {events.length > 0 && (
          <button onClick={handleClear} className="px-3 py-2 border border-orange-800 text-orange-500 hover:bg-orange-950/30 text-[10px] font-bold">
            CLEAR EXPIRED
          </button>
        )}
      </div>

      {/* Active events */}
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map(event => {
            const expired = getTimeRemaining(event.deadline) === 'EXPIRED' && !event.completed;
            return (
              <div key={event.id} className={`border p-3 space-y-2 ${event.claimed ? 'border-green-900 opacity-60' : expired ? 'border-red-900 opacity-50' : 'border-cyan-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{event.icon}</span>
                    <span className="text-cyan-300 text-xs font-bold">{event.name}</span>
                  </div>
                  <span className={`text-[10px] flex items-center gap-1 ${expired ? 'text-red-500' : 'text-orange-600'}`}>
                    <Clock className="w-2.5 h-2.5" /> {event.claimed ? 'CLAIMED' : getTimeRemaining(event.deadline)}
                  </span>
                </div>
                <p className="text-orange-600 text-[10px]">{event.desc}</p>
                <div className="flex items-center gap-1 text-green-500 text-[10px]">
                  <Gift className="w-3 h-3" /> REWARD: {event.reward.toLocaleString()} CR
                </div>
                {event.claimed ? (
                  <div className="text-green-500 text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> PARTICIPATION RECORDED</div>
                ) : expired ? (
                  <div className="text-red-500 text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> EVENT EXPIRED — Too late to participate</div>
                ) : (
                  <button
                    onClick={() => handleParticipate(event.id)}
                    className="w-full py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> PARTICIPATE & CLAIM
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-orange-900 p-4 text-center text-orange-600 text-xs">
          <Zap className="w-6 h-6 mx-auto mb-1 opacity-50" />
          No active cosmic events. Scan for events to discover rare phenomena.
        </div>
      )}

      {/* Event types reference */}
      <div className="border border-orange-950 p-3 space-y-1">
        <div className="text-[10px] text-orange-700 uppercase">Known Event Types</div>
        {EVENT_TYPES.map(t => (
          <div key={t.id} className="text-[10px] text-orange-600 flex items-center gap-1">
            <span>{t.icon}</span> {t.name} — {t.desc.slice(0, 60)}...
          </div>
        ))}
      </div>
    </div>
  );
}