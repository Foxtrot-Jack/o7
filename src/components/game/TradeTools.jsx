// Trade Tools — container with Inara-like trade routes and Spansh-like route plotter
import React, { useState } from 'react';
import { TrendingUp, Route } from 'lucide-react';
import TradeRoutes from './TradeRoutes';
import RoutePlotter from './RoutePlotter';

export default function TradeTools() {
  const [tab, setTab] = useState('trade');
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-1 border-b border-orange-900/50 p-1">
        <button onClick={() => setTab('trade')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all ${tab === 'trade' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-transparent text-orange-700 hover:text-orange-500'}`}>
          <TrendingUp className="w-3.5 h-3.5" /> Trade Routes
        </button>
        <button onClick={() => setTab('route')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all ${tab === 'route' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-transparent text-orange-700 hover:text-orange-500'}`}>
          <Route className="w-3.5 h-3.5" /> Route Plotter
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {tab === 'trade' && <TradeRoutes />}
        {tab === 'route' && <RoutePlotter />}
      </div>
    </div>
  );
}