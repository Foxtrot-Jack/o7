// 3D ship wireframe viewer — auto-rotates, drag to rotate, pinch/scroll to zoom
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { buildShipWireframe } from '@/lib/shipWireframes';

export default function ShipViewer({ shipTypeId }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const shipRef = useRef(null);
  const animIdRef = useRef(null);
  const rotState = useRef({
    azimuth: Math.PI / 4, polar: Math.PI / 3, distance: 5,
    targetAzimuth: Math.PI / 4, targetPolar: Math.PI / 3, targetDistance: 5,
    autoRotate: true,
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      const rs = rotState.current;
      if (rs.autoRotate) rs.targetAzimuth += 0.005;
      rs.azimuth += (rs.targetAzimuth - rs.azimuth) * 0.1;
      rs.polar += (rs.targetPolar - rs.polar) * 0.1;
      rs.distance += (rs.targetDistance - rs.distance) * 0.1;
      camera.position.set(
        rs.distance * Math.sin(rs.polar) * Math.cos(rs.azimuth),
        rs.distance * Math.cos(rs.polar),
        rs.distance * Math.sin(rs.polar) * Math.sin(rs.azimuth)
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const ww = mountRef.current.clientWidth;
      const hh = mountRef.current.clientHeight;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode)
        mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (shipRef.current) {
      scene.remove(shipRef.current);
      shipRef.current.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    const ship = buildShipWireframe(shipTypeId);
    scene.add(ship);
    shipRef.current = ship;
  }, [shipTypeId]);

  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    let drag = false, lx = 0, ly = 0, pinch = 0;
    const md = (e) => { drag = true; lx = e.clientX; ly = e.clientY; rotState.current.autoRotate = false; };
    const mm = (e) => {
      if (!drag) return;
      const rs = rotState.current;
      rs.targetAzimuth -= (e.clientX - lx) * 0.01;
      rs.targetPolar -= (e.clientY - ly) * 0.01;
      rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
      lx = e.clientX; ly = e.clientY;
    };
    const mu = () => { drag = false; };
    const wh = (e) => {
      e.preventDefault();
      rotState.current.targetDistance = Math.max(2, Math.min(15, rotState.current.targetDistance + e.deltaY * 0.01));
    };
    const ts = (e) => {
      if (e.touches.length === 1) { drag = true; lx = e.touches[0].clientX; ly = e.touches[0].clientY; rotState.current.autoRotate = false; }
      else if (e.touches.length === 2) { drag = false; pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
    };
    const tm = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && drag) {
        const rs = rotState.current;
        rs.targetAzimuth -= (e.touches[0].clientX - lx) * 0.01;
        rs.targetPolar -= (e.touches[0].clientY - ly) * 0.01;
        rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const nd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        rotState.current.targetDistance = Math.max(2, Math.min(15, rotState.current.targetDistance + (pinch - nd) * 0.02));
        pinch = nd;
      }
    };
    const te = () => { drag = false; pinch = 0; };
    canvas.addEventListener('mousedown', md);
    canvas.addEventListener('mousemove', mm);
    canvas.addEventListener('mouseup', mu);
    canvas.addEventListener('wheel', wh, { passive: false });
    canvas.addEventListener('touchstart', ts, { passive: false });
    canvas.addEventListener('touchmove', tm, { passive: false });
    canvas.addEventListener('touchend', te);
    return () => {
      canvas.removeEventListener('mousedown', md);
      canvas.removeEventListener('mousemove', mm);
      canvas.removeEventListener('mouseup', mu);
      canvas.removeEventListener('wheel', wh);
      canvas.removeEventListener('touchstart', ts);
      canvas.removeEventListener('touchmove', tm);
      canvas.removeEventListener('touchend', te);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />;
}