// Cabin Builder 3D — third-person orbit view for placing trinkets on slots
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { COCKPIT_PART_MAP } from '@/lib/cockpitParts';
import { genCabinSlots, getWindowConfig, DOOR_W, DOOR_H } from '@/lib/cabinConfig';

export default function CabinBuilder3D({ design, config, room, selectedSlot, onSelectSlot }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const groupRef = useRef(null);
  const frameRef = useRef(null);
  const meshesRef = useRef([]);
  const slotMarkersRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const animationIdRef = useRef(null);
  const rotRef = useRef({ azimuth: Math.PI / 4, polar: Math.PI / 2.5, distance: 8, targetDistance: 8 });

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.01, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const frameGroup = new THREE.Group();
    scene.add(frameGroup);
    frameRef.current = frameGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const rs = rotRef.current;
      rs.distance += (rs.targetDistance - rs.distance) * 0.1;
      const x = rs.distance * Math.sin(rs.polar) * Math.cos(rs.azimuth);
      const y = rs.distance * Math.cos(rs.polar);
      const z = rs.distance * Math.sin(rs.polar) * Math.sin(rs.azimuth);
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
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

  // Build room wireframe + slot markers
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !config) return;
    while (frame.children.length > 0) {
      const child = frame.children[0];
      frame.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    slotMarkersRef.current = [];

    const { width, height, depth } = config;
    const hw = width / 2, hh = height / 2, hd = depth / 2;
    const lineMat = new THREE.LineBasicMaterial({ color: 0x553300, transparent: true, opacity: 0.6 });

    // Room box edges
    const boxPts = [
      [-hw,-hh,-hd],[hw,-hh,-hd], [hw,-hh,-hd],[hw,-hh,hd], [hw,-hh,hd],[-hw,-hh,hd], [-hw,-hh,-hd],[-hw,-hh,-hd],
      [-hw,hh,-hd],[hw,hh,-hd], [hw,hh,-hd],[hw,hh,hd], [hw,hh,hd],[-hw,hh,hd], [-hw,hh,hd],[-hw,hh,-hd],
      [-hw,-hh,-hd],[-hw,hh,-hd], [hw,-hh,-hd],[hw,hh,-hd], [hw,-hh,hd],[hw,hh,hd], [-hw,-hh,hd],[-hw,hh,hd],
    ].filter((_, i) => i % 2 === 0 || true);
    // Build pairs properly
    const edges = [
      [-hw,-hh,-hd],[hw,-hh,-hd], [hw,-hh,-hd],[hw,-hh,hd], [hw,-hh,hd],[-hw,-hh,hd], [-hw,-hh,hd],[-hw,-hh,-hd],
      [-hw,hh,-hd],[hw,hh,-hd], [hw,hh,-hd],[hw,hh,hd], [hw,hh,hd],[-hw,hh,hd], [-hw,hh,hd],[-hw,hh,-hd],
      [-hw,-hh,-hd],[-hw,hh,-hd], [hw,-hh,-hd],[hw,hh,-hd], [hw,-hh,hd],[hw,hh,hd], [-hw,-hh,hd],[-hw,hh,hd],
    ];
    const boxGeom = new THREE.BufferGeometry().setFromPoints(edges.map(p => new THREE.Vector3(...p)));
    frame.add(new THREE.LineSegments(boxGeom, lineMat));

    // Window outline (room 0)
    if (room === 0) {
      const win = getWindowConfig(width, height);
      const wfPts = [
        new THREE.Vector3(-win.w/2, win.y-win.h/2, -hd), new THREE.Vector3(win.w/2, win.y-win.h/2, -hd),
        new THREE.Vector3(win.w/2, win.y-win.h/2, -hd), new THREE.Vector3(win.w/2, win.y+win.h/2, -hd),
        new THREE.Vector3(win.w/2, win.y+win.h/2, -hd), new THREE.Vector3(-win.w/2, win.y+win.h/2, -hd),
        new THREE.Vector3(-win.w/2, win.y+win.h/2, -hd), new THREE.Vector3(-win.w/2, win.y-win.h/2, -hd),
      ];
      frame.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wfPts), new THREE.LineBasicMaterial({ color: 0x224466 })));
    }

    // Door outlines (both walls)
    const doorMat = new THREE.LineBasicMaterial({ color: 0x4a2a00 });
    for (const xSign of [-1, 1]) {
      const dx = xSign * hw;
      const dp = [
        new THREE.Vector3(dx, -hh, -DOOR_W/2), new THREE.Vector3(dx, -hh+DOOR_H, -DOOR_W/2),
        new THREE.Vector3(dx, -hh, DOOR_W/2), new THREE.Vector3(dx, -hh+DOOR_H, DOOR_W/2),
        new THREE.Vector3(dx, -hh+DOOR_H, -DOOR_W/2), new THREE.Vector3(dx, -hh+DOOR_H, DOOR_W/2),
      ];
      frame.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(dp), doorMat));
    }

    // Bed outline (room 0)
    if (room === 0) {
      const bedW = Math.min(width * 0.4, 1.6);
      const bedZ = hd - 0.4;
      const bedY = -hh + 0.25;
      const bp = [
        new THREE.Vector3(-bedW/2, bedY, bedZ-0.4), new THREE.Vector3(bedW/2, bedY, bedZ-0.4),
        new THREE.Vector3(bedW/2, bedY, bedZ-0.4), new THREE.Vector3(bedW/2, bedY, bedZ+0.4),
        new THREE.Vector3(bedW/2, bedY, bedZ+0.4), new THREE.Vector3(-bedW/2, bedY, bedZ+0.4),
        new THREE.Vector3(-bedW/2, bedY, bedZ+0.4), new THREE.Vector3(-bedW/2, bedY, bedZ-0.4),
      ];
      frame.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(bp), new THREE.LineBasicMaterial({ color: 0x664400 })));
    }

    // Slot markers
    const slots = genCabinSlots(config, room);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x442200, wireframe: true, transparent: true, opacity: 0.5 });
    const selMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.9 });
    for (const slot of slots) {
      const isSel = slot.id === selectedSlot;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), isSel ? selMat : markerMat);
      m.position.set(...slot.pos);
      m.userData.slot = slot.id;
      frame.add(m);
      slotMarkersRef.current.push(m);
    }

    // Adjust camera distance based on room size
    rotRef.current.targetDistance = Math.max(width, depth) * 1.2;
  }, [config, room, selectedSlot]);

  // Build trinket meshes
  useEffect(() => {
    const group = groupRef.current;
    if (!group || !config) return;
    for (const m of meshesRef.current) {
      if (m) { group.remove(m); m.geometry.dispose(); m.material.dispose(); }
    }
    meshesRef.current = [];

    const slots = genCabinSlots(config, room);
    const roomKey = room === 0 ? 'parts' : 'room1Parts';
    const parts = design?.[roomKey] || {};
    const baseMat = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
    const selMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });

    for (const slot of slots) {
      const partRef = parts[slot.id];
      if (!partRef?.partId) continue;
      const part = COCKPIT_PART_MAP[partRef.partId];
      if (!part) continue;
      const geom = createTrinketGeometry(part.shape);
      const mat = (slot.id === selectedSlot ? selMat : baseMat).clone();
      const mesh = new THREE.Mesh(geom, mat);
      const offset = partRef.position || [0, 0, 0];
      mesh.position.set(slot.pos[0] + offset[0], slot.pos[1] + offset[1], slot.pos[2] + offset[2]);
      mesh.scale.setScalar(partRef.scale || 1);
      const rot = partRef.rotation || [0, 0, 0];
      mesh.rotation.set(rot[0] * Math.PI / 180, rot[1] * Math.PI / 180, rot[2] * Math.PI / 180);
      mesh.userData.slot = slot.id;
      group.add(mesh);
      meshesRef.current.push(mesh);
    }
  }, [design, config, room, selectedSlot]);

  // Interaction
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let dragStartX = 0, dragStartY = 0;
    let pinchDist = 0;

    const handleClick = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      raycasterRef.current.params.Points.threshold = 0.15;
      const markers = slotMarkersRef.current.filter(m => m);
      const meshes = meshesRef.current.filter(m => m);
      const intersects = raycasterRef.current.intersectObjects([...markers, ...meshes], false);
      if (intersects.length > 0 && onSelectSlot) onSelectSlot(intersects[0].object.userData.slot);
    };

    const onPointerDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; dragStartX = e.clientX; dragStartY = e.clientY; };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      const rs = rotRef.current;
      rs.azimuth -= dx * 0.008;
      rs.polar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.polar - dy * 0.008));
    };
    const onPointerUp = (e) => {
      isDragging = false;
      if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < 5) handleClick(e.clientX, e.clientY);
    };
    const onWheel = (e) => { e.preventDefault(); rotRef.current.targetDistance = Math.max(2, Math.min(20, rotRef.current.targetDistance + e.deltaY * 0.01)); };
    const onTouchStart = (e) => {
      if (e.touches.length === 2) { isDragging = false; pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
      else if (e.touches.length === 1) { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; dragStartX = lastX; dragStartY = lastY; }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const delta = pinchDist - newDist; pinchDist = newDist;
        rotRef.current.targetDistance = Math.max(2, Math.min(20, rotRef.current.targetDistance + delta * 0.05));
      } else if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        const rs = rotRef.current;
        rs.azimuth -= dx * 0.008;
        rs.polar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.polar - dy * 0.008));
      }
    };
    const onTouchEnd = (e) => {
      if (isDragging && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        if (Math.hypot(t.clientX - dragStartX, t.clientY - dragStartY) < 10) handleClick(t.clientX, t.clientY);
      }
      isDragging = false; pinchDist = 0;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSelectSlot]);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
      <div className="absolute top-1 left-1 text-[9px] text-orange-700 pointer-events-none">DRAG TO ROTATE · TAP SLOT/ITEM TO SELECT</div>
    </div>
  );
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