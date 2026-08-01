// Room Manager — manage fleet carrier and station rooms
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { ROOM_TYPES, MAX_CARRIER_ROOMS, getRoomCost, getStationRoomCost, getAllRooms, getCarrierServiceRooms } from '@/lib/cabinRooms';
import { Plus, Trash2, DoorOpen, Eye } from 'lucide-react';

export default function RoomManagerScreen({ onNavigate }) {
  const { state, isSandbox, addCarrierRoom, removeCarrierRoom } = useGameState();
  const [target, setTarget] = useState(state.fleetCarriers?.[0] ? 'carrier' : state.ownedStations?.[0] ? 'station' : 'carrier');
  const [carrierId, setCarrierId] = useState(state.fleetCarriers?.[0]?.id || null);
  const [stationId, setStationId] = useState(state.ownedStations?.[0]?.id || null);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState('aquarium');
  const [newName, setNewName] = useState('');
  const [msg, setMsg] = useState(null);

  const targetId = target === 'carrier' ? carrierId : stationId;
  const isStation = target === 'station';
  const rooms = getAllRooms(target, targetId, state);
  const customRooms = state.carrierRooms?.[targetId] || [];
  const atMax = !isStation && customRooms.length >= MAX_CARRIER_ROOMS;
  const cost = isStation ? getStationRoomCost(customRooms, isSandbox) : getRoomCost(customRooms, isSandbox);

  const handleAdd = () => {
    const result = addCarrierRoom(targetId, newType, newName, isStation);
    if (result === false) {
      setMsg(atMax ? 'Maximum rooms reached (25)' : 'Insufficient credits');
    } else {
      setMsg(`${ROOM_TYPES[newType].name} added!`);
      setShowAdd(false);
      setNewName('');
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEnter = (room) => {
    if (room.type === 'living') onNavigate?.('cabin');
    else if (room.type === 'aquarium') onNavigate?.('aquarium');
    else if (room.type === 'garden') onNavigate?.('garden');
    else if (room.type === 'genetics') onNavigate?.('geneticslab');
  };

  const hasCarriers = (state.fleetCarriers?.length || 0) > 0;
  const hasStations = (state.ownedStations?.length || 0) > 0;

  if (!hasCarriers && !hasStations) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-orange-600 text-xs text-center">Own a fleet carrier or station to manage rooms.</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {hasCarriers && (
          <button onClick={() => { setTarget('carrier'); setCarrierId(state.fleetCarriers[0].id); }} className={`px-2 py-1 text-[10px] border ${target === 'carrier' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>CARRIER</button>
        )}
        {hasStations && (
          <button onClick={() => { setTarget('station'); setStationId(state.ownedStations[0].id); }} className={`px-2 py-1 text-[10px] border ${target === 'station' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>STATION</button>
        )}
        {target === 'carrier' && state.fleetCarriers?.length > 1 && (
          <select value={carrierId || ''} onChange={(e) => setCarrierId(e.target.value)} className="bg-black border border-orange-900 text-orange-400 text-[10px] px-1 py-0.5">
            {state.fleetCarriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {target === 'station' && state.ownedStations?.length > 1 && (
          <select value={stationId || ''} onChange={(e) => setStationId(e.target.value)} className="bg-black border border-orange-900 text-orange-400 text-[10px] px-1 py-0.5">
            {state.ownedStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <div className="text-[10px] text-orange-600 ml-auto">
          {isStation ? 'No room limit' : `${customRooms.length}/${MAX_CARRIER_ROOMS} rooms`}
        </div>
      </div>

      {msg && <div className="text-green-500 text-[10px] text-center border border-green-900 bg-green-950/20 py-1">{msg}</div>}

      {/* Room list */}
      <div className="space-y-1">
        {rooms.map(room => {
          const isCustom = !room.isService;
          const roomDef = ROOM_TYPES[room.type];
          return (
            <div key={room.id} className={`flex items-center justify-between border p-2 ${room.isService ? 'border-cyan-900 bg-cyan-950/10' : 'border-orange-900 bg-black/50'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${room.isService ? 'text-cyan-400' : 'text-orange-300'}`}>{room.name}</span>
                  {room.isService && <span className="text-[8px] text-cyan-700 border border-cyan-900 px-1">SERVICE</span>}
                </div>
                <div className="text-[9px] text-orange-700">{roomDef?.desc || SERVICE_ROOM_DESC(room.type) || ''}</div>
              </div>
              <div className="flex gap-1">
                {!room.isService && room.type !== 'living' && (
                  <button onClick={() => handleEnter(room)} className="px-2 py-1 border border-green-700 text-green-500 hover:bg-green-950/30 text-[9px] flex items-center gap-1">
                    <DoorOpen className="w-3 h-3" /> ENTER
                  </button>
                )}
                {(room.type === 'living' || room.isService) && (
                  <button onClick={() => room.type === 'living' ? onNavigate?.('cabin') : null} disabled={room.isService && !canEnterService(room.type)} className="px-2 py-1 border border-orange-900 text-orange-600 hover:text-orange-400 text-[9px] flex items-center gap-1 disabled:opacity-40">
                    <Eye className="w-3 h-3" /> {room.isService ? 'LOCKED' : 'VIEW'}
                  </button>
                )}
                {isCustom && (
                  <button onClick={() => removeCarrierRoom(targetId, room.id)} className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[9px]">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add room */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} disabled={atMax && !isStation} className="w-full py-2 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-40">
          <Plus className="w-3 h-3" /> ADD ROOM {atMax && !isStation ? '(MAX REACHED)' : `· ${cost.toLocaleString()} CR`}
        </button>
      ) : (
        <div className="border border-orange-800 bg-black p-3 space-y-2">
          <div className="text-orange-700 text-[9px] uppercase">New Room Type</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(ROOM_TYPES).filter(([id]) => id !== 'living').map(([id, rt]) => (
              <button key={id} onClick={() => setNewType(id)} className={`px-2 py-1 text-[10px] border ${newType === id ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
                {rt.name}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-orange-600">{ROOM_TYPES[newType]?.desc}</div>
          <input type="text" placeholder="Room name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-black border border-orange-900 text-orange-400 text-[10px] px-2 py-1" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-orange-400">Cost: {isSandbox ? 'FREE' : `${cost.toLocaleString()} CR`}</span>
            <div className="flex gap-1">
              <button onClick={handleAdd} className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">BUILD</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-1 border border-orange-900 text-orange-600 text-[10px]">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SERVICE_ROOM_DESC(type) {
  const svc = type?.replace('service_', '');
  const descs = { market: 'Trade commodities', shipyard: 'Purchase ships', outfitting: 'Ship modules', refuel: 'Refuel ship', repair: 'Repair hull' };
  return descs[svc] || '';
}

function canEnterService(type) {
  return false;
}