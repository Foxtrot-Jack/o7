// HackingMinigame — Mastermind-style code breaking minigame for data terminals
import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Terminal, X, Check, AlertTriangle } from 'lucide-react';

const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;

function generateCode() {
  const code = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    code.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }
  return code;
}

function evaluateGuess(guess, code) {
  let exact = 0;
  let partial = 0;
  const codeCopy = [...code];
  const guessCopy = [...guess];
  // Exact matches
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === codeCopy[i]) {
      exact++;
      codeCopy[i] = null;
      guessCopy[i] = null;
    }
  }
  // Partial matches
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] !== null) {
      const idx = codeCopy.indexOf(guessCopy[i]);
      if (idx !== -1) {
        partial++;
        codeCopy[idx] = null;
      }
    }
  }
  return { exact, partial };
}

export default function HackingMinigame({ target, difficulty = 1, onComplete, onClose }) {
  const [code, setCode] = useState(generateCode);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 + difficulty * 10);

  useEffect(() => {
    if (won || lost) return;
    if (timeLeft <= 0) {
      setLost(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, won, lost]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== CODE_LENGTH || won || lost) return;
    const result = evaluateGuess(currentGuess, code);
    const newAttempts = [...attempts, { guess: [...currentGuess], ...result }];
    setAttempts(newAttempts);
    setCurrentGuess([]);
    if (result.exact === CODE_LENGTH) {
      setWon(true);
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      setLost(true);
    }
  }, [currentGuess, code, attempts, won, lost]);

  const addSymbol = (sym) => {
    if (currentGuess.length < CODE_LENGTH && !won && !lost) {
      setCurrentGuess([...currentGuess, sym]);
    }
  };

  const removeSymbol = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleComplete = (success) => {
    onComplete(success);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-green-700 bg-black p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-900 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-500" />
            <h3 className="text-green-300 font-bold uppercase text-sm">Data Terminal Hack</h3>
          </div>
          <button onClick={onClose} disabled={won || lost}><X className="w-4 h-4 text-green-700" /></button>
        </div>

        {/* Target */}
        {target && <div className="text-green-600 text-[10px]">TARGET: {target}</div>}

        {/* Timer */}
        <div className={`text-center text-xs font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
          {timeLeft}s {won ? '✓ ACCESS GRANTED' : lost ? '✗ LOCKOUT' : 'REMAINING'}
        </div>

        {/* Current guess display */}
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <div key={i} className={`w-9 h-9 border flex items-center justify-center text-lg font-bold ${
              currentGuess[i] ? 'border-green-500 text-green-300 bg-green-950/30' : 'border-green-900 text-green-800'
            }`}>
              {currentGuess[i] || '·'}
            </div>
          ))}
        </div>

        {/* Symbol pad */}
        {!won && !lost && (
          <div className="grid grid-cols-6 gap-1">
            {SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => addSymbol(sym)}
                className="py-2 border border-green-800 text-green-400 hover:bg-green-950/40 hover:border-green-500 text-sm font-bold"
              >
                {sym}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        {!won && !lost && (
          <div className="flex gap-2">
            <button onClick={removeSymbol} disabled={currentGuess.length === 0} className="flex-1 py-1.5 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-xs disabled:opacity-30">
              ⌫ CLEAR
            </button>
            <button onClick={submitGuess} disabled={currentGuess.length !== CODE_LENGTH} className="flex-1 py-1.5 border border-green-700 text-green-400 hover:bg-green-950/40 text-xs font-bold disabled:opacity-30">
              SUBMIT
            </button>
          </div>
        )}

        {/* Attempt history */}
        {attempts.length > 0 && (
          <div className="border border-green-900 p-2 space-y-1 max-h-32 overflow-y-auto">
            <div className="text-green-700 text-[8px] uppercase">Log</div>
            {attempts.map((att, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex gap-0.5">
                  {att.guess.map((s, j) => <span key={j} className="text-green-400">{s}</span>)}
                </div>
                <div className="flex gap-1 text-[9px]">
                  <span className="text-green-500">●{att.exact}</span>
                  <span className="text-yellow-600">◐{att.partial}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {won && (
          <div className="border border-green-500 bg-green-950/20 p-3 text-center space-y-2">
            <Check className="w-6 h-6 text-green-400 mx-auto" />
            <div className="text-green-300 font-bold text-sm">ACCESS GRANTED</div>
            <button onClick={() => handleComplete(true)} className="w-full py-1.5 border border-green-500 text-green-400 hover:bg-green-950/40 text-xs font-bold">
              COLLECT DATA
            </button>
          </div>
        )}
        {lost && (
          <div className="border border-red-700 bg-red-950/20 p-3 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
            <div className="text-red-300 font-bold text-sm">SYSTEM LOCKOUT</div>
            <div className="text-red-600 text-[10px]">Code was: {code.join(' ')}</div>
            <button onClick={() => handleComplete(false)} className="w-full py-1.5 border border-red-700 text-red-400 hover:bg-red-950/40 text-xs font-bold">
              ABORT
            </button>
          </div>
        )}

        <div className="text-green-800 text-[8px] text-center border-t border-green-950 pt-1">
          ● exact position · ◐ wrong position
        </div>
      </div>
    </div>
  );
}