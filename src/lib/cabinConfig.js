import * as THREE from 'three';
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

// === SURFACE CUSTOMIZATION ===

export const CABIN_TEXTURES = [
  { id: 'solid', name: 'Solid' },
  { id: 'checker', name: 'Checker' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'grid', name: 'Grid' },
  { id: 'herringbone', name: 'Herringbone' },
  { id: 'metal', name: 'Brushed Metal' },
  { id: 'wood', name: 'Wood Grain' },
  { id: 'carbon', name: 'Carbon Fiber' },
];

export const DEFAULT_SURFACE_COLORS = {
  floor: [21, 8, 0],
  ceiling: [15, 5, 0],
  wallFront: [26, 13, 0],
  wallBack: [26, 13, 0],
  wallLeft: [26, 13, 0],
  wallRight: [26, 13, 0],
};

export const CABIN_THEMES = {
  rustic: {
    name: 'Rustic',
    floor: { texture: 'wood', rgb: [21, 8, 0] },
    ceiling: { texture: 'metal', rgb: [15, 5, 0] },
    walls: { texture: 'solid', rgb: [26, 13, 0] },
  },
  military: {
    name: 'Military',
    floor: { texture: 'metal', rgb: [30, 30, 30] },
    ceiling: { texture: 'metal', rgb: [25, 25, 25] },
    walls: { texture: 'grid', rgb: [35, 35, 35] },
  },
  cyber: {
    name: 'Cyber',
    floor: { texture: 'grid', rgb: [10, 10, 30] },
    ceiling: { texture: 'solid', rgb: [5, 5, 20] },
    walls: { texture: 'grid', rgb: [10, 20, 50] },
  },
  sterile: {
    name: 'Sterile',
    floor: { texture: 'checker', rgb: [200, 200, 200] },
    ceiling: { texture: 'solid', rgb: [220, 220, 220] },
    walls: { texture: 'solid', rgb: [180, 180, 180] },
  },
  cozy: {
    name: 'Cozy',
    floor: { texture: 'wood', rgb: [40, 20, 10] },
    ceiling: { texture: 'solid', rgb: [30, 15, 5] },
    walls: { texture: 'stripes', rgb: [45, 22, 8] },
  },
  jungle: {
    name: 'Jungle',
    floor: { texture: 'wood', rgb: [15, 30, 10] },
    ceiling: { texture: 'solid', rgb: [10, 20, 8] },
    walls: { texture: 'carbon', rgb: [12, 35, 12] },
  },
};

export function getThemeSurfaces(theme) {
  const t = CABIN_THEMES[theme] || CABIN_THEMES.rustic;
  const rooms = {};
  for (let r = 0; r < 2; r++) {
    rooms[r] = {
      floor: { ...t.floor },
      ceiling: { ...t.ceiling },
      wallFront: { ...t.walls },
      wallBack: { ...t.walls },
      wallLeft: { ...t.walls },
      wallRight: { ...t.walls },
    };
  }
  return rooms;
}

export function createCabinTexture(type, rgb) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const [r, g, b] = rgb;
  const dark = `rgb(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)})`;
  const light = `rgb(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)})`;

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 128, 128);

  switch (type) {
    case 'checker':
      ctx.fillStyle = dark;
      for (let y = 0; y < 128; y += 32)
        for (let x = 0; x < 128; x += 32)
          if (((x + y) / 32) % 2 === 0) ctx.fillRect(x, y, 32, 32);
      break;
    case 'stripes':
      ctx.fillStyle = dark;
      for (let y = 0; y < 128; y += 16)
        if (Math.floor(y / 16) % 2 === 0) ctx.fillRect(0, y, 128, 8);
      break;
    case 'grid':
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 128; i += 16) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke();
      }
      break;
    case 'herringbone':
      ctx.fillStyle = dark;
      for (let row = 0; row < 8; row++)
        for (let col = 0; col < 8; col++) {
          ctx.save();
          ctx.translate(col * 16 + 8, row * 16);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-6, -3, 12, 6);
          ctx.restore();
        }
      break;
    case 'metal':
      for (let y = 0; y < 128; y += 2) {
        ctx.globalAlpha = 0.2 + Math.random() * 0.4;
        ctx.strokeStyle = y % 4 === 0 ? light : dark;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    case 'wood':
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1;
      for (let y = 0; y < 128; y += 6) {
        ctx.globalAlpha = 0.3 + Math.random() * 0.3;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 3);
        ctx.lineTo(128, y + Math.random() * 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 128, 0);
        ctx.lineTo(Math.random() * 128, 128);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    case 'carbon':
      ctx.fillStyle = dark;
      for (let y = 0; y < 128; y += 8)
        for (let x = 0; x < 128; x += 8)
          if (Math.random() > 0.5) ctx.fillRect(x, y, 4, 4);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}