// RadioChatter — comms channel ticker showing NPC dialogue and ship AI alerts
import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateChatter } from '@/lib/radioChatter';
import { Radio } from 'lucide-react';

const TYPE_COLORS = {
  station_traffic: 'text-cyan-500',
  station_announcement: 'text-green-500',
  npc_chatter: 'text-orange-400',
  ai_alert: 'text-yellow-400',
};

const TYPE_PREFIX = {
  station_traffic: '[TRAFFIC]',
  station_announcement: '[STATION]',
  npc_chatter: '[COMMS]',
  ai_alert: '[AI]',
};

export default function RadioChatter({ maxMessages = 4 }) {
  const { state, getSystemData } = useGameState();
  const [messages, setMessages] = useState([]);
  const systemData = getSystemData();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!systemData) return;
    // Seed with an initial message
    const initial = generateChatter(systemData, stateRef.current);
    setMessages([initial]);
    const interval = setInterval(() => {
      const msg = generateChatter(systemData, stateRef.current);
      setMessages(prev => [...prev.slice(-(maxMessages - 1)), msg]);
    }, 12000);
    return () => clearInterval(interval);
  }, [systemData?.seed, maxMessages]);

  if (messages.length === 0) return null;

  return (
    <div className="border border-orange-900/50 bg-black/80 p-1.5 text-[10px] space-y-0.5 max-h-24 overflow-hidden">
      <div className="flex items-center gap-1 text-orange-700 text-[8px] uppercase border-b border-orange-950/50 pb-0.5 mb-0.5">
        <Radio className="w-2.5 h-2.5" /> Comms Channel
      </div>
      {messages.map((msg, i) => (
        <div
          key={msg.timestamp + ':' + i}
          className={`${TYPE_COLORS[msg.type] || 'text-orange-400'} truncate`}
          style={{ opacity: 0.3 + ((i + 1) / messages.length) * 0.7 }}
        >
          <span className="text-orange-700 text-[8px]">{TYPE_PREFIX[msg.type] || ''}</span> {msg.message}
        </div>
      ))}
    </div>
  );
}