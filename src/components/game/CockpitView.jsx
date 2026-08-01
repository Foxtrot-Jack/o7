// Cockpit Viewer — interior perspective looking out the window
// Shows the cockpit frame, system background, and placed accessories
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { getCockpitConfig, COCKPIT_PART_MAP } from '@/lib/cockpitParts';

export default function CockpitView({ target = 'ship', targetId = null, decorationOverride = null }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const bgRef = useRef(null);
  const accessoriesRef = useRef(null);
  const animationIdRef = useRef(null);
  const lookRef = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });

  const { state, getSystemData } = useGameState();

  const shipClass = target === 'ship'
    ? (SHIP_MAP[state.ship.type]?.class || (state.ship.type === 'custom' ? 2 : 1))
    : target === 'carrier' ? 'carrier' : 'station';
  const config = getCockpitConfig(shipClass);

  const savedDecor = target === 'ship'
    ? state.ship.cockpitDecoration || { parts: {} }
    : target === 'carrier'
      ? state.fleetCarriers.find(c => c.id === targetId)?.cockpitDecoration || { parts: {} }
      : state.ownedStations.find(s => s.id === targetId)?.decoration || { parts: {} };
  const decoration = decorationOverride || savedDecor;

  const systemData = getSystemData();
  const location = state.currentLocation;

  // Init Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 200);
    camera.position.set(0, 0, 0.3);
    camera.rotation.order = 'YXZ';

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const bgGroup = new THREE.Group();
    scene.add(bgGroup);
    bgRef.current = bgGroup;

    const frameGroup = new THREE.Group();
    scene.add(frameGroup);
    frameRef.current = frameGroup;

    const accGroup = new THREE.Group();
    scene.add(accGroup);
    accessoriesRef.current = accGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = Date.now() * 0.001;
      const lk = lookRef.current;
      lk.yaw += (lk.targetYaw - lk.yaw) * 0.08;
      lk.pitch += (lk.targetPitch - lk.pitch) * 0.08;
      camera.rotation.y = lk.yaw + Math.sin(now * 0.1) * 0.005;
      camera.rotation.x = lk.pitch + Math.cos(now * 0.13) * 0.003;
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

  // Build cockpit frame
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !config) return;
    while (frame.children.length > 0) {
      const child = frame.children[0];
      frame.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const ww = config.windowWidth / 2;
    const wh = config.windowHeight / 2;
    const z = -config.depth;
    const frameMat = new THREE.LineBasicMaterial({ color: 0x4a2a00 });
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x1a0d00, wireframe: true, transparent: true, opacity: 0.5 });

    // Window frame outline + struts
    const pts = [
      [-ww, -wh, z], [ww, -wh, z],
      [-ww, wh, z], [ww, wh, z],
      [-ww, -wh, z], [-ww, wh, z],
      [ww, -wh, z], [ww, wh, z],
      [0, -wh, z], [0, wh, z],
      [-ww, 0, z], [ww, 0, z],
      [-ww, wh, z], [-ww - 0.3, wh + 0.2, z + 0.6],
      [ww, wh, z], [ww + 0.3, wh + 0.2, z + 0.6],
      [-ww, -wh, z], [-ww - 0.2, -wh - 0.1, z + 0.5],
      [ww, -wh, z], [ww + 0.2, -wh - 0.1, z + 0.5],
    ];
    const fGeom = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
    frame.add(new THREE.LineSegments(fGeom, frameMat));

    // Dashboard
    const dashGeom = new THREE.BoxGeometry(config.windowWidth * 0.95, 0.06, 0.6);
    const dash = new THREE.Mesh(dashGeom, panelMat);
    dash.position.set(0, -wh - 0.05, z + 0.3);
    dash.rotation.x = -0.25;
    frame.add(dash);

    // Side panels
    const sideGeom = new THREE.BoxGeometry(0.06, config.windowHeight + 0.6, 1.6);
    const leftPanel = new THREE.Mesh(sideGeom, panelMat);
    leftPanel.position.set(-ww - 0.15, 0, z + 0.5);
    frame.add(leftPanel);
    const rightPanel = new THREE.Mesh(sideGeom, panelMat);
    rightPanel.position.set(ww + 0.15, 0, z + 0.5);
    frame.add(rightPanel);

    // Ceiling
    const ceilGeom = new THREE.BoxGeometry(config.windowWidth + 0.6, 0.06, 1.6);
    const ceiling = new THREE.Mesh(ceilGeom, panelMat);
    ceiling.position.set(0, wh + 0.15, z + 0.5);
    frame.add(ceiling);

    // HUD screens on dashboard
    const hudMat = new THREE.MeshBasicMaterial({ color: 0x004422, wireframe: true });
    const hudCount = Math.min(3, Math.max(1, Math.floor(config.windowWidth / 2.5)));
    for (let i = 0; i < hudCount; i++) {
      const hudGeom = new THREE.PlaneGeometry(0.35, 0.2);
      const hud = new THREE.Mesh(hudGeom, hudMat);
      hud.position.set((i - (hudCount - 1) / 2) * 0.5, -wh - 0.02, z + 0.15);
      hud.rotation.x = -0.25;
      frame.add(hud);
    }
  }, [config]);

  // Build system background
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    while (bg.children.length > 0) {
      const child = bg.children[0];
      bg.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    // Starfield
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 60 + Math.random() * 40;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 10;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffaa66, size: 0.3, sizeAttenuation: true });
    bg.add(new THREE.Points(starGeom, starMat));

    if (location === 'station') {
      // Station docking bay — structural elements outside the window
      const structMat = new THREE.MeshBasicMaterial({ color: 0x332200, wireframe: true });
      for (let i = 0; i < 5; i++) {
        const geom = new THREE.BoxGeometry(2 + Math.random() * 3, 0.3, 0.3);
        const beam = new THREE.Mesh(geom, structMat);
        beam.position.set((Math.random() - 0.5) * config.windowWidth * 2, (Math.random() - 0.5) * config.windowHeight * 2, -5 - Math.random() * 5);
        beam.rotation.z = Math.random() * Math.PI;
        bg.add(beam);
      }
      for (let i = 0; i < 3; i++) {
        const lightGeom = new THREE.SphereGeometry(0.15, 6, 4);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
        const light = new THREE.Mesh(lightGeom, lightMat);
        light.position.set((Math.random() - 0.5) * config.windowWidth * 1.5, (Math.random() - 0.5) * config.windowHeight * 1.5, -6 - Math.random() * 3);
        bg.add(light);
      }
    } else if (location === 'surface' && state.currentSurfaceBody) {
      // Planetary surface below
      const body = systemData?.bodies?.find(b => b.id === state.currentSurfaceBody);
      const surfaceColor = body?.color ? new THREE.Color(body.color) : new THREE.Color(0x886644);
      const surfaceGeom = new THREE.SphereGeometry(30, 16, 12);
      const surfaceMat = new THREE.MeshBasicMaterial({ color: surfaceColor, wireframe: true });
      const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
      surface.position.set(0, -28, -5);
      bg.add(surface);
    }

    // Always render the system star (unless docked)
    if (location !== 'station' && systemData?.bodies) {
      const star = systemData.bodies.find(b => b.type === 'star');
      if (star) {
        const starColor = new THREE.Color(star.color);
        const starGeom = new THREE.SphereGeometry(5, 12, 8);
        const starMat = new THREE.MeshBasicMaterial({ color: starColor, wireframe: true });
        const starMesh = new THREE.Mesh(starGeom, starMat);
        starMesh.position.set(6, 3, -45);
        bg.add(starMesh);
        const glowGeom = new THREE.SphereGeometry(7, 8, 6);
        const glowMat = new THREE.MeshBasicMaterial({ color: starColor, transparent: true, opacity: 0.15 });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.copy(starMesh.position);
        bg.add(glow);
      }
      // Render a few planets
      const planets = systemData.bodies.filter(b => b.type === 'planet' || b.type === 'moon').slice(0, 4);
      planets.forEach((planet, i) => {
        const pColor = new THREE.Color(planet.color || '#886644');
        const pGeom = new THREE.SphereGeometry(0.5 + (planet.radius || 1) * 0.1, 8, 6);
        const pMat = new THREE.MeshBasicMaterial({ color: pColor, wireframe: true });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        const angle = (i / Math.max(planets.length, 1)) * Math.PI * 2;
        pMesh.position.set(Math.cos(angle) * 8, Math.sin(angle) * 3, -20 - i * 5);
        bg.add(pMesh);
      });
    }
  }, [systemData, location, config, state.currentSurfaceBody]);

  // Build accessories
  useEffect(() => {
    const acc = accessoriesRef.current;
    if (!acc || !config) return;
    while (acc.children.length > 0) {
      const child = acc.children[0];
      acc.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const accMat = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
    for (const slot of config.slots) {
      const partRef = decoration?.parts?.[slot.id];
      if (!partRef?.partId) continue;
      const part = COCKPIT_PART_MAP[partRef.partId];
      if (!part) continue;
      const geom = createCockpitGeometry(part.shape);
      const mesh = new THREE.Mesh(geom, accMat.clone());
      const offset = partRef.position || [0, 0, 0];
      mesh.position.set(slot.pos[0] + offset[0], slot.pos[1] + offset[1], slot.pos[2] + offset[2]);
      mesh.scale.setScalar(partRef.scale || 1);
      const rot = partRef.rotation || [0, 0, 0];
      mesh.rotation.set(rot[0] * Math.PI / 180, rot[1] * Math.PI / 180, rot[2] * Math.PI / 180);
      acc.add(mesh);
    }
  }, [decoration, config]);

  // Look-around interaction
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    const onPointerDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      const lk = lookRef.current;
      lk.targetYaw = Math.max(-0.6, Math.min(0.6, lk.targetYaw - dx * 0.003));
      lk.targetPitch = Math.max(-0.4, Math.min(0.4, lk.targetPitch - dy * 0.003));
    };
    const onPointerUp = () => { isDragging = false; };
    const onTouchStart = (e) => { if (e.touches.length === 1) { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; } };
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        const lk = lookRef.current;
        lk.targetYaw = Math.max(-0.6, Math.min(0.6, lk.targetYaw - dx * 0.003));
        lk.targetPitch = Math.max(-0.4, Math.min(0.4, lk.targetPitch - dy * 0.003));
      }
    };
    const onTouchEnd = () => { isDragging = false; };

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
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />
      <div className="absolute top-1 left-1 text-[9px] text-orange-700 pointer-events-none">DRAG TO LOOK AROUND</div>
      <div className="absolute bottom-1 left-1 text-[9px] text-orange-700 pointer-events-none">{config.name}</div>
    </div>
  );
}

function createCockpitGeometry(shape) {
  switch (shape) {
    case 'cone': return new THREE.ConeGeometry(0.15, 0.35, 6);
    case 'box': return new THREE.BoxGeometry(0.25, 0.25, 0.25);
    case 'cylinder': return new THREE.CylinderGeometry(0.1, 0.1, 0.25, 8);
    case 'sphere': return new THREE.SphereGeometry(0.13, 8, 6);
    case 'wedge': return new THREE.CylinderGeometry(0.03, 0.18, 0.35, 4);
    case 'octagon': return new THREE.CylinderGeometry(0.13, 0.13, 0.25, 8);
    case 'octahedron': return new THREE.OctahedronGeometry(0.14, 0);
    case 'tetrahedron': return new THREE.TetrahedronGeometry(0.18, 0);
    case 'torus': return new THREE.TorusGeometry(0.1, 0.035, 6, 12);
    default: return new THREE.BoxGeometry(0.25, 0.25, 0.25);
  }
}