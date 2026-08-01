// Carrier Interior View — 3D first-person grid-based carrier exploration
// 4-directional doors, surface customization, build-new-room, containers, cartography hologram
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { createCabinTexture } from '@/lib/cabinConfig';

const W = 6, H = 3.5, D = 6;
const DW = 1.5, DH = 2.5;
const T = 0.1;

const DIRS = {
  north: { dx: 0, dy: -1, surface: 'wallNorth', isNS: true, pos: -D / 2 },
  south: { dx: 0, dy: 1, surface: 'wallSouth', isNS: true, pos: D / 2 },
  west: { dx: -1, dy: 0, surface: 'wallWest', isNS: false, pos: -W / 2 },
  east: { dx: 1, dy: 0, surface: 'wallEast', isNS: false, pos: W / 2 },
};

const INTERACT_ACTIONS = {
  observation: 'stargaze', command: 'transit', quarters: 'decorate',
  bar: 'drinks', garden: 'flora', trophy: 'records', cartography: 'cartography',
  aquarium: 'nav-aquarium', genetics: 'nav-geneticslab',
  living: 'decorate', lounge: null, storage: null,
};

const PLACEMENT_SLOTS = [
  { x: -1.8, z: 1.0 }, { x: 0, z: 1.5 }, { x: 1.8, z: 1.0 },
  { x: -1.8, z: -1.5 }, { x: 1.8, z: -1.5 },
];

export default function CarrierInteriorView({ room, gridX, gridY, grid, onNavigate, onBuildDoor, onInteract }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const roomRef = useRef(null);
  const clickablesRef = useRef([]);
  const indicatorsRef = useRef([]);
  const plantsRef = useRef([]);
  const holoRef = useRef([]);
  const starfieldRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const lookRef = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
  const animationIdRef = useRef(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const surfaces = room?.surfaces || {};

  const hasAdjacent = (dir) => { const d = DIRS[dir]; return !!grid[`${gridX + d.dx},${gridY + d.dy}`]; };
  const adjacentName = (dir) => { const d = DIRS[dir]; return grid[`${gridX + d.dx},${gridY + d.dy}`]?.name || null; };

  const executeAction = (action) => {
    if (action.startsWith('door-')) onNavigate?.(action.replace('door-', ''));
    else if (action.startsWith('build-')) onBuildDoor?.(action.replace('build-', ''));
    else onInteract?.(action);
  };

  // Scene init
  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth, h = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 100);
    camera.position.set(0, 0, 0); camera.rotation.order = 'YXZ';
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene; rendererRef.current = renderer; cameraRef.current = camera;
    const roomGroup = new THREE.Group(); scene.add(roomGroup); roomRef.current = roomGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const lk = lookRef.current;
      lk.yaw += (lk.targetYaw - lk.yaw) * 0.08;
      lk.pitch += (lk.targetPitch - lk.pitch) * 0.08;
      camera.rotation.y = lk.yaw + Math.sin(now * 0.001) * 0.003;
      camera.rotation.x = lk.pitch + Math.cos(now * 0.0013) * 0.002;
      for (const ind of indicatorsRef.current) { const p = 1 + Math.sin(now * 0.005 + ind.phase) * 0.3; ind.scale.set(p, p, p); }
      for (const p of plantsRef.current) p.rotation.z = Math.sin(now * 0.001 + p.phase) * 0.05;
      for (const p of holoRef.current) { const a = now * 0.0004 * p.speed + p.phase; p.mesh.position.set(Math.cos(a) * p.r, p.y, Math.sin(a) * p.r); }
      if (starfieldRef.current) starfieldRef.current.rotation.y = now * 0.00005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix(); renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Build room
  useEffect(() => {
    const rg = roomRef.current;
    if (!rg || !room) return;
    while (rg.children.length > 0) { const c = rg.children[0]; rg.remove(c); if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }
    clickablesRef.current = []; indicatorsRef.current = []; plantsRef.current = []; holoRef.current = []; starfieldRef.current = null;
    lookRef.current = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 };

    const hw = W / 2, hh = H / 2, hd = D / 2;
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const frameMat = new THREE.LineBasicMaterial({ color: 0x4a2a00 });
    const propMat = new THREE.MeshBasicMaterial({ color: 0x2a1500 });
    const accentMat = new THREE.MeshBasicMaterial({ color: 0x3a2510 });

    // Floor & ceiling
    const floor = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), getSurfaceMaterial(surfaces, 'floor', [21, 8, 0])); floor.position.set(0, -hh, 0); rg.add(floor);
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), getSurfaceMaterial(surfaces, 'ceiling', [15, 5, 0])); ceil.position.set(0, hh, 0); rg.add(ceil);

    // 4 walls
    for (const [dir, d] of Object.entries(DIRS)) {
      const wallMat = getSurfaceMaterial(surfaces, d.surface, [26, 13, 0]);
      const hasDoor = hasAdjacent(dir);
      const isWindowRoom = (room.type === 'observation' || room.type === 'quarters') && dir === 'north';
      if (hasDoor) buildWallWithDoor(rg, wallMat, frameMat, doorMat, d, dir, 'door-', clickablesRef, indicatorsRef, 0x00ff44);
      else if (isWindowRoom) { buildWindowWall(rg, wallMat, frameMat, d.pos, W, H, hh); buildStarfield(rg, d.pos - 3 * Math.sign(d.pos || -1), 0.5, starfieldRef); }
      else { buildSolidWall(rg, wallMat, d); addBuildInteractable(rg, clickablesRef, indicatorsRef, d, 'build-' + dir, 0x00aa44); }
    }

    // Room-specific props
    const action = INTERACT_ACTIONS[room.type];
    if (action) buildRoomProps(rg, room.type, clickablesRef, indicatorsRef, plantsRef, holoRef, propMat, accentMat, action, hh, hd, hw, room);

    // Placed containers
    const containers = room.containers || [];
    for (const container of containers) {
      const slot = PLACEMENT_SLOTS[container.slotIndex];
      if (slot) buildContainer(rg, container.type, slot.x, slot.z, hh, propMat, accentMat);
    }
  }, [room, gridX, gridY, grid]);

  // Interaction
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    let isDragging = false, lastX = 0, lastY = 0, dragStartX = 0, dragStartY = 0;
    const handleClick = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(clickablesRef.current, false);
      if (intersects.length > 0) { const a = intersects[0].object.userData.action; if (a.startsWith('door-')) setConfirmAction(a); else executeAction(a); }
    };
    const onPD = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; dragStartX = e.clientX; dragStartY = e.clientY; };
    const onPM = (e) => { if (!isDragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; const lk = lookRef.current; lk.targetYaw -= dx * 0.003; lk.targetPitch = Math.max(-1.4, Math.min(1.4, lk.targetPitch - dy * 0.003)); };
    const onPU = (e) => { isDragging = false; if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < 5) handleClick(e.clientX, e.clientY); };
    const onTS = (e) => { if (e.touches.length === 1) { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; dragStartX = lastX; dragStartY = lastY; } };
    const onTM = (e) => { if (e.touches.length === 1 && isDragging) { e.preventDefault(); const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; const lk = lookRef.current; lk.targetYaw -= dx * 0.003; lk.targetPitch = Math.max(-1.4, Math.min(1.4, lk.targetPitch - dy * 0.003)); } };
    const onTE = (e) => { if (isDragging && e.changedTouches.length === 1) { const t = e.changedTouches[0]; if (Math.hypot(t.clientX - dragStartX, t.clientY - dragStartY) < 10) handleClick(t.clientX, t.clientY); } isDragging = false; };
    canvas.addEventListener('pointerdown', onPD); canvas.addEventListener('pointermove', onPM); canvas.addEventListener('pointerup', onPU);
    canvas.addEventListener('touchstart', onTS, { passive: false }); canvas.addEventListener('touchmove', onTM, { passive: false }); canvas.addEventListener('touchend', onTE);
    return () => { canvas.removeEventListener('pointerdown', onPD); canvas.removeEventListener('pointermove', onPM); canvas.removeEventListener('pointerup', onPU); canvas.removeEventListener('touchstart', onTS); canvas.removeEventListener('touchmove', onTM); canvas.removeEventListener('touchend', onTE); };
  }, [room, gridX, gridY, grid, onNavigate, onBuildDoor, onInteract]);

  const confirmLabel = confirmAction?.startsWith('door-') ? `Enter ${adjacentName(confirmAction.replace('door-', ''))}?` : '';

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
      <div className="absolute top-1 left-1 text-[9px] text-orange-700 pointer-events-none">{room?.name}</div>
      <div className="absolute top-1 right-1 text-[9px] space-y-0.5 pointer-events-none text-right">
        {hasAdjacent('north') && <div className="text-green-600">● N: {adjacentName('north')}</div>}
        {hasAdjacent('south') && <div className="text-green-600">● S: {adjacentName('south')}</div>}
        {hasAdjacent('east') && <div className="text-orange-500">● E: {adjacentName('east')}</div>}
        {hasAdjacent('west') && <div className="text-orange-500">● W: {adjacentName('west')}</div>}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-orange-800 pointer-events-none">DRAG TO LOOK · TAP DOORS/OBJECTS · GREEN = BUILD NEW ROOM</div>
      {confirmAction && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="border border-orange-700 bg-black p-4 text-center space-y-3 max-w-xs">
            <div className="text-orange-300 text-xs font-bold uppercase">{confirmLabel}</div>
            <div className="flex gap-2">
              <button onClick={() => { executeAction(confirmAction); setConfirmAction(null); }} className="flex-1 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">CONFIRM</button>
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-1.5 border border-orange-900 text-orange-600 hover:text-orange-400 text-[10px]">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Helpers =====

function getSurfaceMaterial(surfaces, surfaceName, defaultRgb) {
  const sc = surfaces?.[surfaceName];
  const rgb = sc?.rgb || defaultRgb;
  const tex = sc?.texture || 'solid';
  if (tex === 'solid') return new THREE.MeshBasicMaterial({ color: new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255) });
  return new THREE.MeshBasicMaterial({ map: createCabinTexture(tex, rgb) });
}

function buildWallWithDoor(rg, wallMat, frameMat, doorMat, d, dir, prefix, clickablesRef, indicatorsRef, indColor) {
  const hh = H / 2;
  if (d.isNS) {
    const topH = H - DH;
    const top = new THREE.Mesh(new THREE.BoxGeometry(W, topH, T), wallMat); top.position.set(0, -hh + DH + topH / 2, d.pos); rg.add(top);
    const sideW = W / 2 - DW / 2;
    if (sideW > 0.01) { const lm = new THREE.Mesh(new THREE.BoxGeometry(sideW, DH, T), wallMat); lm.position.set(-W/2+sideW/2, -hh+DH/2, d.pos); rg.add(lm); const rm = new THREE.Mesh(new THREE.BoxGeometry(sideW, DH, T), wallMat); rm.position.set(W/2-sideW/2, -hh+DH/2, d.pos); rg.add(rm); }
    const pts = [new THREE.Vector3(-DW/2,-hh,d.pos),new THREE.Vector3(-DW/2,-hh+DH,d.pos),new THREE.Vector3(DW/2,-hh,d.pos),new THREE.Vector3(DW/2,-hh+DH,d.pos),new THREE.Vector3(-DW/2,-hh+DH,d.pos),new THREE.Vector3(DW/2,-hh+DH,d.pos)];
    rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), frameMat));
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), doorMat); plane.position.set(0, -hh+DH/2, d.pos); plane.userData.action = prefix+dir; rg.add(plane); clickablesRef.current.push(plane);
    const ind = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4), new THREE.MeshBasicMaterial({ color: indColor })); ind.position.set(0, -hh+DH+0.2, d.pos); ind.phase = Math.random()*Math.PI*2; rg.add(ind); indicatorsRef.current.push(ind);
  } else {
    const topH = H - DH;
    const top = new THREE.Mesh(new THREE.BoxGeometry(T, topH, D), wallMat); top.position.set(d.pos, -hh+DH+topH/2, 0); rg.add(top);
    const sideD = D/2 - DW/2;
    if (sideD > 0.01) { const fm = new THREE.Mesh(new THREE.BoxGeometry(T, DH, sideD), wallMat); fm.position.set(d.pos, -hh+DH/2, -D/2+sideD/2); rg.add(fm); const bm = new THREE.Mesh(new THREE.BoxGeometry(T, DH, sideD), wallMat); bm.position.set(d.pos, -hh+DH/2, D/2-sideD/2); rg.add(bm); }
    const pts = [new THREE.Vector3(d.pos,-hh,-DW/2),new THREE.Vector3(d.pos,-hh+DH,-DW/2),new THREE.Vector3(d.pos,-hh,DW/2),new THREE.Vector3(d.pos,-hh+DH,DW/2),new THREE.Vector3(d.pos,-hh+DH,-DW/2),new THREE.Vector3(d.pos,-hh+DH,DW/2)];
    rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), frameMat));
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), doorMat); plane.position.set(d.pos, -hh+DH/2, 0); plane.rotation.y = d.pos < 0 ? Math.PI/2 : -Math.PI/2; plane.userData.action = prefix+dir; rg.add(plane); clickablesRef.current.push(plane);
    const ind = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4), new THREE.MeshBasicMaterial({ color: indColor })); ind.position.set(d.pos+(d.pos<0?0.06:-0.06), -hh+DH+0.2, 0); ind.phase = Math.random()*Math.PI*2; rg.add(ind); indicatorsRef.current.push(ind);
  }
}

function buildSolidWall(rg, wallMat, d) {
  if (d.isNS) { const w = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), wallMat); w.position.set(0, 0, d.pos); rg.add(w); }
  else { const w = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat); w.position.set(d.pos, 0, 0); rg.add(w); }
}

function addBuildInteractable(rg, clickablesRef, indicatorsRef, d, action, color) {
  const hh = H / 2;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
  if (d.isNS) { plane.position.set(0, -hh+DH/2, d.pos); } else { plane.position.set(d.pos, -hh+DH/2, 0); plane.rotation.y = d.pos < 0 ? Math.PI/2 : -Math.PI/2; }
  plane.userData.action = action; rg.add(plane); clickablesRef.current.push(plane);
  const ind = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4), new THREE.MeshBasicMaterial({ color }));
  if (d.isNS) { ind.position.set(0, -hh+DH+0.2, d.pos); } else { ind.position.set(d.pos+(d.pos<0?0.06:-0.06), -hh+DH+0.2, 0); }
  ind.phase = Math.random()*Math.PI*2; rg.add(ind); indicatorsRef.current.push(ind);
}

function buildWindowWall(rg, wallMat, frameMat, z, w, h, hh) {
  const winW = w*0.7, winH = h*0.7, winY = 0;
  const topH = hh-(winY+winH/2); if (topH > 0.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, topH, T), wallMat); m.position.set(0, winY+winH/2+topH/2, z); rg.add(m); }
  const botH = winY-winH/2+hh; if (botH > 0.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, botH, T), wallMat); m.position.set(0, -hh+botH/2, z); rg.add(m); }
  const sideW = w/2-winW/2; if (sideW > 0.01) { const lm = new THREE.Mesh(new THREE.BoxGeometry(sideW, winH, T), wallMat); lm.position.set(-w/2+sideW/2, winY, z); rg.add(lm); const rm = new THREE.Mesh(new THREE.BoxGeometry(sideW, winH, T), wallMat); rm.position.set(w/2-sideW/2, winY, z); rg.add(rm); }
  const pts = [new THREE.Vector3(-winW/2,winY-winH/2,z),new THREE.Vector3(winW/2,winY-winH/2,z),new THREE.Vector3(winW/2,winY-winH/2,z),new THREE.Vector3(winW/2,winY+winH/2,z),new THREE.Vector3(winW/2,winY+winH/2,z),new THREE.Vector3(-winW/2,winY+winH/2,z),new THREE.Vector3(-winW/2,winY+winH/2,z),new THREE.Vector3(-winW/2,winY-winH/2,z)];
  rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x224466 })));
}

function buildStarfield(rg, z, yOffset, starfieldRef) {
  const count = 400; const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); const r = 6+Math.random()*8; positions[i*3]=r*Math.sin(phi)*Math.cos(theta); positions[i*3+1]=yOffset+r*Math.sin(phi)*Math.sin(theta)*0.3; positions[i*3+2]=z+r*Math.cos(phi); }
  const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(geom, new THREE.PointsMaterial({ color: 0xffaa66, size: 0.08 })); rg.add(stars); starfieldRef.current = stars;
}

function addInteractable(rg, clickablesRef, indicatorsRef, x, y, z, w, h, action, color) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
  plane.position.set(x, y, z); plane.userData.action = action; rg.add(plane); clickablesRef.current.push(plane);
  const ind = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4), new THREE.MeshBasicMaterial({ color: color||0x00aaff }));
  ind.position.set(x, y+h/2+0.2, z); ind.phase = Math.random()*Math.PI*2; rg.add(ind); indicatorsRef.current.push(ind);
}

function buildContainer(rg, type, x, z, hh, propMat, accentMat) {
  switch (type) {
    case 'display_shelf': {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.08), propMat); post.position.set(x, -hh+0.75, z); rg.add(post);
      for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.3), accentMat); s.position.set(x, -hh+0.3+i*0.4, z); rg.add(s); }
      break;
    }
    case 'display_case': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), propMat); base.position.set(x, -hh+0.2, z); rg.add(base);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })); glass.position.set(x, -hh+0.75, z); rg.add(glass);
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.7, 0.5)), new THREE.LineBasicMaterial({ color: 0x2a1500 })); frame.position.set(x, -hh+0.75, z); rg.add(frame);
      break;
    }
    case 'storage_crate': {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), propMat); crate.position.set(x, -hh+0.3, z); rg.add(crate);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.72), accentMat); lid.position.set(x, -hh+0.64, z); rg.add(lid);
      break;
    }
    case 'side_table': {
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.5), propMat); top.position.set(x, -hh+0.5, z); rg.add(top);
      for (const [lx, lz] of [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.03), accentMat); leg.position.set(x+lx, -hh+0.25, z+lz); rg.add(leg); }
      break;
    }
  }
}

function buildRoomProps(rg, roomType, clickablesRef, indicatorsRef, plantsRef, holoRef, propMat, accentMat, action, hh, hd, hw, room) {
  switch (roomType) {
    case 'bar': {
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3, 0.9, 0.6), propMat); counter.position.set(0, -hh+0.45, hd-0.5); rg.add(counter);
      for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.25,6), new THREE.MeshBasicMaterial({ color: [0x8B4513,0xff8800,0x22cc44,0x4444ff,0xff4444,0xffaa00][i] })); b.position.set(-1+i*0.4, -hh+1.1, hd-0.55); rg.add(b); }
      for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.5,8), accentMat); s.position.set(-0.8+i*0.8, -hh+0.25, hd-1.5); rg.add(s); }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh+0.9, hd-0.8, 2, 0.8, action, 0xff8800); break;
    }
    case 'quarters': case 'living': {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1), propMat); bed.position.set(-1.5, -hh+0.1, hd-0.6); rg.add(bed);
      const mat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.9), accentMat); mat.position.set(-1.5, -hh+0.26, hd-0.6); rg.add(mat);
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.3), propMat); shelf.position.set(1.5, 0, hd-0.2); rg.add(shelf);
      addInteractable(rg, clickablesRef, indicatorsRef, 1.5, 0.3, hd-0.2, 1.2, 0.5, action, 0x00aaff); break;
    }
    case 'garden': {
      for (let i = 0; i < 3; i++) { const bed = new THREE.Mesh(new THREE.BoxGeometry(1.2,0.3,0.8), propMat); bed.position.set(-1.5+i*1.5, -hh+0.15, 0); rg.add(bed);
        for (let j = 0; j < 3; j++) { const colors=[0x22cc44,0x44ff66,0x88ff00,0x00cc88,0x66dd44]; const p = new THREE.Mesh(new THREE.ConeGeometry(0.15,0.5,6), new THREE.MeshBasicMaterial({ color: colors[(i+j)%colors.length] })); p.position.set(-1.5+i*1.5-0.3+j*0.3, -hh+0.55, -0.2+j*0.2); p.phase = Math.random()*Math.PI*2; rg.add(p); plantsRef.current.push(p); } }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh+0.3, 0, 2, 0.4, action, 0x44ff44); break;
    }
    case 'trophy': {
      for (let i = 0; i < 3; i++) { const x = -1.5+i*1.5; const cb = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.2,0.4), new THREE.MeshBasicMaterial({ color: 0x332200, transparent: true, opacity: 0.3 })); cb.position.set(x, -hh+0.6, hd-0.3); rg.add(cb);
        const tr = new THREE.Mesh(new THREE.ConeGeometry(0.1,0.35,6), new THREE.MeshBasicMaterial({ color: 0xffaa00 })); tr.position.set(x, -hh+0.5, hd-0.3); rg.add(tr);
        const bs = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.1,0.3), propMat); bs.position.set(x, -hh+0.15, hd-0.3); rg.add(bs); }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, 0, hd-0.3, 2, 1, action, 0xffaa00); break;
    }
    case 'command': {
      const con = new THREE.Mesh(new THREE.BoxGeometry(2,0.8,0.6), propMat); con.position.set(0, -hh+0.4, hd-1.5); rg.add(con);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.5), new THREE.MeshBasicMaterial({ color: 0x004466, side: THREE.DoubleSide })); scr.position.set(0, -hh+0.9, hd-1.7); scr.rotation.x = -0.3; rg.add(scr);
      for (const x of [-hw+0.06, hw-0.06]) { const holo = new THREE.Mesh(new THREE.PlaneGeometry(1,0.6), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2, side: THREE.DoubleSide })); holo.position.set(x, 0.3, 0); holo.rotation.y = x<0?Math.PI/2:-Math.PI/2; rg.add(holo); }
      const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,0.5,8), accentMat); chair.position.set(0, -hh+0.25, hd-2.3); rg.add(chair);
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh+0.8, hd-1.2, 1.5, 0.7, action, 0x00aaff); break;
    }
    case 'observation': {
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.8,8), propMat); scope.position.set(0.5, -hh+0.6, -1); scope.rotation.z = 0.3; rg.add(scope);
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6), new THREE.MeshBasicMaterial({ color: 0x4444ff })); lens.position.set(0.5, -hh+0.8, -0.7); rg.add(lens);
      for (let i = 0; i < 3; i++) { const a = (i/3)*Math.PI*2; const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.6,4), accentMat); leg.position.set(0.5+Math.cos(a)*0.1, -hh+0.3, -1+Math.sin(a)*0.1); rg.add(leg); }
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2,0.1,0.4), propMat); bench.position.set(-1, -hh+0.3, hd-0.5); rg.add(bench);
      addInteractable(rg, clickablesRef, indicatorsRef, 0.5, -hh+0.8, -0.7, 0.6, 0.6, action, 0x4444ff); break;
    }
    case 'aquarium': {
      const tank = new THREE.Mesh(new THREE.BoxGeometry(2,1.2,0.8), new THREE.MeshBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.3, side: THREE.DoubleSide })); tank.position.set(0, -hh+0.8, hd-0.8); rg.add(tank);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.4,1), propMat); stand.position.set(0, -hh+0.2, hd-0.8); rg.add(stand);
      for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4), new THREE.MeshBasicMaterial({ color: [0xff8800,0x22cc44,0x4444ff,0xff4444][i] })); f.position.set(-0.5+i*0.3, -hh+0.8, hd-0.8); rg.add(f); }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh+0.8, hd-0.4, 1.5, 1, action, 0x00aaff); break;
    }
    case 'genetics': {
      const table = new THREE.Mesh(new THREE.BoxGeometry(2,0.8,0.6), propMat); table.position.set(0, -hh+0.4, hd-1.5); rg.add(table);
      for (let i = 0; i < 4; i++) { const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.3,8), new THREE.MeshBasicMaterial({ color: [0x22cc44,0x4444ff,0xff8800,0xff44ff][i], transparent: true, opacity: 0.5 })); tube.position.set(-0.5+i*0.3, -hh+0.95, hd-1.5); rg.add(tube); }
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1,0.5), new THREE.MeshBasicMaterial({ color: 0x004466, side: THREE.DoubleSide })); scr.position.set(0, -hh+1.2, hd-1.7); scr.rotation.x = -0.2; rg.add(scr);
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh+0.8, hd-1.2, 1.5, 0.7, action, 0x22cc44); break;
    }
    case 'lounge': {
      const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.5,0.4,0.8), propMat); sofa.position.set(0, -hh+0.2, hd-0.6); rg.add(sofa);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.5,0.6,0.2), accentMat); back.position.set(0, -hh+0.6, hd-0.9); rg.add(back);
      const table = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.05,0.5), propMat); table.position.set(0, -hh+0.15, 0.5); rg.add(table);
      break;
    }
    case 'storage': {
      for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.7), propMat); c.position.set(-1+(i%2)*1.2, -hh+0.35+Math.floor(i/2)*0.75, hd-0.6); rg.add(c); }
      break;
    }
    case 'cartography': {
      // Center table
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.5,0.5,12), propMat); table.position.set(0, -hh+0.25, 0); rg.add(table);
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.04,12), accentMat); tableTop.position.set(0, -hh+0.52, 0); rg.add(tableTop);
      // Warp gate wall display (south wall)
      const display = new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.8), new THREE.MeshBasicMaterial({ color: 0x003366, side: THREE.DoubleSide })); display.position.set(0, 0.3, hd-0.06); rg.add(display);
      const displayFrame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.5,0.8)), new THREE.LineBasicMaterial({ color: 0x004477 })); displayFrame.position.set(0, 0.3, hd-0.06); rg.add(displayFrame);
      // Holographic orrery
      const holo = room.hologramSystem;
      const holoY = -hh + 0.6;
      // Holo base disc
      const holoBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.02,16), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2 })); holoBase.position.set(0, holoY, 0); rg.add(holoBase);
      if (holo) {
        const seed = typeof holo.seed === 'string' ? holo.seed.split('').reduce((a,c)=>a+c.charCodeAt(0),0) : (holo.seed || 42);
        const starColor = new THREE.Color().setHSL((seed % 360) / 360, 0.7, 0.5);
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6), new THREE.MeshBasicMaterial({ color: starColor })); star.position.set(0, holoY+0.15, 0); rg.add(star);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6), new THREE.MeshBasicMaterial({ color: starColor, transparent: true, opacity: 0.15 })); glow.position.set(0, holoY+0.15, 0); rg.add(glow);
        const bodyCount = Math.min(holo.bodyCount || 4, 6);
        for (let i = 0; i < bodyCount; i++) {
          const r = 0.15 + i * 0.1;
          const orbitPts = []; for (let j = 0; j <= 32; j++) { const a = (j/32)*Math.PI*2; orbitPts.push(new THREE.Vector3(Math.cos(a)*r, holoY+0.15, Math.sin(a)*r)); }
          rg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: 0x004466, transparent: true, opacity: 0.3 })));
          const planet = new THREE.Mesh(new THREE.SphereGeometry(0.03,6,4), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.6 }));
          planet.position.set(Math.cos(i)*r, holoY+0.15, Math.sin(i)*r); rg.add(planet);
          holoRef.current.push({ mesh: planet, r, speed: 0.5/Math.sqrt(r), phase: (i/bodyCount)*Math.PI*2, y: holoY+0.15 });
        }
      } else {
        const empty = new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.15), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.15, side: THREE.DoubleSide })); empty.position.set(0, holoY+0.15, 0); empty.rotation.x = -0.5; rg.add(empty);
      }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh+0.5, 0, 0.8, 0.4, action, 0x00aaff); break;
    }
  }
}