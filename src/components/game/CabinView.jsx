// Cabin View — first-person interior view of player living quarters
// Solid room with window (mini orrery), bed, doors, shelves, and placed trinkets
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { COCKPIT_PART_MAP } from '@/lib/cockpitParts';
import { getCabinConfig, genCabinSlots, getWindowConfig, DOOR_W, DOOR_H, createCabinTexture } from '@/lib/cabinConfig';

export default function CabinView({ target = 'ship', targetId = null, room = 0, onNavigate, onExitGame, onRoomChange, decorationOverride = null }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const roomRef = useRef(null);
  const orreryRef = useRef(null);
  const trinketsRef = useRef(null);
  const clickablesRef = useRef([]);
  const planetMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const lookRef = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
  const animationIdRef = useRef(null);

  const { state, getSystemData } = useGameState();

  const shipClass = target === 'ship'
    ? (SHIP_MAP[state.ship.type]?.class || (state.ship.type === 'custom' ? 2 : 1))
    : target === 'carrier' ? 'carrier' : 'station';
  const config = getCabinConfig(shipClass);

  const savedDecor = target === 'ship'
    ? state.ship.cockpitDecoration || { parts: {} }
    : target === 'carrier'
      ? state.fleetCarriers.find(c => c.id === targetId)?.cockpitDecoration || { parts: {} }
      : state.ownedStations.find(s => s.id === targetId)?.decoration || { parts: {} };
  const decoration = decorationOverride || savedDecor;
  const systemData = getSystemData();

  const leftDoorLabel = room === 0 ? 'PREV SCREEN' : 'PREV ROOM';
  const rightDoorLabel = (room === 0 && config.rooms > 1) ? 'NEXT ROOM' : 'EXIT GAME';

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

    const orreryGroup = new THREE.Group();
    scene.add(orreryGroup);
    orreryRef.current = orreryGroup;

    const trinketsGroup = new THREE.Group();
    scene.add(trinketsGroup);
    trinketsRef.current = trinketsGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const t = now * 0.0005;
      const lk = lookRef.current;
      lk.yaw += (lk.targetYaw - lk.yaw) * 0.08;
      lk.pitch += (lk.targetPitch - lk.pitch) * 0.08;
      camera.rotation.y = lk.yaw + Math.sin(now * 0.001) * 0.003;
      camera.rotation.x = lk.pitch + Math.cos(now * 0.0013) * 0.002;

      for (const p of planetMeshesRef.current) {
        const angle = t + p.phase;
        p.mesh.position.set(Math.cos(angle) * p.orbitR, p.y, p.z + Math.sin(angle) * p.orbitR);
      }

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

  // Build room geometry
  useEffect(() => {
    const rg = roomRef.current;
    if (!rg || !config) return;
    while (rg.children.length > 0) {
      const child = rg.children[0];
      rg.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    clickablesRef.current = [];

    const { width, height, depth } = config;
    const hw = width / 2, hh = height / 2, hd = depth / 2;
    const t = 0.1;
    let wallMat = getSurfaceMaterial(decoration, room, 'wallBack', [26, 13, 0]);
    const floorMat = getSurfaceMaterial(decoration, room, 'floor', [21, 8, 0]);
    const ceilMat = getSurfaceMaterial(decoration, room, 'ceiling', [15, 5, 0]);
    const frameMat = new THREE.LineBasicMaterial({ color: 0x4a2a00 });
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x001122, transparent: true, opacity: 0.1, side: THREE.DoubleSide });

    // Floor & ceiling
    const floor = new THREE.Mesh(new THREE.BoxGeometry(width, t, depth), floorMat);
    floor.position.set(0, -hh, 0);
    rg.add(floor);
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(width, t, depth), ceilMat);
    ceil.position.set(0, hh, 0);
    rg.add(ceil);

    // Back wall (solid)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, t), wallMat);
    backWall.position.set(0, 0, hd);
    rg.add(backWall);

    // Front wall
    wallMat = getSurfaceMaterial(decoration, room, 'wallFront', [26, 13, 0]);
    if (room === 0) {
      const win = getWindowConfig(width, height);
      const topH = hh - (win.y + win.h / 2);
      if (topH > 0.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(width, topH, t), wallMat); m.position.set(0, win.y + win.h / 2 + topH / 2, -hd); rg.add(m); }
      const botH = win.y - win.h / 2 + hh;
      if (botH > 0.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(width, botH, t), wallMat); m.position.set(0, -hh + botH / 2, -hd); rg.add(m); }
      const sideW = hw - win.w / 2;
      if (sideW > 0.01) {
        const lm = new THREE.Mesh(new THREE.BoxGeometry(sideW, win.h, t), wallMat); lm.position.set(-hw + sideW / 2, win.y, -hd); rg.add(lm);
        const rm = new THREE.Mesh(new THREE.BoxGeometry(sideW, win.h, t), wallMat); rm.position.set(hw - sideW / 2, win.y, -hd); rg.add(rm);
      }
      // Window frame
      const wfPts = [
        new THREE.Vector3(-win.w / 2, win.y - win.h / 2, -hd), new THREE.Vector3(win.w / 2, win.y - win.h / 2, -hd),
        new THREE.Vector3(win.w / 2, win.y - win.h / 2, -hd), new THREE.Vector3(win.w / 2, win.y + win.h / 2, -hd),
        new THREE.Vector3(win.w / 2, win.y + win.h / 2, -hd), new THREE.Vector3(-win.w / 2, win.y + win.h / 2, -hd),
        new THREE.Vector3(-win.w / 2, win.y + win.h / 2, -hd), new THREE.Vector3(-win.w / 2, win.y - win.h / 2, -hd),
      ];
      rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wfPts), new THREE.LineBasicMaterial({ color: 0x224466 })));
      // Window click target
      const winPlane = new THREE.Mesh(new THREE.PlaneGeometry(win.w, win.h), windowMat);
      winPlane.position.set(0, win.y, -hd);
      winPlane.userData.action = 'window';
      rg.add(winPlane);
      clickablesRef.current.push(winPlane);
      // Window indicator
      const ind = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0x00aaff }));
      ind.position.set(0, win.y + win.h / 2 + 0.15, -hd);
      rg.add(ind);
    } else {
      const front = new THREE.Mesh(new THREE.BoxGeometry(width, height, t), wallMat);
      front.position.set(0, 0, -hd);
      rg.add(front);
    }

    // Left wall with door
    wallMat = getSurfaceMaterial(decoration, room, 'wallLeft', [26, 13, 0]);
    const lTopH = height - DOOR_H;
    const lTop = new THREE.Mesh(new THREE.BoxGeometry(t, lTopH, depth), wallMat); lTop.position.set(-hw, -hh + DOOR_H + lTopH / 2, 0); rg.add(lTop);
    const lSideW = depth / 2 - DOOR_W / 2;
    const lFront = new THREE.Mesh(new THREE.BoxGeometry(t, DOOR_H, lSideW), wallMat); lFront.position.set(-hw, -hh + DOOR_H / 2, -hd + lSideW / 2); rg.add(lFront);
    const lBack = new THREE.Mesh(new THREE.BoxGeometry(t, DOOR_H, lSideW), wallMat); lBack.position.set(-hw, -hh + DOOR_H / 2, hd - lSideW / 2); rg.add(lBack);
    // Left door frame + click target
    const ldPts = [
      new THREE.Vector3(-hw, -hh, -DOOR_W / 2), new THREE.Vector3(-hw, -hh + DOOR_H, -DOOR_W / 2),
      new THREE.Vector3(-hw, -hh, DOOR_W / 2), new THREE.Vector3(-hw, -hh + DOOR_H, DOOR_W / 2),
      new THREE.Vector3(-hw, -hh + DOOR_H, -DOOR_W / 2), new THREE.Vector3(-hw, -hh + DOOR_H, DOOR_W / 2),
    ];
    rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ldPts), frameMat));
    const ldPlane = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, DOOR_H), doorMat);
    ldPlane.position.set(-hw, -hh + DOOR_H / 2, 0);
    ldPlane.rotation.y = Math.PI / 2;
    ldPlane.userData.action = 'left-door';
    rg.add(ldPlane);
    clickablesRef.current.push(ldPlane);
    const lIndColor = room === 0 ? 0x00ff44 : 0xffaa00;
    const lInd = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: lIndColor }));
    lInd.position.set(-hw + 0.05, -hh + DOOR_H + 0.15, 0);
    rg.add(lInd);

    // Right wall with door
    wallMat = getSurfaceMaterial(decoration, room, 'wallRight', [26, 13, 0]);
    const rTop = new THREE.Mesh(new THREE.BoxGeometry(t, lTopH, depth), wallMat); rTop.position.set(hw, -hh + DOOR_H + lTopH / 2, 0); rg.add(rTop);
    const rFront = new THREE.Mesh(new THREE.BoxGeometry(t, DOOR_H, lSideW), wallMat); rFront.position.set(hw, -hh + DOOR_H / 2, -hd + lSideW / 2); rg.add(rFront);
    const rBack = new THREE.Mesh(new THREE.BoxGeometry(t, DOOR_H, lSideW), wallMat); rBack.position.set(hw, -hh + DOOR_H / 2, hd - lSideW / 2); rg.add(rBack);
    const rdPts = [
      new THREE.Vector3(hw, -hh, -DOOR_W / 2), new THREE.Vector3(hw, -hh + DOOR_H, -DOOR_W / 2),
      new THREE.Vector3(hw, -hh, DOOR_W / 2), new THREE.Vector3(hw, -hh + DOOR_H, DOOR_W / 2),
      new THREE.Vector3(hw, -hh + DOOR_H, -DOOR_W / 2), new THREE.Vector3(hw, -hh + DOOR_H, DOOR_W / 2),
    ];
    rg.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rdPts), frameMat));
    const rdPlane = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, DOOR_H), doorMat);
    rdPlane.position.set(hw, -hh + DOOR_H / 2, 0);
    rdPlane.rotation.y = -Math.PI / 2;
    rdPlane.userData.action = 'right-door';
    rg.add(rdPlane);
    clickablesRef.current.push(rdPlane);
    const rIndColor = (room === 0 && config.rooms > 1) ? 0xffaa00 : 0xff0000;
    const rInd = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: rIndColor }));
    rInd.position.set(hw - 0.05, -hh + DOOR_H + 0.15, 0);
    rg.add(rInd);

    // Bed (room 0 only)
    if (room === 0) {
      const bedW = Math.min(width * 0.4, 1.6);
      const bedD = 0.8;
      const bedY = -hh + 0.25;
      const bedZ = hd - 0.4;
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(bedW + 0.1, 0.15, bedD + 0.1), new THREE.MeshBasicMaterial({ color: 0x2a1500 }));
      bedFrame.position.set(0, bedY - 0.05, bedZ);
      rg.add(bedFrame);
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(bedW, 0.1, bedD), new THREE.MeshBasicMaterial({ color: 0x3a2510 }));
      mattress.position.set(0, bedY + 0.02, bedZ);
      rg.add(mattress);
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(bedW * 0.4, 0.06, 0.2), new THREE.MeshBasicMaterial({ color: 0x4a3520 }));
      pillow.position.set(0, bedY + 0.1, bedZ - bedD / 2 + 0.15);
      rg.add(pillow);
    }

    // Shelves
    const slots = genCabinSlots(config, room);
    const shelfMat = new THREE.MeshBasicMaterial({ color: 0x2a1500 });
    for (const slot of slots) {
      if (slot.wall === 'floor') {
        const table = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.35), shelfMat);
        table.position.set(slot.pos[0], slot.pos[1] + 0.2, slot.pos[2]);
        rg.add(table);
        for (const [lx, lz] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.03), shelfMat);
          leg.position.set(slot.pos[0] + lx, slot.pos[1], slot.pos[2] + lz);
          rg.add(leg);
        }
      } else {
        const [x, y, z] = slot.pos;
        let geom, px, py, pz;
        if (slot.wall === 'left') { geom = new THREE.BoxGeometry(0.15, 0.02, 0.25); px = x + 0.06; py = y - 0.06; pz = z; }
        else if (slot.wall === 'right') { geom = new THREE.BoxGeometry(0.15, 0.02, 0.25); px = x - 0.06; py = y - 0.06; pz = z; }
        else if (slot.wall === 'back') { geom = new THREE.BoxGeometry(0.25, 0.02, 0.15); px = x; py = y - 0.06; pz = z + 0.06; }
        else { geom = new THREE.BoxGeometry(0.25, 0.02, 0.15); px = x; py = y - 0.06; pz = z - 0.06; }
        const shelf = new THREE.Mesh(geom, shelfMat);
        shelf.position.set(px, py, pz);
        rg.add(shelf);
      }
    }
  }, [config, room, decoration]);

  // Build mini orrery (room 0 only)
  useEffect(() => {
    const og = orreryRef.current;
    if (!og || !config) return;
    while (og.children.length > 0) {
      const child = og.children[0];
      og.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    planetMeshesRef.current = [];
    if (room !== 0) return;

    const { width, height, depth } = config;
    const win = getWindowConfig(width, height);
    const oz = -depth / 2 - 3;

    // Starfield
    const starCount = 300;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 6;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = win.y + r * Math.sin(phi) * Math.sin(theta) * 0.3;
      positions[i * 3 + 2] = oz + r * Math.cos(phi);
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    og.add(new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffaa66, size: 0.06 })));

    if (!systemData?.bodies) return;

    // Star
    const star = systemData.bodies.find(b => b.type === 'star');
    if (star) {
      const sc = new THREE.Color(star.color);
      const sm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: sc }));
      sm.position.set(0, win.y, oz);
      og.add(sm);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: sc, transparent: true, opacity: 0.15 }));
      glow.position.set(0, win.y, oz);
      og.add(glow);
    }

    // Planets
    const planets = systemData.bodies.filter(b => b.type === 'planet' || b.type === 'moon').slice(0, 6);
    planets.forEach((planet, i) => {
      const pc = new THREE.Color(planet.color || '#886644');
      const orbitR = 0.4 + i * 0.35;
      const orbitPts = [];
      for (let j = 0; j <= 32; j++) {
        const a = (j / 32) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a) * orbitR, win.y, oz + Math.sin(a) * orbitR));
      }
      og.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: 0x332200, transparent: true, opacity: 0.4 })));
      const pm = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (planet.radius || 1) * 0.015, 6, 4), new THREE.MeshBasicMaterial({ color: pc, wireframe: true }));
      og.add(pm);
      planetMeshesRef.current.push({ mesh: pm, orbitR, phase: Math.random() * Math.PI * 2, y: win.y, z: oz });
    });
  }, [systemData, config, room]);

  // Build trinkets
  useEffect(() => {
    const tg = trinketsRef.current;
    if (!tg || !config) return;
    while (tg.children.length > 0) {
      const child = tg.children[0];
      tg.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    const slots = genCabinSlots(config, room);
    const roomKey = room === 0 ? 'parts' : 'room1Parts';
    const parts = decoration?.[roomKey] || {};
    const mat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    for (const slot of slots) {
      const partRef = parts[slot.id];
      if (!partRef?.partId) continue;
      const part = COCKPIT_PART_MAP[partRef.partId];
      if (!part) continue;
      const geom = createTrinketGeometry(part.shape);
      const mesh = new THREE.Mesh(geom, mat.clone());
      const offset = partRef.position || [0, 0, 0];
      mesh.position.set(slot.pos[0] + offset[0], slot.pos[1] + offset[1], slot.pos[2] + offset[2]);
      mesh.scale.setScalar(partRef.scale || 1);
      const rot = partRef.rotation || [0, 0, 0];
      mesh.rotation.set(rot[0] * Math.PI / 180, rot[1] * Math.PI / 180, rot[2] * Math.PI / 180);
      tg.add(mesh);
    }
  }, [decoration, config, room]);

  // Interaction: look-around + click doors/window
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let dragStartX = 0, dragStartY = 0;

    const handleAction = (action) => {
      if (action === 'window') { onNavigate?.('system'); }
      else if (action === 'left-door') {
        if (room === 0) onNavigate?.('ship');
        else onRoomChange?.(0);
      } else if (action === 'right-door') {
        if (room === 0 && config.rooms > 1) onRoomChange?.(1);
        else onExitGame?.();
      }
    };

    const handleClick = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(clickablesRef.current, false);
      if (intersects.length > 0) handleAction(intersects[0].object.userData.action);
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
  }, [room, config, onNavigate, onExitGame, onRoomChange]);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
      <div className="absolute top-1 left-1 text-[9px] text-orange-700 pointer-events-none">DRAG TO LOOK · TAP DOORS/WINDOW TO INTERACT</div>
      <div className="absolute top-1 right-1 text-[9px] space-y-0.5 pointer-events-none text-right">
        <div className="flex items-center gap-1 justify-end text-cyan-600"><span>●</span> WINDOW → ORRERY</div>
        <div className="flex items-center gap-1 justify-end text-green-600"><span>●</span> ← {leftDoorLabel}</div>
        <div className="flex items-center gap-1 justify-end" style={{ color: rightDoorLabel === 'EXIT GAME' ? '#ff4444' : '#ffaa00' }}><span>●</span> {rightDoorLabel} →</div>
      </div>
      <div className="absolute bottom-1 left-1 text-[9px] text-orange-700 pointer-events-none">{config.name}{config.rooms > 1 ? ` · ROOM ${room + 1}/${config.rooms}` : ''}</div>
    </div>
  );
}

function getSurfaceMaterial(decoration, room, surfaceName, defaultRgb) {
  const surfaceConfig = decoration?.surfaces?.[room]?.[surfaceName];
  const rgb = surfaceConfig?.rgb || defaultRgb;
  const textureType = surfaceConfig?.texture || 'solid';
  if (textureType === 'solid') {
    return new THREE.MeshBasicMaterial({ color: new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255) });
  }
  const texture = createCabinTexture(textureType, rgb);
  return new THREE.MeshBasicMaterial({ map: texture });
}

function createTrinketGeometry(shape) {
  switch (shape) {
    case 'cone': return new THREE.ConeGeometry(0.12, 0.3, 6);
    case 'box': return new THREE.BoxGeometry(0.2, 0.2, 0.2);
    case 'cylinder': return new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8);
    case 'sphere': return new THREE.SphereGeometry(0.1, 8, 6);
    case 'wedge': return new THREE.CylinderGeometry(0.02, 0.15, 0.3, 4);
    case 'octagon': return new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8);
    case 'octahedron': return new THREE.OctahedronGeometry(0.12, 0);
    case 'tetrahedron': return new THREE.TetrahedronGeometry(0.15, 0);
    case 'torus': return new THREE.TorusGeometry(0.08, 0.03, 6, 12);
    default: return new THREE.BoxGeometry(0.2, 0.2, 0.2);
  }
}