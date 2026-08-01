import { COCKPIT_PARTS, COCKPIT_PART_MAP } from './cockpitParts';

// Cabin room configurations — player living quarters
// Room 0: living quarters (window, bed, doors, shelves)
// Room 1: customization room (no window, tables, more shelves) — medium/large only
export const CABIN_CONFIGS = {
  1: { name: 'Compact Cabin', rooms: 1, width: 3.2, height: 2.4, depth: 4.0 },
  2: { name: 'Standard Cabin', rooms: 1, width: 4.0, height: 2.7, depth: 4.5 },
  3: { name: 'Spacious Cabin', rooms: 2, width: 5.0, height: 3.0, depth: 5.5 },
  4: { name: 'Luxury Cabin', rooms: 2, width: 6.0, height: 3.2, depth: 6.5 },
  carrier: { name: 'Carrier Quarters', rooms: 2, width: 6.0, height: 3.2, depth: 6.5 },
  station: { name: 'Station Quarters', rooms: 2, width: 5.5, height: 3.0, depth: 6.0 },
};

export const DOOR_W = 0.8;
export const DOOR_H = 1.8;

export function getWindowConfig(width, height) {
  const w = Math.min(width * 0.5, 2.0);
  const h = Math.min(height * 0.45, 1.4);
  return { w, h, y: 0.3 };
}

export function genCabinSlots(config, room) {
  const { width, depth } = config;
  const hw = width / 2;
  const hd = depth / 2;
  const slots = [];

  if (room === 0) {
    const bedZ = hd - 0.25;
    slots.push(
      { id: 'bunk_l', label: 'Bunk Left', category: 'personal', pos: [-0.35, -0.3, bedZ], wall: 'back' },
      { id: 'bunk_r', label: 'Bunk Right', category: 'personal', pos: [0.35, -0.3, bedZ], wall: 'back' },
      { id: 'bunk_shelf', label: 'Bed Shelf', category: 'hanging', pos: [0, 0.6, bedZ], wall: 'back' },
      { id: 'shelf_la', label: 'Left Shelf A', category: 'decor', pos: [-hw + 0.2, 0.5, -0.8], wall: 'left' },
      { id: 'shelf_lb', label: 'Left Shelf B', category: 'personal', pos: [-hw + 0.2, 0.0, -0.8], wall: 'left' },
      { id: 'shelf_lc', label: 'Left Shelf C', category: 'decor', pos: [-hw + 0.2, 0.5, 0.8], wall: 'left' },
      { id: 'shelf_ld', label: 'Left Shelf D', category: 'personal', pos: [-hw + 0.2, 0.0, 0.8], wall: 'left' },
      { id: 'shelf_ra', label: 'Right Shelf A', category: 'decor', pos: [hw - 0.2, 0.5, -0.8], wall: 'right' },
      { id: 'shelf_rb', label: 'Right Shelf B', category: 'personal', pos: [hw - 0.2, 0.0, -0.8], wall: 'right' },
      { id: 'shelf_rc', label: 'Right Shelf C', category: 'decor', pos: [hw - 0.2, 0.5, 0.8], wall: 'right' },
      { id: 'shelf_rd', label: 'Right Shelf D', category: 'personal', pos: [hw - 0.2, 0.0, 0.8], wall: 'right' },
    );
    if (width >= 4) {
      slots.push(
        { id: 'bunk_sl', label: 'Bed Shelf L', category: 'hanging', pos: [-0.5, 0.6, bedZ], wall: 'back' },
        { id: 'bunk_sr', label: 'Bed Shelf R', category: 'hanging', pos: [0.5, 0.6, bedZ], wall: 'back' },
      );
    }
    if (width >= 5) {
      slots.push(
        { id: 'shelf_le', label: 'Left Shelf E', category: 'personal', pos: [-hw + 0.2, -0.4, -0.8], wall: 'left' },
        { id: 'shelf_re', label: 'Right Shelf E', category: 'decor', pos: [hw - 0.2, -0.4, 0.8], wall: 'right' },
      );
    }
  } else {
    slots.push(
      { id: 'table_l', label: 'Table Left', category: 'console', pos: [-0.8, -1.0, 0.3], wall: 'floor' },
      { id: 'table_r', label: 'Table Right', category: 'console', pos: [0.8, -1.0, 0.3], wall: 'floor' },
      { id: 'shelf_fl1', label: 'Front L Top', category: 'personal', pos: [-1.3, 0.7, -hd + 0.2], wall: 'front' },
      { id: 'shelf_fl2', label: 'Front L Bot', category: 'decor', pos: [-1.3, 0.1, -hd + 0.2], wall: 'front' },
      { id: 'shelf_fr1', label: 'Front R Top', category: 'personal', pos: [1.3, 0.7, -hd + 0.2], wall: 'front' },
      { id: 'shelf_fr2', label: 'Front R Bot', category: 'decor', pos: [1.3, 0.1, -hd + 0.2], wall: 'front' },
      { id: 'shelf_bl1', label: 'Back L Top', category: 'personal', pos: [-1.3, 0.7, hd - 0.2], wall: 'back' },
      { id: 'shelf_bl2', label: 'Back L Bot', category: 'decor', pos: [-1.3, 0.1, hd - 0.2], wall: 'back' },
      { id: 'shelf_br1', label: 'Back R Top', category: 'personal', pos: [1.3, 0.7, hd - 0.2], wall: 'back' },
      { id: 'shelf_br2', label: 'Back R Bot', category: 'decor', pos: [1.3, 0.1, hd - 0.2], wall: 'back' },
    );
    if (width >= 6) {
      slots.push(
        { id: 'table_c', label: 'Table Center', category: 'console', pos: [0, -1.0, 0.3], wall: 'floor' },
        { id: 'shelf_fc1', label: 'Front C Top', category: 'personal', pos: [0, 0.7, -hd + 0.2], wall: 'front' },
        { id: 'shelf_fc2', label: 'Front C Bot', category: 'decor', pos: [0, 0.1, -hd + 0.2], wall: 'front' },
      );
    }
  }
  return slots;
}

export function getCabinConfig(shipClass) {
  return CABIN_CONFIGS[shipClass] || CABIN_CONFIGS[1];
}

export function getCabinPartsForSlot(slot) {
  if (!slot) return [];
  return COCKPIT_PARTS[slot.category] || [];
}