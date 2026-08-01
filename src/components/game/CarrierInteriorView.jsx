// Carrier Interior View — 3D first-person exploration of fleet carrier rooms
// Reuses the cabin look-around + click interaction model for multi-room carrier exploration
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const W = 6, H = 3.5, D = 6;
const DW = 1.5, DH = 2.5;
const T = 0.1;

const INTERACT_ACTIONS = {
  observation: 'stargaze',
  command: 'transit',
  quarters: 'decorate',
  bar: 'drinks',
  garden: 'flora',
  trophy: 'records',
};

export default function CarrierInteriorView({ roomType, roomIndex, totalRooms, roomName, leftRoomName, rightRoomName, onNavigate, onInteract }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const roomRef = useRef(null);
  const clickablesRef = useRef([]);
  const indicatorsRef = useRef([]);
  const plantsRef = useRef([]);
  const starfieldRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const lookRef = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
  const animationIdRef = useRef(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const hasLeft = roomIndex > 0;
  const hasRight = roomIndex < totalRooms - 1;

  const executeAction = (action) => {
    if (action === 'left-door') onNavigate?.('left');
    else if (action === 'right-door') onNavigate?.('right');
    else onInteract?.(action);
  };

  // Scene init
  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 100);
    camera.position.set(0, 0, 0);
    camera.rotation.order = 'YXZ';

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    roomRef.current = roomGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const lk = lookRef.current;
      lk.yaw += (lk.targetYaw - lk.yaw) * 0.08;
      lk.pitch += (lk.targetPitch - lk.pitch) * 0.08;
      camera.rotation.y = lk.yaw + Math.sin(now * 0.001) * 0.003;
      camera.rotation.x = lk.pitch + Math.cos(now * 0.0013) * 0.002;

      for (const ind of indicatorsRef.current) {
        const pulse = 1 + Math.sin(now * 0.005 + ind.phase) * 0.3;
        ind.scale.set(pulse, pulse, pulse);
      }
      for (const p of plantsRef.current) {
        p.rotation.z = Math.sin(now * 0.001 + p.phase) * 0.05;
      }
      if (starfieldRef.current) starfieldRef.current.rotation.y = now * 0.00005;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
    if (!rg) return;
    while (rg.children.length > 0) {
      const child = rg.children[0];
      rg.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    clickablesRef.current = [];
    indicatorsRef.current = [];
    plantsRef.current = [];
    starfieldRef.current = null;
    lookRef.current = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 };

    const hw = W / 2, hh = H / 2, hd = D / 2;
    const wallMat = new THREE.MeshBasicMaterial({ color: 0x1a0d00 });
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x150800 });
    const ceilMat = new THREE.MeshBasicMaterial({ color: 0x0f0500 });
    const frameMat = new THREE.LineBasicMaterial({ color: 0x4a2a00 });
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const propMat = new THREE.MeshBasicMaterial({ color: 0x2a1500 });
    const accentMat = new THREE.MeshBasicMaterial({ color: 0x3a2510 });

    // Floor & ceiling
    const floor = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), floorMat); floor.position.set(0, -hh, 0); rg.add(floor);
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), ceilMat); ceil.position.set(0, hh, 0); rg.add(ceil);

    // Back wall
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), wallMat); back.position.set(0, 0, hd); rg.add(back);

    // Front wall
    if (roomType === 'observation') {
      buildWindowWall(rg, wallMat, frameMat, -hd, W, H, hh, 4, 2.5);
      buildStarfield(rg, -hd - 4, 0.5, starfieldRef);
    } else if (roomType === 'quarters') {
      buildWindowWall(rg, wallMat, frameMat, -hd, W, H, hh, 2.5, 1.5);
      buildStarfield(rg, -hd - 4, 0, starfieldRef);
    } else {
      const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), wallMat); front.position.set(0, 0, -hd); rg.add(front);
    }

    // Left wall
    if (hasLeft) {
      buildDoorWall(rg, wallMat, frameMat, doorMat, -hw, H, D, hh, 'left-door', clickablesRef, indicatorsRef, 0x00ff44);
    } else {
      const left = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat); left.position.set(-hw, 0, 0); rg.add(left);
    }

    // Right wall
    if (hasRight) {
      buildDoorWall(rg, wallMat, frameMat, doorMat, hw, H, D, hh, 'right-door', clickablesRef, indicatorsRef, 0xffaa00);
    } else {
      const right = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat); right.position.set(hw, 0, 0); rg.add(right);
    }

    // Room-specific props + interactable
    const action = INTERACT_ACTIONS[roomType];
    buildRoomProps(rg, roomType, clickablesRef, indicatorsRef, plantsRef, propMat, accentMat, action, hh, hd, hw);
  }, [roomType, roomIndex, totalRooms]);

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
      if (intersects.length > 0) {
        const action = intersects[0].object.userData.action;
        if (action === 'left-door' || action === 'right-door') setConfirmAction(action);
        else onInteract?.(action);
      }
    };

    const onPointerDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; dragStartX = e.clientX; dragStartY = e.clientY; };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      const lk = lookRef.current;
      lk.targetYaw = lk.targetYaw - dx * 0.003;
      lk.targetPitch = Math.max(-1.4, Math.min(1.4, lk.targetPitch - dy * 0.003));
    };
    const onPointerUp = (e) => {
      isDragging = false;
      if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < 5) handleClick(e.clientX, e.clientY);
    };
    const onTouchStart = (e) => { if (e.touches.length === 1) { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; dragStartX = lastX; dragStartY = lastY; } };
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        const lk = lookRef.current;
        lk.targetYaw = lk.targetYaw - dx * 0.003;
        lk.targetPitch = Math.max(-1.4, Math.min(1.4, lk.targetPitch - dy * 0.003));
      }
    };
    const onTouchEnd = (e) => {
      if (isDragging && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        if (Math.hypot(t.clientX - dragStartX, t.clientY - dragStartY) < 10) handleClick(t.clientX, t.clientY);
      }
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [roomType, onInteract]);

  const confirmLabel = confirmAction === 'left-door' ? (leftRoomName ? `Enter ${leftRoomName}?` : 'Previous Room?') : confirmAction === 'right-door' ? (rightRoomName ? `Enter ${rightRoomName}?` : 'Next Room?') : '';

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
      <div className="absolute top-1 left-1 text-[9px] text-orange-700 pointer-events-none">{roomName}</div>
      <div className="absolute top-1 right-1 text-[9px] space-y-0.5 pointer-events-none text-right">
        {hasLeft && <div className="text-green-600">● ← {leftRoomName}</div>}
        {hasRight && <div className="text-orange-500">● {rightRoomName} →</div>}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-orange-800 pointer-events-none">DRAG TO LOOK · TAP OBJECTS TO INTERACT</div>
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

// ===== Helper functions =====

function buildWindowWall(rg, wallMat, frameMat, z, w, h, hh, winW, winH) {
  const winY = 0;
  const topH = hh - (winY + winH / 2);
  if (topH > 0.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, topH, T), wallMat); m.position.set(0, winY + winH / 2 + topH / 2, z); rg.add(m); }
  const botH = winY - winH / 2 + hh;
  if (botH > 0.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, botH, T), wallMat); m.position.set(0, -hh + botH / 2, z); rg.add(m); }
  const sideW = w / 2 - winW / 2;
  if (sideW > 0.01) {
    const lm = new THREE.Mesh(new THREE.BoxGeometry(sideW, winH, T), wallMat); lm.position.set(-w / 2 + sideW / 2, winY, z); rg.add(lm);
    const rm = new THREE.Mesh(new THREE.BoxGeometry(sideW, winH, T), wallMat); rm.position.set(w / 2 - sideW / 2, winY, z); rg.add(rm);
  }
  const pts = [
    new THREE.Vector3(-winW / 2, winY - winH / 2, z), new THREE.Vector3(winW / 2, winY - winH / 2, z),
    new THREE.Vector3(winW / 2, winY - winH / 2, z), new THREE.Vector3(winW / 2, winY + winH / 2, z),
    new THREE.Vector3(winW / 2, winY + winH / 2, z), new THREE.Vector3(-winW / 2, winY + winH / 2, z),
    new THREE.Vector3(-winW / 2, winY + winH / 2, z), new THREE.Vector3(-winW / 2, winY - winH / 2, z),
  ];
  rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x224466 })));
}

function buildStarfield(rg, z, yOffset, starfieldRef) {
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 6 + Math.random() * 8;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = yOffset + r * Math.sin(phi) * Math.sin(theta) * 0.3;
    positions[i * 3 + 2] = z + r * Math.cos(phi);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(geom, new THREE.PointsMaterial({ color: 0xffaa66, size: 0.08 }));
  rg.add(stars);
  starfieldRef.current = stars;
}

function buildDoorWall(rg, wallMat, frameMat, doorMat, x, h, d, hh, action, clickablesRef, indicatorsRef, indColor) {
  const topH = h - DH;
  const top = new THREE.Mesh(new THREE.BoxGeometry(T, topH, d), wallMat); top.position.set(x, -hh + DH + topH / 2, 0); rg.add(top);
  const sideD = d / 2 - DW / 2;
  const front = new THREE.Mesh(new THREE.BoxGeometry(T, DH, sideD), wallMat); front.position.set(x, -hh + DH / 2, -d / 2 + sideD / 2); rg.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(T, DH, sideD), wallMat); back.position.set(x, -hh + DH / 2, d / 2 - sideD / 2); rg.add(back);
  const pts = [
    new THREE.Vector3(x, -hh, -DW / 2), new THREE.Vector3(x, -hh + DH, -DW / 2),
    new THREE.Vector3(x, -hh, DW / 2), new THREE.Vector3(x, -hh + DH, DW / 2),
    new THREE.Vector3(x, -hh + DH, -DW / 2), new THREE.Vector3(x, -hh + DH, DW / 2),
  ];
  rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), frameMat));
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), doorMat);
  plane.position.set(x, -hh + DH / 2, 0);
  plane.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
  plane.userData.action = action;
  rg.add(plane);
  clickablesRef.current.push(plane);
  const ind = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: indColor }));
  ind.position.set(x + (x < 0 ? 0.06 : -0.06), -hh + DH + 0.2, 0);
  ind.phase = Math.random() * Math.PI * 2;
  rg.add(ind);
  indicatorsRef.current.push(ind);
}

function addInteractable(rg, clickablesRef, indicatorsRef, x, y, z, w, h, action, color) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
  plane.position.set(x, y, z);
  plane.userData.action = action;
  rg.add(plane);
  clickablesRef.current.push(plane);
  const ind = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: color || 0x00aaff }));
  ind.position.set(x, y + h / 2 + 0.2, z);
  ind.phase = Math.random() * Math.PI * 2;
  rg.add(ind);
  indicatorsRef.current.push(ind);
}

function buildRoomProps(rg, roomType, clickablesRef, indicatorsRef, plantsRef, propMat, accentMat, action, hh, hd, hw) {
  switch (roomType) {
    case 'bar': {
      // Counter against back wall
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3, 0.9, 0.6), propMat);
      counter.position.set(0, -hh + 0.45, hd - 0.5);
      rg.add(counter);
      // Bottles behind counter
      for (let i = 0; i < 6; i++) {
        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6), new THREE.MeshBasicMaterial({ color: [0x8B4513, 0xff8800, 0x22cc44, 0x4444ff, 0xff4444, 0xffaa00][i] }));
        bottle.position.set(-1 + i * 0.4, -hh + 1.1, hd - 0.55);
        rg.add(bottle);
      }
      // Stools
      for (let i = 0; i < 3; i++) {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8), accentMat);
        stool.position.set(-0.8 + i * 0.8, -hh + 0.25, hd - 1.5);
        rg.add(stool);
      }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh + 0.9, hd - 0.8, 2, 0.8, action, 0xff8800);
      break;
    }
    case 'quarters': {
      // Bed
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1), propMat);
      bedFrame.position.set(-1.5, -hh + 0.1, hd - 0.6);
      rg.add(bedFrame);
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.9), accentMat);
      mattress.position.set(-1.5, -hh + 0.26, hd - 0.6);
      rg.add(mattress);
      // Shelf (interactable)
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.3), propMat);
      shelf.position.set(1.5, 0, hd - 0.2);
      rg.add(shelf);
      addInteractable(rg, clickablesRef, indicatorsRef, 1.5, 0.3, hd - 0.2, 1.2, 0.5, action, 0x00aaff);
      break;
    }
    case 'garden': {
      // Plant beds
      for (let i = 0; i < 3; i++) {
        const bed = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.8), propMat);
        bed.position.set(-1.5 + i * 1.5, -hh + 0.15, 0);
        rg.add(bed);
        // Plants
        for (let j = 0; j < 3; j++) {
          const colors = [0x22cc44, 0x44ff66, 0x88ff00, 0x00cc88, 0x66dd44];
          const plant = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 6), new THREE.MeshBasicMaterial({ color: colors[(i + j) % colors.length] }));
          plant.position.set(-1.5 + i * 1.5 - 0.3 + j * 0.3, -hh + 0.55, -0.2 + j * 0.2);
          plant.phase = Math.random() * Math.PI * 2;
          rg.add(plant);
          plantsRef.current.push(plant);
        }
      }
      // Grow lights
      for (let i = 0; i < 2; i++) {
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshBasicMaterial({ color: 0x44ff44 }));
        light.position.set(-0.75 + i * 1.5, hh - 0.2, 0);
        rg.add(light);
      }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh + 0.3, 0, 2, 0.4, action, 0x44ff44);
      break;
    }
    case 'trophy': {
      // Display cases
      for (let i = 0; i < 3; i++) {
        const x = -1.5 + i * 1.5;
        const caseBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.4), new THREE.MeshBasicMaterial({ color: 0x332200, transparent: true, opacity: 0.3 }));
        caseBox.position.set(x, -hh + 0.6, hd - 0.3);
        rg.add(caseBox);
        // Trophy inside
        const trophy = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 6), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        trophy.position.set(x, -hh + 0.5, hd - 0.3);
        rg.add(trophy);
        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), propMat);
        base.position.set(x, -hh + 0.15, hd - 0.3);
        rg.add(base);
      }
      addInteractable(rg, clickablesRef, indicatorsRef, 0, 0, hd - 0.3, 2, 1, action, 0xffaa00);
      break;
    }
    case 'command': {
      // Console
      const console = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.6), propMat);
      console.position.set(0, -hh + 0.4, hd - 1.5);
      rg.add(console);
      // Console top (slanted screen)
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ color: 0x004466, side: THREE.DoubleSide }));
      screen.position.set(0, -hh + 0.9, hd - 1.7);
      screen.rotation.x = -0.3;
      rg.add(screen);
      // Holographic displays on side walls
      for (const x of [-hw + 0.06, hw - 0.06]) {
        const holo = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.6), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2, side: THREE.DoubleSide }));
        holo.position.set(x, 0.3, 0);
        holo.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        rg.add(holo);
      }
      // Chair
      const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8), accentMat);
      chair.position.set(0, -hh + 0.25, hd - 2.3);
      rg.add(chair);
      addInteractable(rg, clickablesRef, indicatorsRef, 0, -hh + 0.8, hd - 1.2, 1.5, 0.7, action, 0x00aaff);
      break;
    }
    case 'observation': {
      // Telescope
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8), propMat);
      scope.position.set(0.5, -hh + 0.6, -1);
      scope.rotation.z = 0.3;
      rg.add(scope);
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0x4444ff }));
      lens.position.set(0.5, -hh + 0.8, -0.7);
      rg.add(lens);
      // Tripod
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), accentMat);
        leg.position.set(0.5 + Math.cos(angle) * 0.1, -hh + 0.3, -1 + Math.sin(angle) * 0.1);
        rg.add(leg);
      }
      // Bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.4), propMat);
      bench.position.set(-1, -hh + 0.3, hd - 0.5);
      rg.add(bench);
      addInteractable(rg, clickablesRef, indicatorsRef, 0.5, -hh + 0.8, -0.7, 0.6, 0.6, action, 0x4444ff);
      break;
    }
  }
}