// 3D Ship Builder — wireframe preview with drag-rotate and part selection
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SHIP_SLOTS, SHIP_PART_MAP } from '@/lib/shipParts';

export default function ShipBuilder3D({ design, selectedSlot, onSelectSlot }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const groupRef = useRef(null);
  const meshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const animationIdRef = useRef(null);
  const rotRef = useRef({ azimuth: Math.PI / 4, polar: Math.PI / 3, distance: 6, targetDistance: 6 });

  // Init Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const grid = new THREE.GridHelper(10, 10, 0x221100, 0x110800);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

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

  // Pointer + touch interaction
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
      const meshes = meshesRef.current.filter(m => m);
      const intersects = raycasterRef.current.intersectObjects(meshes, false);
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

  // Build/update meshes from design
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    for (const m of meshesRef.current) {
      if (m) { group.remove(m); m.geometry.dispose(); m.material.dispose(); }
    }
    meshesRef.current = [];

    const baseMat = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
    const selMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });

    for (const slot of SHIP_SLOTS) {
      const partRef = design.parts?.[slot.id];
      if (!partRef?.partId) continue;
      const part = SHIP_PART_MAP[partRef.partId];
      if (!part) continue;

      const geom = createGeometry(part.shape, slot.category);
      const mat = (slot.id === selectedSlot ? selMat : baseMat).clone();
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(slot.pos[0], slot.pos[1], slot.pos[2]);
      const s = partRef.scale || [1, 1, 1];
      mesh.scale.set(s[0], s[1], s[2]);

      if (part.shape === 'cone' || part.shape === 'wedge') {
        if (slot.category === 'hull' || slot.category === 'engine') mesh.rotation.x = Math.PI / 2;
        if (slot.category === 'cockpit') mesh.rotation.x = -Math.PI / 2;
      }
      if (slot.id === 'wing_left') mesh.rotation.z = Math.PI / 12;
      if (slot.id === 'wing_right') mesh.rotation.z = -Math.PI / 12;

      mesh.userData.slot = slot.id;
      group.add(mesh);
      meshesRef.current.push(mesh);
    }
  }, [design, selectedSlot]);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
      <div className="absolute top-1 left-1 text-[9px] text-orange-700 pointer-events-none">DRAG TO ROTATE · SCROLL/PINCH TO ZOOM · TAP PART TO SELECT</div>
    </div>
  );
}

function createGeometry(shape, category) {
  switch (shape) {
    case 'cone': return new THREE.ConeGeometry(0.5, 2, 6);
    case 'box': return new THREE.BoxGeometry(category === 'wing' ? 0.6 : 1.5, category === 'wing' ? 0.15 : 0.8, category === 'wing' ? 1.5 : 2);
    case 'cylinder': return new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8);
    case 'sphere': return new THREE.SphereGeometry(0.6, 8, 6);
    case 'wedge': return new THREE.CylinderGeometry(0.05, 0.8, 2, 4);
    case 'octagon': return new THREE.CylinderGeometry(0.8, 0.8, 2, 8);
    default: return new THREE.BoxGeometry(1, 1, 1);
  }
}