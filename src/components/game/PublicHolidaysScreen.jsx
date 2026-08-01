// Public Holidays Screen — calendar of lucrative seasonal events
import React from 'react';
import { Calendar, PartyPopper, Clock, TrendingUp } from 'lucide-react';
import {
  PUBLIC_HOLIDAYS,
  getActiveHolidays,
  getUpcomingHolidays,
  formatHolidayDate,
} from '@/lib/publicHolidays';

export default function PublicHolidaysScreen() {
  const now = new Date();
  const active = getActiveHolidays(now);
  const upcoming = getUpcomingHolidays(now);
  const currentYear = now.getFullYear();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Sort all holidays by calendar date for the full list
  const sortedHolidays = [...PUBLIC_HOLIDAYS].sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Public Holidays</h2>
      </div>
      <div className="text-orange-700 text-xs -mt-2">
        Real-calendar seasonal events with extremely lucrative profit opportunities. Each event is announced 2 weeks ahead and lasts 7 days. Plan your trade routes and stock up before kickoff!
      </div>

      {/* Active holidays */}
      {active.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-green-500 text-sm font-bold uppercase flex items-center gap-1">
            <PartyPopper className="w-4 h-4" /> Active Now
          </h3>
          {active.map(h => (
            <div key={h.id} className="border border-green-600 bg-green-950/10 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-green-300 font-bold text-sm flex items-center gap-1">
                  <span className="text-lg">{h.icon}</span> {h.name}
                </span>
                <span className="text-green-500 text-[10px] border border-green-700 px-1.5 py-0.5">
                  {h.daysLeft}d remaining
                </span>
              </div>
              <div className="text-green-600 text-[10px]">{h.description}</div>
              <div className="text-yellow-400 text-[11px] font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {h.profitSummary}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming holidays (in countdown window) */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-yellow-500 text-sm font-bold uppercase flex items-center gap-1">
            <Clock className="w-4 h-4" /> Upcoming — Stock Up Now!
          </h3>
          {upcoming.map(h => (
            <div key={h.id} className="border border-yellow-700 bg-yellow-950/10 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-yellow-300 font-bold text-sm flex items-center gap-1">
                  <span className="text-lg">{h.icon}</span> {h.name}
                </span>
                <span className="text-yellow-500 text-[10px] border border-yellow-700 px-1.5 py-0.5">
                  {h.daysUntil}d until start
                </span>
              </div>
              <div className="text-yellow-600 text-[10px]">{h.description}</div>
              <div className="text-orange-400 text-[11px] font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {h.profitSummary}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full calendar */}
      <div className="space-y-2">
        <h3 className="text-orange-500 text-sm font-bold uppercase flex items-center gap-1">
          <Calendar className="w-4 h-4" /> Annual Holiday Calendar
        </h3>
        {sortedHolidays.map(h => {
          const isActive = active.some(a => a.id === h.id);
          const isUpcoming = upcoming.some(u => u.id === h.id);
          return (
            <div
              key={h.id}
              className={`border p-3 space-y-1 ${
                isActive ? 'border-green-600 bg-green-950/10'
                : isUpcoming ? 'border-yellow-700 bg-yellow-950/5'
                : 'border-orange-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-orange-300 font-bold text-sm flex items-center gap-1">
                  <span className="text-lg">{h.icon}</span> {h.name}
                </span>
                <span className="text-orange-600 text-[10px]">
                  {monthNames[h.month]} {h.day} – {h.day + h.durationDays - 1}
                </span>
              </div>
              <div className="text-orange-600 text-[10px]">{h.description}</div>
              <div className="text-orange-500/80 text-[11px] leading-relaxed border-l-2 border-orange-900/50 pl-2 mt-1">
                {h.lore}
              </div>
              <div className="text-cyan-400 text-[11px] font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {h.profitSummary}
              </div>
              {isActive && (
                <div className="text-green-500 text-[10px] font-bold uppercase mt-1">⚡ ACTIVE NOW</div>
              )}
              {isUpcoming && (
                <div className="text-yellow-500 text-[10px] font-bold uppercase mt-1">⏳ COUNTDOWN ACTIVE</div>
              )}
            </div>
          );
        })}
      </div>

      {active.length === 0 && upcoming.length === 0 && (
        <div className="border border-orange-900 p-4 text-center text-orange-700 text-xs">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No active or upcoming holidays within the 2-week countdown window. Check the calendar below for the next event!
        </div>
      )}
    </div>
  );
}