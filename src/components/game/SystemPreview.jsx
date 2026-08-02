// SystemPreview — mini 3D orrery preview of a star system
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { generateSystem, BODY_TYPES } from '@/lib/system';

export default function SystemPreview({ star, fullScreen = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const [bodyCount, setBodyCount] = useState(null);
  const [starCount, setStarCount] = useState(null);

  useEffect(() => {
    if (!mountRef.current || !star) return;

    let systemData;
    try {
      systemData = generateSystem(star.seed, star.starClass, star.population);
    } catch (e) {
      return;
    }
    setBodyCount(systemData.bodyCount);
    setStarCount(systemData.stars.length);

    const width = mountRef.current.clientWidth;
    const height = fullScreen ? window.innerHeight - 44 : 160;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(0, 25, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Build bodies — star + planets with orbit lines
    const bodyMeshes = [];
    for (const body of systemData.bodies) {
      if (body.type === BODY_TYPES.RING || body.type === BODY_TYPES.ASTEROID) continue;

      if (body.type === BODY_TYPES.STAR) {
        const radius = Math.max(2, Math.min(5, body.radius * 0.8));
        const geom = new THREE.SphereGeometry(radius, 12, 8);
        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(body.color), wireframe: true });
        const mesh = new THREE.Mesh(geom, mat);
        scene.add(mesh);
        bodyMeshes.push({ mesh, body, orbitRadius: 0, phaseOffset: 0 });
      } else if (body.type === BODY_TYPES.PLANET || body.type === BODY_TYPES.MOON) {
        const radius = body.type === BODY_TYPES.MOON ? 0.25 : Math.max(0.3, Math.min(1.2, body.radius * 0.3));
        const geom = new THREE.SphereGeometry(radius, 8, 6);
        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(body.color), wireframe: true });
        const mesh = new THREE.Mesh(geom, mat);
        scene.add(mesh);

        if (body.orbitRadius > 0) {
          const orbitGeom = new THREE.BufferGeometry();
          const segments = 48;
          const positions = new Float32Array((segments + 1) * 3);
          for (let i = 0; i <= segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            positions[i * 3] = Math.cos(a) * body.orbitRadius;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = Math.sin(a) * body.orbitRadius;
          }
          orbitGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          const orbitMat = new THREE.LineBasicMaterial({ color: 0x332200, transparent: true, opacity: 0.4 });
          scene.add(new THREE.Line(orbitGeom, orbitMat));
        }

        bodyMeshes.push({ mesh, body, orbitRadius: body.orbitRadius, phaseOffset: Math.random() * Math.PI * 2 });
      } else if (body.type === BODY_TYPES.BELT && body.orbitRadius > 0) {
        const orbitGeom = new THREE.BufferGeometry();
        const segments = 48;
        const positions = new Float32Array((segments + 1) * 3);
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          positions[i * 3] = Math.cos(a) * body.orbitRadius;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = Math.sin(a) * body.orbitRadius;
        }
        orbitGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x443311, transparent: true, opacity: 0.3 });
        scene.add(new THREE.Line(orbitGeom, orbitMat));
      }
    }

    // Auto-fit camera
    const maxOrbit = Math.max(...systemData.bodies.map(b => b.orbitRadius || 0), 20);
    camera.position.set(0, maxOrbit * 0.6, maxOrbit * 1.1);
    camera.lookAt(0, 0, 0);

    let azimuth = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      azimuth += 0.002;
      const t = Date.now() * 0.00003;

      for (const bm of bodyMeshes) {
        if (bm.orbitRadius > 0) {
          const angle = t / Math.sqrt(bm.orbitRadius) + bm.phaseOffset;
          bm.mesh.position.x = Math.cos(angle) * bm.orbitRadius;
          bm.mesh.position.z = Math.sin(angle) * bm.orbitRadius;
        }
        bm.mesh.rotation.y += 0.01;
      }

      camera.position.x = Math.cos(azimuth) * maxOrbit * 1.1;
      camera.position.z = Math.sin(azimuth) * maxOrbit * 1.1;
      camera.position.y = maxOrbit * 0.6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = fullScreen ? window.innerHeight - 44 : 160;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [star?.seed]);

  if (!star) return null;

  if (fullScreen) {
    return <div ref={mountRef} className="w-full" style={{ height: 'calc(100vh - 44px)', touchAction: 'none' }} />;
  }

  return (
    <div className="border border-orange-900 bg-black">
      <div className="text-orange-700 text-[9px] uppercase px-1 py-0.5 border-b border-orange-900 flex justify-between">
        <span>System Preview</span>
        <span>{starCount > 1 ? `${starCount} stars · ` : ''}{bodyCount ?? '?'} bodies</span>
      </div>
      <div ref={mountRef} className="w-full" style={{ height: '160px', touchAction: 'none' }} />
    </div>
  );
}