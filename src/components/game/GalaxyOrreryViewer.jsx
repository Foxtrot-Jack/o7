// GalaxyOrreryViewer — full-screen 3D orrery for previewing visited systems
// Supports pinch zoom, drag rotate, tap-to-select bodies/stations
// Station click → plot route + auto-dock; Body click → carrier jump destination
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { generateSystem, BODY_TYPES } from '@/lib/system';
import { buildStationModel } from '@/lib/stationModelBuilder';
import { calculateRoute } from '@/lib/routeCalculator';
import { COMMODITY_MAP } from '@/lib/commodities';

export default function GalaxyOrreryViewer({ star, onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  const bodyMeshesRef = useRef([]);
  const orbitLinesRef = useRef([]);
  const stationMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const selectedMarkerRef = useRef(null);
  const focusBodyRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gridRef = useRef(null);

  const { state, jumpCarrier, plotRoute, update } = useGameState();
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showCarrierPicker, setShowCarrierPicker] = useState(false);
  const [routeMsg, setRouteMsg] = useState(null);

  const systemData = useMemo(() => {
    if (!star) return null;
    try { return generateSystem(star.seed, star.starClass, star.population); } catch (e) { return null; }
  }, [star?.seed]);

  const rotState = useRef({
    azimuth: Math.PI / 4, polar: Math.PI / 3, distance: 80,
    targetAzimuth: Math.PI / 4, targetPolar: Math.PI / 3, targetDistance: 80,
    focusX: 0, focusZ: 0, targetFocusX: 0, targetFocusZ: 0,
  });

  // Init Three.js
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 5000);
    updateCameraPosition(camera, rotState.current);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene; rendererRef.current = renderer; cameraRef.current = camera;

    const grid = new THREE.GridHelper(200, 20, 0x110800, 0x110800);
    scene.add(grid); gridRef.current = grid;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(0.1, (now - (lastTimeRef.current || now)) / 1000);
      lastTimeRef.current = now;
      const t = now * 0.00003;

      for (const bm of bodyMeshesRef.current) {
        if (bm.body.orbitRadius > 0) {
          const angle = t * bm.invSqrtOrbit + bm.phaseOffset;
          bm.group.position.x = Math.cos(angle) * bm.body.orbitRadius;
          bm.group.position.z = Math.sin(angle) * bm.body.orbitRadius;
          bm.group.position.y = 0;
        }
        if (bm.mesh) bm.mesh.rotation.y += dt * 0.06;
      }
      for (const sm of stationMeshesRef.current) {
        if (sm.isSurface) continue;
        const angle = t * sm.invSqrtOrbit + sm.phaseOffset;
        sm.model.position.x = Math.cos(angle) * sm.orbitR;
        sm.model.position.z = Math.sin(angle) * sm.orbitR;
        sm.model.position.y = 0;
        sm.model.rotation.y += dt * 0.12;
      }

      const rs = rotState.current;
      const sRot = 1 - Math.exp(-dt * 6);
      const sFocus = 1 - Math.exp(-dt * 5);
      rs.azimuth += (rs.targetAzimuth - rs.azimuth) * sRot;
      rs.polar += (rs.targetPolar - rs.polar) * sRot;
      rs.distance += (rs.targetDistance - rs.distance) * sRot;
      rs.focusX += (rs.targetFocusX - rs.focusX) * sFocus;
      rs.focusZ += (rs.targetFocusZ - rs.focusZ) * sFocus;
      if (focusBodyRef.current) {
        rs.targetFocusX = focusBodyRef.current.group.position.x;
        rs.targetFocusZ = focusBodyRef.current.group.position.z;
      }
      updateCameraPosition(camera, rs);

      if (selectedMarkerRef.current) {
        const pulse = 1 + Math.sin(now * 0.005) * 0.3;
        selectedMarkerRef.current.scale.set(pulse, pulse, pulse);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth, h = mountRef.current.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Build scene from system data
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !systemData) return;

    for (const bm of bodyMeshesRef.current) { scene.remove(bm.group); if (bm.mesh) { bm.mesh.geometry.dispose(); bm.mesh.material.dispose(); } }
    for (const ol of orbitLinesRef.current) { scene.remove(ol); ol.geometry.dispose(); ol.material.dispose(); }
    if (selectedMarkerRef.current) { scene.remove(selectedMarkerRef.current); selectedMarkerRef.current.geometry.dispose(); selectedMarkerRef.current.material.dispose(); }
    for (const sm of stationMeshesRef.current) { sm.model.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); }
    bodyMeshesRef.current = []; orbitLinesRef.current = []; stationMeshesRef.current = [];
    selectedMarkerRef.current = null;

    const getVisualRadius = (b) => {
      if (b.type === BODY_TYPES.STAR) return Math.max(3, Math.min(10, b.radius * 1.2));
      if (b.type === BODY_TYPES.PLANET) {
        const gg = b.planetType?.startsWith('gas_giant') || b.planetType?.startsWith('helium');
        return gg ? Math.max(1, Math.min(3, b.radius * 0.12)) : Math.max(0.3, Math.min(1.2, b.radius * 0.4));
      }
      if (b.type === BODY_TYPES.MOON) return Math.max(0.1, Math.min(0.4, b.radius * 0.4));
      if (b.type === BODY_TYPES.ASTEROID) return Math.max(0.1, b.radius * 2);
      return 1;
    };

    for (const body of systemData.bodies) {
      if (body.type === BODY_TYPES.RING) continue;
      const group = new THREE.Group();
      let mesh = null;

      if (body.type === BODY_TYPES.STAR) {
        const radius = getVisualRadius(body);
        mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(body.color), wireframe: true }));
        group.add(mesh);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.5, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(body.color), transparent: true, opacity: 0.15 }));
        group.add(glow);
      } else if (body.type === BODY_TYPES.PLANET || body.type === BODY_TYPES.MOON) {
        const radius = getVisualRadius(body);
        mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(body.color), wireframe: true }));
        group.add(mesh);
        if (body.hasRings) {
          const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.4, radius * 2.2, 24), new THREE.MeshBasicMaterial({ color: 0x8a7a5a, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.5 }));
          ring.rotation.x = Math.PI / 2 + (body.axialTilt * Math.PI / 180);
          group.add(ring);
        }
      } else if (body.type === BODY_TYPES.ASTEROID) {
        const radius = getVisualRadius(body);
        mesh = new THREE.Mesh(new THREE.OctahedronGeometry(radius, 0), new THREE.MeshBasicMaterial({ color: body.valuable ? 0xffaa44 : 0x554433, wireframe: true }));
        group.add(mesh);
      }

      if (body.orbitRadius > 0) {
        const orbitGeom = new THREE.BufferGeometry();
        const segments = 64;
        const positions = new Float32Array((segments + 1) * 3);
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          positions[i * 3] = Math.cos(a) * body.orbitRadius;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = Math.sin(a) * body.orbitRadius;
        }
        orbitGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const orbitLine = new THREE.Line(orbitGeom, new THREE.LineBasicMaterial({ color: body.type === BODY_TYPES.STAR ? 0x553300 : 0x332200, transparent: true, opacity: 0.4 }));
        scene.add(orbitLine);
        orbitLinesRef.current.push(orbitLine);
      }

      scene.add(group);
      bodyMeshesRef.current.push({ body, group, mesh, visualRadius: getVisualRadius(body), phaseOffset: Math.random() * Math.PI * 2, invSqrtOrbit: body.orbitRadius > 0 ? 1 / Math.sqrt(body.orbitRadius) : 0 });
    }

    // Build stations
    for (const station of systemData.stations) {
      const parentBody = systemData.bodies.find(b => b.id === station.parentId);
      if (!parentBody) continue;
      const parentEntry = bodyMeshesRef.current.find(bm => bm.body.id === station.parentId);
      if (!parentEntry) continue;

      const stationModel = buildStationModel(station.type);
      const planetVisualRadius = getVisualRadius(parentBody);
      const stationScale = Math.max(0.03, Math.min(0.1, planetVisualRadius * 0.08));
      stationModel.scale.setScalar(stationScale);

      if (station.isOrbital) {
        parentEntry.group.add(stationModel);
        const orbitR = planetVisualRadius * 2.5;
        stationMeshesRef.current.push({ station, model: stationModel, parentBody, orbitR, invSqrtOrbit: 0.5 / Math.sqrt(Math.max(0.01, orbitR)), phaseOffset: Math.random() * Math.PI * 2 });
      } else {
        stationModel.position.set(planetVisualRadius * 0.9, 0, 0);
        if (parentEntry.mesh) parentEntry.mesh.add(stationModel); else parentEntry.group.add(stationModel);
        stationMeshesRef.current.push({ station, model: stationModel, parentBody, phaseOffset: 0, isSurface: true });
      }
    }

    // Auto-fit grid + camera
    if (gridRef.current) { scene.remove(gridRef.current); gridRef.current.geometry.dispose(); gridRef.current.material.dispose(); }
    const maxOrbit = Math.max(...systemData.bodies.map(b => b.orbitRadius || 0), 20);
    const gridSize = Math.max(400, maxOrbit * 6);
    const newGrid = new THREE.GridHelper(gridSize, Math.min(80, Math.max(20, Math.floor(gridSize / 25))), 0x110800, 0x110800);
    scene.add(newGrid); gridRef.current = newGrid;
    rotState.current.targetDistance = maxOrbit * 2.5;
  }, [systemData]);

  // Pointer interaction
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    let isDragging = false, lastX = 0, lastY = 0, pinchDist = 0, dragStartX = 0, dragStartY = 0, lastCentroidX = 0, lastCentroidY = 0;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const meshes = bodyMeshesRef.current.filter(bm => bm.mesh).map(bm => bm.mesh);
      const stationModels = stationMeshesRef.current.filter(sm => sm.model).map(sm => sm.model);
      const bodyHits = raycasterRef.current.intersectObjects(meshes, false);
      const stationHits = raycasterRef.current.intersectObjects(stationModels, true);
      if (bodyHits.length > 0 && (stationHits.length === 0 || bodyHits[0].distance <= stationHits[0].distance)) {
        const idx = meshes.indexOf(bodyHits[0].object);
        if (idx >= 0) { const bm = bodyMeshesRef.current.filter(bm => bm.mesh)[idx]; if (bm) handleSelectBody(bm.body); }
      } else if (stationHits.length > 0) {
        for (const sm of stationMeshesRef.current) { if (raycasterRef.current.intersectObject(sm.model, true).length > 0) { handleSelectStation(sm.station); break; } }
      }
    };

    const onPointerDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; dragStartX = e.clientX; dragStartY = e.clientY; };
    const onPointerMove = (e) => { if (!isDragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; const rs = rotState.current; rs.targetAzimuth -= dx * 0.005; rs.targetPolar -= dy * 0.005; rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar)); };
    const onPointerUp = (e) => { isDragging = false; if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < 5) handleClick(e); };
    const onWheel = (e) => { e.preventDefault(); const rs = rotState.current; rs.targetDistance += e.deltaY * 0.2; rs.targetDistance = Math.max(0.3, Math.min(500, rs.targetDistance)); };

    const onTouchStart = (e) => { if (e.touches.length === 2) { isDragging = false; pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); lastCentroidX = (e.touches[0].clientX + e.touches[1].clientX) / 2; lastCentroidY = (e.touches[0].clientY + e.touches[1].clientY) / 2; } else if (e.touches.length === 1) { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; dragStartX = lastX; dragStartY = lastY; } };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const delta = pinchDist - newDist; pinchDist = newDist;
        const rs = rotState.current; rs.targetDistance += delta * 0.8; rs.targetDistance = Math.max(0.3, Math.min(500, rs.targetDistance));
        const ncx = (e.touches[0].clientX + e.touches[1].clientX) / 2, ncy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const cdx = ncx - lastCentroidX, cdy = ncy - lastCentroidY; lastCentroidX = ncx; lastCentroidY = ncy;
        const cam = cameraRef.current;
        if (cam && (Math.abs(cdx) > 0.5 || Math.abs(cdy) > 0.5)) {
          focusBodyRef.current = null;
          const forward = new THREE.Vector3(); cam.getWorldDirection(forward); forward.y = 0; forward.normalize();
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
          const panScale = rs.distance * 0.002;
          rs.targetFocusX -= (cdx * right.x + cdy * forward.x) * panScale;
          rs.targetFocusZ -= (cdx * right.z + cdy * forward.z) * panScale;
        }
      } else if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        const rs = rotState.current; rs.targetAzimuth -= dx * 0.005; rs.targetPolar -= dy * 0.005; rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
      }
    };
    const onTouchEnd = (e) => { if (isDragging) { const touch = e.changedTouches[0]; if (Math.hypot(touch.clientX - dragStartX, touch.clientY - dragStartY) < 10) handleClick({ clientX: touch.clientX, clientY: touch.clientY }); } isDragging = false; pinchDist = 0; };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel); canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [systemData]);

  const handleSelectBody = useCallback((body) => {
    setSelectedBody(body); setSelectedStation(null);
    const entry = bodyMeshesRef.current.find(bm => bm.body.id === body.id);
    focusBodyRef.current = entry || null;
    if (entry) rotState.current.targetDistance = Math.max(entry.visualRadius * 5, 3);
    // Update selected marker
    const scene = sceneRef.current;
    if (scene) {
      if (selectedMarkerRef.current) { scene.remove(selectedMarkerRef.current); selectedMarkerRef.current.geometry.dispose(); selectedMarkerRef.current.material.dispose(); }
      if (entry) {
        const marker = new THREE.Mesh(new THREE.SphereGeometry(entry.visualRadius * 1.8, 8, 6), new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.5 }));
        scene.add(marker); selectedMarkerRef.current = marker;
      }
    }
  }, []);

  const handleSelectStation = useCallback((station) => {
    setSelectedStation(station); setSelectedBody(null);
    const parentEntry = bodyMeshesRef.current.find(bm => bm.body.id === station.parentId);
    focusBodyRef.current = parentEntry || null;
    if (parentEntry) rotState.current.targetDistance = Math.max(parentEntry.visualRadius * 5, 3);
  }, []);

  const handleCarrierJump = useCallback((carrierId) => {
    jumpCarrier(carrierId, { seed: star.seed, name: star.name, x: star.x, y: star.y, z: star.z, starClass: star.starClass, population: star.population });
    setShowCarrierPicker(false);
    setRouteMsg(`Carrier jump initiated to ${star.name}.`);
    setTimeout(() => setRouteMsg(null), 3000);
  }, [star, jumpCarrier]);

  const handlePlotRouteToStation = useCallback((station) => {
    const jumpRange = SHIP_MAP[state.ship?.type]?.jumpRange || 10;
    const route = calculateRoute(state.currentSystem, star, jumpRange, false);
    if (route.length === 0) {
      setRouteMsg('No route found — system may be out of jump range.');
    } else {
      plotRoute(route);
      update({ autoDockTarget: { systemSeed: star.seed, stationId: station.id, stationName: station.name } });
      setRouteMsg(`Route plotted to ${station.name} (${route.length} jumps). Auto-dock enabled on arrival.`);
    }
    setTimeout(() => setRouteMsg(null), 4000);
  }, [star, state.currentSystem, state.ship, plotRoute, update]);

  if (!systemData) return <div className="w-full h-full flex items-center justify-center text-orange-500">LOADING SYSTEM DATA...</div>;

  const carriers = state.fleetCarriers || [];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header with back button */}
      <div className="flex items-center justify-between border-b border-orange-700 bg-black/90 px-3 py-2 flex-shrink-0">
        <div>
          <span className="text-orange-300 font-bold text-sm">{star.name} — System Orrery</span>
          <span className="text-orange-700 text-[10px] ml-2">{systemData.bodies.length} bodies · {systemData.stations.length} stations · {systemData.faction}</span>
        </div>
        <button onClick={onClose} className="px-3 py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold">← BACK TO GALAXY</button>
      </div>

      {/* 3D viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />

        {/* System info */}
        <div className="absolute top-2 left-2 text-xs space-y-0.5 pointer-events-none">
          <div className="text-orange-300 font-bold">{star.name}</div>
          <div className="text-orange-600">FACTION: {systemData.faction}</div>
          <div className="text-orange-600">ECONOMY: {systemData.economy.name}</div>
          <div className="text-orange-600">STARS: {systemData.stars.length}</div>
          <div className="text-orange-800 text-[10px] mt-1">DRAG TO ROTATE · 2-FINGER PAN/PINCH · SCROLL TO ZOOM · TAP BODY</div>
        </div>

        {/* Reset view */}
        {(selectedBody || selectedStation) && (
          <button onClick={() => { focusBodyRef.current = null; setSelectedBody(null); setSelectedStation(null); const maxOrbit = Math.max(...systemData.bodies.map(b => b.orbitRadius || 0), 20); rotState.current.targetDistance = maxOrbit * 2.5; rotState.current.targetFocusX = 0; rotState.current.targetFocusZ = 0; }} className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 border border-orange-700 bg-black/80 text-orange-400 hover:bg-orange-950/30 text-[10px] z-30">⟲ RESET VIEW</button>
        )}

        {/* Route message */}
        {routeMsg && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 border border-cyan-700 bg-black/95 px-3 py-1 text-cyan-300 text-[10px] z-30">{routeMsg}</div>
        )}

        {/* Carrier picker */}
        {showCarrierPicker && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-orange-700 bg-black/95 p-3 text-xs space-y-2 z-40 w-64">
            <div className="text-orange-300 font-bold uppercase text-[10px] border-b border-orange-900 pb-1">Select Carrier to Jump</div>
            {carriers.map(c => (
              <button key={c.id} onClick={() => handleCarrierJump(c.id)} className="w-full text-left p-2 border border-orange-900 hover:border-orange-500 hover:bg-orange-950/30">
                <div className="text-orange-300">{c.name}</div>
                <div className="text-orange-700 text-[10px]">Tritium: {c.tritium || 0} · Currently at: {c.systemName || 'Unknown'}</div>
              </button>
            ))}
            <button onClick={() => setShowCarrierPicker(false)} className="w-full py-1 border border-orange-900 text-orange-600 text-[10px]">CANCEL</button>
          </div>
        )}

        {/* Station info panel */}
        {selectedStation && (
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:w-96 border border-green-700 bg-black/95 p-3 text-xs space-y-2 z-30">
            <div className="flex items-center justify-between border-b border-green-900 pb-1">
              <span className="text-green-300 font-bold">{selectedStation.name}</span>
              <button onClick={() => setSelectedStation(null)} className="text-green-700 hover:text-green-400 text-[10px]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-orange-600">
              <div>TYPE: <span className="text-orange-300 capitalize">{selectedStation.type}</span></div>
              <div>ECONOMY: <span className="text-orange-300">{selectedStation.economy.name}</span></div>
              <div>ORBIT: <span className="text-orange-300">{selectedStation.isOrbital ? 'Orbital' : 'Surface'}</span></div>
              <div>STAR DIST: <span className="text-orange-300">{selectedStation.distanceFromStar?.toFixed(1)} AU</span></div>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedStation.services.refuel && <span className="text-[9px] border border-orange-900 text-orange-500 px-1">REFUEL</span>}
              {selectedStation.services.repair && <span className="text-[9px] border border-orange-900 text-orange-500 px-1">REPAIR</span>}
              {selectedStation.services.market && <span className="text-[9px] border border-orange-900 text-orange-500 px-1">MARKET</span>}
              {selectedStation.services.outfitting && <span className="text-[9px] border border-orange-900 text-orange-500 px-1">OUTFIT</span>}
              {selectedStation.services.shipyard && <span className="text-[9px] border border-orange-900 text-orange-500 px-1">SHIPYARD</span>}
            </div>
            <button onClick={() => handlePlotRouteToStation(selectedStation)} className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold">⚡ PLOT ROUTE & AUTO-DOCK</button>
          </div>
        )}

        {/* Body info panel */}
        {selectedBody && !selectedStation && (
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:w-96 border border-orange-700 bg-black/95 p-3 text-xs space-y-2 z-30">
            <div className="flex items-center justify-between border-b border-orange-900 pb-1">
              <span className="text-orange-300 font-bold">{selectedBody.name || selectedBody.designation}</span>
              <button onClick={() => setSelectedBody(null)} className="text-orange-700 hover:text-orange-400 text-[10px]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-orange-600">
              {selectedBody.type === BODY_TYPES.STAR && (
                <>
                  <div>CLASS: <span className="text-orange-300">{selectedBody.starClass?.class}</span></div>
                  <div>TEMP: <span className="text-orange-300">{Math.round(selectedBody.temperature)} K</span></div>
                  <div>RADIUS: <span className="text-orange-300">{selectedBody.radius.toFixed(2)} R☉</span></div>
                </>
              )}
              {(selectedBody.type === BODY_TYPES.PLANET || selectedBody.type === BODY_TYPES.MOON) && (
                <>
                  <div>TYPE: <span className="text-orange-300">{selectedBody.planetTypeName}</span></div>
                  <div>RADIUS: <span className="text-orange-300">{selectedBody.radius.toFixed(2)} R⊕</span></div>
                  <div>GRAVITY: <span className="text-orange-300">{selectedBody.gravity.toFixed(2)} G</span></div>
                  <div>TEMP: <span className="text-orange-300">{Math.round(selectedBody.temperature)} K</span></div>
                  <div>ATMOS: <span className="text-orange-300">{selectedBody.atmosphere ? 'Yes' : 'No'}</span></div>
                  <div>HABITABLE: <span className="text-orange-300">{selectedBody.habitable ? 'Yes' : 'No'}</span></div>
                  <div>ORBIT: <span className="text-orange-300">{selectedBody.orbitRadius.toFixed(1)} AU</span></div>
                  <div>PERIOD: <span className="text-orange-300">{selectedBody.orbitPeriod.toFixed(1)} d</span></div>
                </>
              )}
              {selectedBody.type === BODY_TYPES.BELT && (
                <>
                  <div>ASTEROIDS: <span className="text-orange-300">{selectedBody.bodyCount?.toLocaleString()}</span></div>
                  <div>ORBIT: <span className="text-orange-300">{selectedBody.orbitRadius.toFixed(1)} AU</span></div>
                </>
              )}
              {selectedBody.type === BODY_TYPES.RING && (
                <>
                  <div>TYPE: <span className="text-orange-300 capitalize">{selectedBody.ringType || 'rocky'} Ring</span></div>
                  <div>HOTSPOTS: <span className="text-orange-300">{selectedBody.hotspots?.length || 0}</span></div>
                </>
              )}
              <div>SCAN VALUE: <span className="text-orange-300">{selectedBody.scanValue?.toLocaleString()} CR</span></div>
            </div>
            {/* Carrier jump destination */}
            {selectedBody.type !== BODY_TYPES.RING && selectedBody.type !== BODY_TYPES.ASTEROID && (
              <div className="border-t border-orange-900 pt-1">
                {carriers.length === 0 ? (
                  <div className="text-orange-800 text-[10px] text-center py-1">No fleet carriers owned</div>
                ) : carriers.length === 1 ? (
                  <button onClick={() => handleCarrierJump(carriers[0].id)} className="w-full py-1.5 border border-purple-500 text-purple-300 hover:bg-purple-950/30 text-[10px] font-bold">⊕ SET CARRIER JUMP DESTINATION</button>
                ) : (
                  <button onClick={() => setShowCarrierPicker(true)} className="w-full py-1.5 border border-purple-500 text-purple-300 hover:bg-purple-950/30 text-[10px] font-bold">⊕ SELECT CARRIER TO JUMP ({carriers.length})</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function updateCameraPosition(camera, rs) {
  const x = rs.distance * Math.sin(rs.polar) * Math.cos(rs.azimuth);
  const y = rs.distance * Math.cos(rs.polar);
  const z = rs.distance * Math.sin(rs.polar) * Math.sin(rs.azimuth);
  camera.position.set(x + rs.focusX, y, z + rs.focusZ);
  camera.lookAt(rs.focusX, 0, rs.focusZ);
}