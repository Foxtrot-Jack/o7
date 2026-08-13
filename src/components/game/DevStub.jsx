// Generic placeholder for screens still in development.
import React from 'react';
import { Cpu } from 'lucide-react';

export default function DevStub({ title, description }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="border border-orange-900 bg-black/60 p-6 max-w-md text-center space-y-2">
        <Cpu className="w-8 h-8 text-orange-600 mx-auto" />
        <div className="text-orange-300 font-bold uppercase text-sm">{title}</div>
        <div className="text-orange-700 text-xs">{description || 'This feature is currently in development and will be available in a future update.'}</div>
        <div className="text-orange-800 text-[10px] uppercase tracking-widest border-t border-orange-950/50 pt-2">Feature In Development</div>
      </div>
    </div>
  );
}