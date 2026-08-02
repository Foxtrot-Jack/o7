// ShipCopilot — AI copilot panel with contextual advice + command interface
import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { getAdvice, runCopilotCommand, COPILOT_COMMANDS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/shipCopilot';
import { soundEngine } from '@/lib/soundEngine';
import { Bot, ChevronDown, ChevronUp } from 'lucide-react';

export default function ShipCopilot() {
  const { state } = useGameState();
  const [expanded, setExpanded] = useState(false);
  const [commandOutput, setCommandOutput] = useState(null);
  const [activeCommand, setActiveCommand] = useState(null);
  const [advice, setAdvice] = useState([]);

  // Refresh advice every 4 seconds
  useEffect(() => {
    const update = () => setAdvice(getAdvice(state));
    update();
    const interval = setInterval(update, 4000);
    return () => clearInterval(interval);
  }, [state]);

  const handleCommand = useCallback((cmd) => {
    soundEngine.play('click');
    const output = runCopilotCommand(cmd.id, state);
    setCommandOutput(output);
    setActiveCommand(cmd.id);
  }, [state]);

  // Show the most urgent advice (or top 2)
  const visibleAdvice = advice.slice(0, expanded ? 4 : 1);

  return (
    <div className="border border-orange-900/50 bg-black/80 p-1.5 text-[10px] space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-orange-700 text-[8px] uppercase">
          <Bot className="w-2.5 h-2.5" /> Ship AI Copilot
        </div>
        <button
          onClick={() => setExpanded(c => !c)}
          className="text-orange-700 hover:text-orange-400 text-[8px] flex items-center gap-0.5"
        >
          {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          {expanded ? 'HIDE' : 'EXPAND'}
        </button>
      </div>

      {/* Advice ticker — most urgent first */}
      {visibleAdvice.length > 0 && (
        <div className="space-y-0.5 border-b border-orange-950/50 pb-1">
          {visibleAdvice.map((a, i) => (
            <div key={a.id} className={`${PRIORITY_COLORS[a.priority] || 'text-orange-400'} leading-snug`}>
              <span className="text-orange-700 text-[8px]">[{PRIORITY_LABELS[a.priority]}]</span> {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Command output */}
      {commandOutput && (
        <div className="border border-cyan-900/50 bg-cyan-950/10 p-1 space-y-0.5">
          <div className="text-cyan-700 text-[8px] uppercase flex items-center justify-between">
            <span>COPILOT RESPONSE</span>
            <button
              onClick={() => { setCommandOutput(null); setActiveCommand(null); }}
              className="text-cyan-700 hover:text-cyan-400 text-[8px]"
            >
              [X]
            </button>
          </div>
          <div className="text-cyan-400 whitespace-pre-line leading-snug">
            {commandOutput}
          </div>
        </div>
      )}

      {/* Command buttons */}
      {expanded && (
        <div className="grid grid-cols-2 gap-0.5">
          {COPILOT_COMMANDS.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => handleCommand(cmd)}
              title={cmd.desc}
              className={`px-1 py-0.5 text-[9px] border text-left transition-all ${
                activeCommand === cmd.id
                  ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300'
                  : 'border-orange-900/50 text-orange-500 hover:border-orange-600 hover:text-orange-300'
              }`}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}