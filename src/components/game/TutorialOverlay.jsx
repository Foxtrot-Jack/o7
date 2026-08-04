// Tutorial overlay — step-by-step guide that highlights menu elements
import React, { useState, useEffect } from 'react';
import { TUTORIAL_STEPS } from '@/lib/tutorialSteps';
import { soundEngine } from '@/lib/soundEngine';
import { ChevronLeft, ChevronRight, X, GraduationCap } from 'lucide-react';

export default function TutorialOverlay({ onClose, onTargetChange }) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  // Push the current step's highlight target up to the parent so NavBar opens it
  useEffect(() => {
    onTargetChange(current.target);
    return () => onTargetChange(null);
  }, [step]);

  const next = () => {
    soundEngine.play('click');
    if (isLast) { onClose(); return; }
    setStep(s => s + 1);
  };
  const prev = () => {
    soundEngine.play('back');
    if (step > 0) setStep(s => s - 1);
  };
  const skip = () => {
    soundEngine.play('back');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Dimming backdrop — click anywhere to skip */}
      <div className="absolute inset-0 bg-black/50" onClick={skip} />

      {/* Instruction panel */}
      <div className="relative z-10 w-full max-w-lg mx-2 mb-2 sm:mb-4 border border-cyan-700 bg-black p-4 space-y-3 shadow-lg shadow-cyan-950/50">
        <div className="flex items-center gap-2 border-b border-cyan-900 pb-2">
          <GraduationCap className="w-5 h-5 text-cyan-500" />
          <h2 className="text-cyan-300 font-bold uppercase text-sm flex-1">{current.title}</h2>
          <span className="text-cyan-700 text-[10px]">STEP {step + 1}/{TUTORIAL_STEPS.length}</span>
          <button onClick={skip} className="text-cyan-700 hover:text-cyan-400"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-cyan-200 text-xs leading-relaxed">{current.text}</p>
        <div className="flex items-center justify-between pt-1">
          <button onClick={prev} disabled={step === 0} className="flex items-center gap-1 px-3 py-1.5 border border-cyan-800 text-cyan-500 hover:bg-cyan-950/30 text-xs disabled:opacity-30">
            <ChevronLeft className="w-3.5 h-3.5" /> PREV
          </button>
          <span className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-cyan-400' : 'bg-cyan-900'}`} />
            ))}
          </span>
          <button onClick={next} className="flex items-center gap-1 px-3 py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold">
            {isLast ? 'FINISH' : 'NEXT'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}