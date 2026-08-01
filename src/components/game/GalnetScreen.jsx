// StarNet News Feed — in-universe news ticker
import React, { useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateNews, NEWS_CATEGORIES } from '@/lib/galnet';
import { Landmark, TrendingUp, Telescope, Users, AlertTriangle, Newspaper } from 'lucide-react';

const CAT_ICONS = {
  political: Landmark,
  economic: TrendingUp,
  exploration: Telescope,
  community: Users,
  anomalies: AlertTriangle,
};

export default function GalnetScreen() {
  const { state } = useGameState();
  const articles = useMemo(() => generateNews(state), [state.totalJumps, state.communityGoals, state.powerPlay]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">StarNet News Feed</h2>
        <span className="text-orange-700 text-[10px] ml-auto">CYCLE {state.totalJumps}</span>
      </div>

      {articles.map(article => {
        const cat = NEWS_CATEGORIES[article.category];
        const Icon = CAT_ICONS[article.category] || Newspaper;
        const ageHrs = Math.floor((Date.now() - article.timestamp) / 3600000);
        const ageLabel = ageHrs < 1 ? 'Just now' : ageHrs < 24 ? `${ageHrs}h ago` : `${Math.floor(ageHrs / 24)}d ago`;
        return (
          <div key={article.id} className="border border-orange-900 p-3 hover:border-orange-700 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3.5 h-3.5 ${cat?.color || 'text-orange-500'}`} />
              <span className={`text-[9px] uppercase font-bold ${cat?.color || 'text-orange-500'}`}>{cat?.label}</span>
              <span className="text-orange-800 text-[9px] ml-auto">{ageLabel}</span>
            </div>
            <p className="text-orange-400 text-xs leading-relaxed">{article.headline}</p>
          </div>
        );
      })}
    </div>
  );
}