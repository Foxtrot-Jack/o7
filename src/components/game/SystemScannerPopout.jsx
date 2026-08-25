// SystemScannerPopout — pop-out modular device wrapping the FSS body scanner.
// Overlays the current screen as a side panel; does not navigate away.
import React from 'react';
import { X, Radar } from 'lucide-react';
import FSSScannerScreen from './FSSScannerScreen';

export default function SystemScannerPopout({ onClose }) {
  return (
    <div className="absolute top-2 left-2 bottom-2 w-80 max-w-[90vw] border border-orange-700 bg-black/95 flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-orange-900 p-2">
        <Radar className="w-4 h-4 text-orange-500" />
        <span className="text-orange-300 font-bold uppercase text-xs flex-1">System Scanner</span>
        <button onClick={onClose} className="text-orange-700 hover:text-orange-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* FSS scanner content */}
      <div className="flex-1 overflow-y-auto">
        <FSSScannerScreen />
      </div>

      {/* Footer */}
      <div className="border-t border-orange-950 px-2 py-1 text-[8px] text-orange-800 text-center">
        Pop-out device · close to return to view
      </div>
    </div>
  );
}