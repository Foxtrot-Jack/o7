// Carrier room-grid functions — extracted as a hook to keep gameState.jsx lean.
// Operates on prev.carrierRoomGrid / prev.carrierCurrentRoom via setState patches.
import { useCallback } from 'react';
import { ROOM_TYPES } from './cabinRooms';

export function useCarrierRoomGrid(setState) {
  const initCarrierRoomGrid = useCallback((carrierId) => {
    setState(prev => {
      if (prev.carrierRoomGrid?.[carrierId]) return prev;
      const rooms = {};
      const defaults = [
        ['0,0', 'observation', 'Observation Lounge'],
        ['1,0', 'command', 'Command Deck'],
        ['2,0', 'quarters', 'Living Quarters'],
        ['3,0', 'bar', 'The Driftwood Tavern'],
        ['4,0', 'garden', 'Botanical Wing'],
        ['5,0', 'trophy', 'Hall of Records'],
      ];
      for (const [key, type, name] of defaults) {
        rooms[key] = { id: `cr_${carrierId}_${key}`, type, name, surfaces: {} };
      }
      return {
        ...prev,
        carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: rooms },
        carrierCurrentRoom: { ...prev.carrierCurrentRoom, [carrierId]: '2,0' },
      };
    });
  }, [setState]);

  const addCarrierRoomAt = useCallback((carrierId, gridX, gridY, roomType, roomName) => {
    const gridKey = `${gridX},${gridY}`;
    let success = true;
    setState(prev => {
      const carrierGrid = prev.carrierRoomGrid?.[carrierId] || {};
      if (carrierGrid[gridKey]) { success = false; return prev; }
      const isSb = prev.saveMode === 'sandbox';
      const cost = 500000;
      if (!isSb && prev.credits < cost) { success = false; return prev; }
      const roomDef = ROOM_TYPES[roomType] || { name: roomName || 'New Room' };
      const newRoom = { id: `cr_${carrierId}_${Date.now()}`, type: roomType, name: roomName || roomDef.name, surfaces: {}, custom: true };
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : cost),
        carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: { ...carrierGrid, [gridKey]: newRoom } },
      };
    });
    return success;
  }, [setState]);

  const customizeCarrierRoomSurface = useCallback((carrierId, gridKey, surface, field, value) => {
    setState(prev => {
      const carrierGrid = prev.carrierRoomGrid?.[carrierId] || {};
      const room = carrierGrid[gridKey];
      if (!room) return prev;
      const surfaces = { ...(room.surfaces || {}) };
      const current = surfaces[surface] || { texture: 'solid', rgb: [26, 13, 0] };
      surfaces[surface] = { ...current, [field]: value };
      return {
        ...prev,
        carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: { ...carrierGrid, [gridKey]: { ...room, surfaces } } },
      };
    });
  }, [setState]);

  const setCarrierCurrentRoom = useCallback((carrierId, gridKey) => {
    setState(prev => ({ ...prev, carrierCurrentRoom: { ...prev.carrierCurrentRoom, [carrierId]: gridKey } }));
  }, [setState]);

  const placeRoomContainer = useCallback((carrierId, gridKey, slotIndex, containerType) => {
    setState(prev => {
      const cg = prev.carrierRoomGrid?.[carrierId] || {};
      const room = cg[gridKey];
      if (!room) return prev;
      const containers = room.containers || [];
      if (containers.find(c => c.slotIndex === slotIndex)) return prev;
      const newRoom = { ...room, containers: [...containers, { id: `cnt_${Date.now()}`, type: containerType, slotIndex }] };
      const newCg = { ...cg, [gridKey]: newRoom };
      return { ...prev, carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: newCg } };
    });
  }, [setState]);

  const removeRoomContainer = useCallback((carrierId, gridKey, containerId) => {
    setState(prev => {
      const cg = prev.carrierRoomGrid?.[carrierId] || {};
      const room = cg[gridKey];
      if (!room) return prev;
      const newContainers = (room.containers || []).filter(c => c.id !== containerId);
      const newRoom = { ...room, containers: newContainers };
      const newCg = { ...cg, [gridKey]: newRoom };
      return { ...prev, carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: newCg } };
    });
  }, [setState]);

  const setRoomHologram = useCallback((carrierId, gridKey, systemData) => {
    setState(prev => {
      const cg = prev.carrierRoomGrid?.[carrierId] || {};
      const room = cg[gridKey];
      if (!room) return prev;
      const newRoom = { ...room, hologramSystem: systemData };
      const newCg = { ...cg, [gridKey]: newRoom };
      return { ...prev, carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: newCg } };
    });
  }, [setState]);

  return { initCarrierRoomGrid, addCarrierRoomAt, customizeCarrierRoomSurface, setCarrierCurrentRoom, placeRoomContainer, removeRoomContainer, setRoomHologram };
}