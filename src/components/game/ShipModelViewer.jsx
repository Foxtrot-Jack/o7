// ShipModelViewer — rotating, interactive 3D ship wireframe with pinch-to-zoom
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { buildShipModel } from '@/lib/shipModelBuilder';
import { buildCustomShipModel } from '@/lib/modelBuilder';
import { SHIP_MAP } from '@/lib/gameState';

export default function ShipModelViewer({ ship, customShips }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const animationIdRef = useRef(null);
  const rotState = useRef({ azimuth: 0, targetAzimuth: 0, polar: 0.3, targetPolar: 0.3, distance: 5, targetDistance: 5 });
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const pinchDistRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Build ship model — reflects the currently flown ship
    let model;
    if (ship.type === 'custom' && ship.customShipId) {
      const design = (customShips || []).find(s => s.id === ship.customShipId);
      model = design ? buildCustomShipModel(design, 0xff8800) : buildShipModel(2);
    } else {
      const shipType = SHIP_MAP[ship.type];
      const shipClass = shipType?.class || 1;
      model = buildShipModel(shipClass);
    }
    scene.add(model);
    modelRef.current = model;

    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';

    // Pointer drag rotation
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      rotState.current.targetAzimuth += dx * 0.01;
      rotState.current.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rotState.current.targetPolar + dy * 0.01));
    };
    const onPointerUp = () => { isDraggingRef.current = false; };

    // Wheel zoom (desktop)
    const onWheel = (e) => {
      e.preventDefault();
      rotState.current.targetDistance = Math.max(2, Math.min(15, rotState.current.targetDistance + e.deltaY * 0.01));
    };

    // Touch pinch zoom (mobile)
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        isDraggingRef.current = false;
        pinchDistRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = pinchDistRef.current - newDist;
        pinchDistRef.current = newDist;
        rotState.current.targetDistance = Math.max(2, Math.min(15, rotState.current.targetDistance + delta * 0.03));
      } else if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - lastPosRef.current.x;
        const dy = e.touches[0].clientY - lastPosRef.current.y;
        lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        rotState.current.targetAzimuth += dx * 0.01;
        rotState.current.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rotState.current.targetPolar + dy * 0.01));
      }
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
      pinchDistRef.current = 0;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const rs = rotState.current;
      rs.azimuth += (rs.targetAzimuth - rs.azimuth) * 0.1;
      rs.polar += (rs.targetPolar - rs.polar) * 0.1;
      rs.distance += (rs.targetDistance - rs.distance) * 0.1;
      if (!isDraggingRef.current) rs.targetAzimuth += 0.004;
      if (modelRef.current) {
        modelRef.current.rotation.y = rs.azimuth;
        modelRef.current.rotation.x = Math.sin(rs.polar - Math.PI / 2) * 0.3;
      }
      // Apply zoom via camera distance
      camera.position.set(0, 1.5, rs.distance);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (mountRef.current && canvas.parentNode) mountRef.current.removeChild(canvas);
    };
  }, [ship.type, ship.customShipId]);

  return <div ref={mountRef} className="w-full h-48" style={{ touchAction: 'none' }} />;
}