// Fleet Management — view all owned ships in 3D, rename, transfer, switch
import React, { useState } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import ShipViewer from './ShipViewer';
import { Package, ArrowLeftRight, Edit2, Check } from 'lucide-react';

export default function FleetScreen() {
  const { state, switchShip, transferShip, renameShip } = useGameState();
  const [selId, setSelId] = useState('current');
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const sel = selId === 'current'
    ? { id: 'current', typeId: state.ship.type, customName: state.ship.name, isCurrent: true, storedAt: null }
    : state.ownedShips.find(s => s.id === selId);

  if (!sel) { setSelId('current'); return null; }
  const shipType = SHIP_MAP[sel.typeId];
  const transferCost = shipType ? Math.ceil(shipType.cost * 0.01) + 10000 : 10000;

  const handleRename = () => {
    if (nameInput.trim()) renameShip(selId, nameInput.trim());
    setEditing(false);
  };

  const getLocation = (ship) => {
    if (ship.isCurrent) return 'CURRENTLY PILOTED';
    if (!ship.storedAt) return 'UNKNOWN';
    if (ship.storedAt.carrierId) {
      const c = state.fleetCarriers.find(c => c.id === ship.storedAt.carrierId);
      return c ? `CARRIER: ${c.name}` : 'CARRIER (MISSING)';
    }
    if (ship.storedAt.systemSeed === state.currentSystem.seed) {
      return state.currentLocation === 'station' ? 'THIS STATION' : 'THIS SYSTEM';
    }
    return 'STORED AT ANOTHER SYSTEM';
  };

  const canSwitch = !sel.isCurrent && (() => {
    if (!sel.storedAt) return false;
    if (sel.storedAt.carrierId) {
      const c = state.fleetCarriers.find(c => c.id === sel.storedAt.carrierId);
      return c && c.systemSeed === state.currentSystem.seed;
    }
    return sel.storedAt.systemSeed === state.currentSystem.seed &&
           sel.storedAt.stationId === state.currentStationId;
  })();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-orange-900 p-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold text-sm uppercase">Fleet Management</h2>
        <span className="text-orange-700 text-xs ml-auto">{state.ownedShips.length + 1} SHIPS</span>
      </div>

      {/* Ship selector */}
      <div className="border-b border-orange-900/50 p-2 overflow-x-auto">
        <div className="flex gap-1">
          <ShipBtn label={state.ship.name} active={selId === 'current'} onClick={() => setSelId('current')} current />
          {state.ownedShips.map(s => (
            <ShipBtn key={s.id} label={s.customName || SHIP_MAP[s.typeId]?.name} active={selId === s.id} onClick={() => setSelId(s.id)} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Viewer */}
        <div className="flex-1 min-h-[200px] border-b lg:border-b-0 lg:border-r border-orange-900/50 relative">
          <ShipViewer shipTypeId={sel.typeId} />
          <div className="absolute top-2 left-2 text-orange-700 text-[10px] pointer-events-none">DRAG TO ROTATE · SCROLL/PINCH TO ZOOM</div>
        </div>

        {/* Details */}
        <div className="w-full lg:w-64 p-3 overflow-y-auto space-y-3 text-xs">
          <div className="border border-orange-900 p-2">
            <div className="text-orange-700 text-[10px] uppercase">Ship Name</div>
            {editing ? (
              <div className="flex gap-1 mt-1">
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} className="flex-1 bg-black border border-orange-700 text-orange-300 px-1 text-xs" maxLength={30} />
                <button onClick={handleRename} className="px-1 border border-orange-500 text-orange-300"><Check className="w-3 h-3" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span className="text-orange-300 font-bold">{sel.customName || shipType?.name}</span>
                <button onClick={() => { setEditing(true); setNameInput(sel.customName || ''); }} className="text-orange-600 hover:text-orange-400"><Edit2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>

          <div className="border border-orange-900 p-2 space-y-1">
            <div className="text-orange-700 text-[10px] uppercase">Specifications</div>
            <div className="text-orange-400">{shipType?.name}</div>
            <div className="text-orange-700 text-[10px]">{shipType?.manufacturer} · Class {shipType?.class} · {shipType?.multirole ? 'Multirole' : 'Specialist'}</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
              <div>Cargo: <span className="text-orange-400">{shipType?.cargoCapacity}T</span></div>
              <div>Fuel: <span className="text-orange-400">{shipType?.fuelCapacity}T</span></div>
              <div>Jump: <span className="text-orange-400">{shipType?.jumpRange}LY</span></div>
              <div>Value: <span className="text-orange-400">{(shipType?.cost || 0).toLocaleString()} CR</span></div>
            </div>
          </div>

          <div className="border border-orange-900 p-2">
            <div className="text-orange-700 text-[10px] uppercase">Location</div>
            <div className={`mt-1 ${sel.isCurrent ? 'text-green-500' : 'text-orange-400'}`}>{getLocation(sel)}</div>
          </div>

          {!sel.isCurrent && (
            canSwitch ? (
              <button onClick={() => { switchShip(sel.id); setSelId('current'); }} className="w-full py-2 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold">SWITCH TO THIS SHIP</button>
            ) : (
              <button onClick={() => transferShip(sel.id)} disabled={state.credits < transferCost} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1">
                <ArrowLeftRight className="w-3 h-3" /> TRANSFER HERE — {transferCost.toLocaleString()} CR
              </button>
            )
          )}
          <div className="text-orange-700 text-[10px] text-center">Purchase new ships at a station shipyard. Ships are stored at the station where purchased.</div>
        </div>
      </div>
    </div>
  );
}

function ShipBtn({ label, active, onClick, current }) {
  return (
    <button onClick={onClick} className={`px-2 py-1 border text-[10px] whitespace-nowrap ${active ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'} ${current ? 'ring-1 ring-green-700' : ''}`}>
      {current && '◉ '}{label}
    </button>
  );
}