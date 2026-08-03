// PlayerStructurePanel — info + actions for player-owned colonies and stations
// selected in the System Orrery. Rendered instead of the natural-station
// panel so colonies (which lack economy/services/distanceFromStar) never
// crash the orrery, and so port-colonies dock & body-colonies travel like
// natural stations and ports do.
import React from 'react';
import { Rocket, Building, Package, X, Anchor } from 'lucide-react';
import { BODY_TYPES } from '@/lib/system';

const STAGE_NAMES = ['Outpost', 'Settlement', 'Colony', 'City', 'Metropolis'];

export default function PlayerStructurePanel({
  structure,
  systemData,
  orbitingBodyId,
  travelInfo,
  onTravelToStation,
  onTravelToBody,
  onNavigate,
  onClose,
}) {
  if (!structure) return null;
  const { kind, data } = structure;

  const isColony = kind === 'colony';
  const Icon = isColony ? Rocket : Building;

  // Resolve the real station for a port-colony (established at an existing station port)
  const portStation = isColony && data.isPort
    ? (systemData?.stations || []).find(s => s.id === data.stationId)
    : null;
  // Resolve the parent body for a body-colony
  const parentBody = isColony && !data.isPort && data.bodyId
    ? (systemData?.bodies || []).find(b => b.id === data.bodyId)
    : null;

  const inOrbit = portStation
    ? orbitingBodyId === portStation.parentId
    : parentBody
      ? orbitingBodyId === parentBody.id
      : false;

  return (
    <div className="border border-purple-700 bg-black/95 p-3 text-xs space-y-2 shrink-0">
      <div className="flex items-center justify-between border-b border-purple-900 pb-1">
        <span className="text-purple-300 font-bold flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          {structure.name}
        </span>
        <button onClick={onClose} className="text-purple-700 hover:text-purple-400 text-[10px]">✕</button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-orange-600">
        <div>KIND: <span className="text-orange-300 uppercase">{isColony ? 'Colony' : 'Station'}</span></div>
        <div>SYSTEM: <span className="text-orange-300">{data.systemName || '---'}</span></div>
        {isColony ? (
          <>
            <div>SPEC: <span className="text-orange-300">{data.typeName || data.type}</span></div>
            <div>TIER: <span className="text-orange-300">{data.tierName || `T${data.tier ?? 0}`}</span></div>
            <div>STAGE: <span className="text-orange-300">{STAGE_NAMES[data.stage || 0]}</span></div>
            <div>POP: <span className="text-orange-300">{(data.population || 0).toLocaleString()}</span></div>
            <div>INFRA: <span className="text-orange-300">{data.infrastructure || 0}%</span></div>
            <div>HAPPY: <span className="text-orange-300">{data.happiness || 0}%</span></div>
          </>
        ) : (
          <>
            <div>ECON: <span className="text-orange-300 capitalize">{data.economy || 'mixed'}</span></div>
            <div>SVC: <span className="text-orange-300">{(data.services || []).join(', ') || 'none'}</span></div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {isColony && <span className="text-[9px] border border-purple-900 text-purple-500 px-1">{data.isPort ? 'PORT' : 'SURFACE'}</span>}
        {inOrbit && <span className="text-[9px] border border-cyan-800 text-cyan-500 px-1">✓ IN ORBIT</span>}
      </div>

      {/* Actions — mirror natural stations/ports */}
      {portStation ? (
        <button
          onClick={() => onTravelToStation(portStation)}
          disabled={!!travelInfo}
          className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-50"
        >
          {travelInfo ? `TRAVELING — ${Math.round(travelInfo.progress * 100)}%` : '⚡ TRAVEL & DOCK'}
        </button>
      ) : parentBody ? (
        <div className="space-y-1">
          <button
            onClick={() => onTravelToBody(parentBody)}
            disabled={!!travelInfo}
            className="w-full py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold disabled:opacity-50"
          >
            {travelInfo ? `TRAVELING — ${Math.round(travelInfo.progress * 100)}%` : `⚡ TRAVEL TO ${parentBody.designation || parentBody.name || 'BODY'}`}
          </button>
          {parentBody.type === BODY_TYPES.PLANET && parentBody.landable && inOrbit && (
            <button
              onClick={() => onNavigate('survey')}
              className="w-full py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold"
            >
              ⬇ LAND ON SURFACE
            </button>
          )}
        </div>
      ) : (
        <div className="text-orange-700 text-[10px] text-center py-1">Managed via Station Builder.</div>
      )}

      {/* Manage */}
      <button
        onClick={() => onNavigate(isColony ? 'colonization' : 'stationbuilder')}
        className="w-full py-1.5 border border-purple-700 text-purple-400 hover:bg-purple-950/30 text-[10px] font-bold flex items-center justify-center gap-1.5"
      >
        <Package className="w-3 h-3" /> MANAGE {isColony ? 'COLONY' : 'STATION'}
      </button>
    </div>
  );
}