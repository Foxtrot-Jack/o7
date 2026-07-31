// 3D System Orrery — wireframe planetary bodies orbiting in real-time
// Classic Elite-style orrery with rotation and pinch zoom
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { buildStationModel } from '@/lib/stationModelBuilder';

export default function SystemOrrery({ onSelectBody, selectedBodyId, onNavigate }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  const bodyMeshesRef = useRef([]);
  const orbitLinesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const selectedMarkerRef = useRef(null);
  const stationMeshesRef = useRef([]);
  const focusBodyRef = useRef(null);

  const { state, getSystemData, scanBody, dockAtStation, fssScanSystem, mapBody, landOnBody } = useGameState();
  const [selectedBody, setSelectedBody] = useState(null);
  const [hoveredBody, setHoveredBody] = useState(null);
  const [bodiesCollapsed, setBodiesCollapsed] = useState(state.settings?.miniScreen || false);

  const rotState = useRef({
    azimuth: Math.PI / 4,
    polar: Math.PI / 3,
    distance: 80,
    targetAzimuth: Math.PI / 4,
    targetPolar: Math.PI / 3,
    targetDistance: 80,
    focusX: 0,
    focusZ: 0,
    targetFocusX: 0,
    targetFocusZ: 0,
  });

  const systemData = getSystemData();

  // Initialize Three.js
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Reference grid
    const gridHelper = new THREE.GridHelper(200, 20, 0x221100, 0x110800);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const t = Date.now() * 0.00003;

      // Update body positions FIRST so camera focus tracks current positions (reduces jitter)
      for (const bm of bodyMeshesRef.current) {
        if (bm.body.orbitRadius > 0) {
          const angle = t / Math.sqrt(bm.body.orbitRadius) + bm.phaseOffset;
          bm.group.position.x = Math.cos(angle) * bm.body.orbitRadius;
          bm.group.position.z = Math.sin(angle) * bm.body.orbitRadius;
          bm.group.position.y = 0;
        }
        if (bm.mesh) {
          bm.mesh.rotation.y += 0.001;
        }
      }

      // Update orbital station positions
      for (const sm of stationMeshesRef.current) {
        const orbitR = (sm.planetVisualRadius || 1) * 2.5;
        const angle = t * 0.5 / Math.sqrt(orbitR) + sm.phaseOffset;
        sm.model.position.x = Math.cos(angle) * orbitR;
        sm.model.position.z = Math.sin(angle) * orbitR;
        sm.model.position.y = 0;
        sm.model.rotation.y += 0.002;
      }

      // Smooth camera AFTER body positions are current
      const rs = rotState.current;
      rs.azimuth += (rs.targetAzimuth - rs.azimuth) * 0.1;
      rs.polar += (rs.targetPolar - rs.polar) * 0.1;
      rs.distance += (rs.targetDistance - rs.distance) * 0.1;
      rs.focusX += (rs.targetFocusX - rs.focusX) * 0.08;
      rs.focusZ += (rs.targetFocusZ - rs.focusZ) * 0.08;
      if (focusBodyRef.current) {
        rs.targetFocusX = focusBodyRef.current.group.position.x;
        rs.targetFocusZ = focusBodyRef.current.group.position.z;
      }
      updateCameraPosition(camera, rs);

      // Pulse selected marker
      if (selectedMarkerRef.current) {
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.3;
        selectedMarkerRef.current.scale.set(pulse, pulse, pulse);
      }

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
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Build orrery from system data
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !systemData) return;

    // Clear old meshes
    for (const bm of bodyMeshesRef.current) {
      scene.remove(bm.group);
      if (bm.mesh) {
        bm.mesh.geometry.dispose();
        bm.mesh.material.dispose();
      }
    }
    for (const ol of orbitLinesRef.current) {
      scene.remove(ol);
      ol.geometry.dispose();
      ol.material.dispose();
    }
    if (selectedMarkerRef.current) {
      scene.remove(selectedMarkerRef.current);
      selectedMarkerRef.current.geometry.dispose();
      selectedMarkerRef.current.material.dispose();
    }
    bodyMeshesRef.current = [];
    orbitLinesRef.current = [];

    // Clear old station meshes
    for (const sm of stationMeshesRef.current) {
      sm.model.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    stationMeshesRef.current = [];

    // Create bodies
    const allBodies = systemData.bodies;
    const center = { x: 0, y: 0, z: 0 };

    for (const body of allBodies) {
      const group = new THREE.Group();
      let mesh = null;

      if (body.type === BODY_TYPES.STAR) {
        // Star — glowing wireframe sphere (much larger than planets)
        const radius = Math.max(3, Math.min(10, body.radius * 1.2));
        const geom = new THREE.SphereGeometry(radius, 16, 12);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(body.color),
          wireframe: true,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);

        // Glow sprite
        const glowGeom = new THREE.SphereGeometry(radius * 1.5, 8, 6);
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(body.color),
          transparent: true,
          opacity: 0.15,
        });
        group.add(new THREE.Mesh(glowGeom, glowMat));
      } else if (body.type === BODY_TYPES.PLANET || body.type === BODY_TYPES.MOON) {
        const isGasGiant = body.planetType?.startsWith('gas_giant') || body.planetType?.startsWith('helium');
        const radius = body.type === BODY_TYPES.MOON
          ? Math.max(0.1, Math.min(0.4, body.radius * 0.4))
          : isGasGiant
            ? Math.max(1, Math.min(3, body.radius * 0.12))
            : Math.max(0.3, Math.min(1.2, body.radius * 0.4));
        const geom = new THREE.SphereGeometry(radius, 12, 8);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(body.color),
          wireframe: true,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);

        // Rings
        if (body.hasRings) {
          const ringGeom = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x8a7a5a,
            wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.rotation.x = Math.PI / 2 + (body.axialTilt * Math.PI / 180);
          group.add(ring);
        }
      } else if (body.type === BODY_TYPES.BELT) {
        // Asteroid belt — ring of small dots
        const beltRadius = body.orbitRadius;
        const segments = 64;
        const positions = new Float32Array(segments * 3);
        for (let i = 0; i < segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          positions[i * 3] = Math.cos(a) * beltRadius + (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
          positions[i * 3 + 2] = Math.sin(a) * beltRadius + (Math.random() - 0.5) * 2;
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
          color: 0x665544,
          size: 1.5,
          sizeAttenuation: false,
        });
        const points = new THREE.Points(geom, mat);
        group.add(points);
      } else if (body.type === BODY_TYPES.RING) {
        // Skip — rings are handled on the planet
        continue;
      } else if (body.type === BODY_TYPES.ASTEROID) {
        const radius = Math.max(0.1, body.radius * 2);
        const geom = new THREE.OctahedronGeometry(radius, 0);
        const mat = new THREE.MeshBasicMaterial({
          color: body.valuable ? 0xffaa44 : 0x554433,
          wireframe: true,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);
      }

      // Create orbit line
      if (body.orbitRadius > 0 && body.type !== BODY_TYPES.RING) {
        const orbitGeom = new THREE.BufferGeometry();
        const segments = 64;
        const orbitPositions = new Float32Array((segments + 1) * 3);
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          orbitPositions[i * 3] = Math.cos(a) * body.orbitRadius;
          orbitPositions[i * 3 + 1] = 0;
          orbitPositions[i * 3 + 2] = Math.sin(a) * body.orbitRadius;
        }
        orbitGeom.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
        const orbitMat = new THREE.LineBasicMaterial({
          color: body.type === BODY_TYPES.STAR ? 0x553300 : 0x332200,
          transparent: true,
          opacity: 0.4,
        });
        const orbitLine = new THREE.Line(orbitGeom, orbitMat);
        scene.add(orbitLine);
        orbitLinesRef.current.push(orbitLine);
      }

      scene.add(group);
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

      bodyMeshesRef.current.push({
        body,
        group,
        mesh,
        visualRadius: getVisualRadius(body),
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Build station wireframe models
    for (const station of systemData.stations) {
      const parentBody = allBodies.find(b => b.id === station.parentId);
      if (!parentBody) continue;
      const parentEntry = bodyMeshesRef.current.find(bm => bm.body.id === station.parentId);
      if (!parentEntry) continue;

      const stationModel = buildStationModel(station.type);
      const isGasGiant = parentBody.planetType?.startsWith('gas_giant') || parentBody.planetType?.startsWith('helium');
      const planetVisualRadius = parentBody.type === BODY_TYPES.MOON
        ? Math.max(0.1, Math.min(0.4, parentBody.radius * 0.4))
        : isGasGiant
          ? Math.max(1, Math.min(3, parentBody.radius * 0.12))
          : Math.max(0.3, Math.min(1.2, parentBody.radius * 0.4));
      const stationScale = Math.max(0.03, Math.min(0.1, planetVisualRadius * 0.08));
      stationModel.scale.setScalar(stationScale);

      if (station.isOrbital) {
        // Orbital station — child of planet's group, orbits the planet
        parentEntry.group.add(stationModel);
        stationMeshesRef.current.push({
          station,
          model: stationModel,
          parentBody,
          planetVisualRadius,
          phaseOffset: Math.random() * Math.PI * 2,
        });
      } else {
        // Planetary port — on planet surface, child of planet's mesh so it rotates with the planet
        stationModel.position.set(planetVisualRadius * 0.9, 0, 0);
        if (parentEntry.mesh) {
          parentEntry.mesh.add(stationModel);
        } else {
          parentEntry.group.add(stationModel);
        }
      }
    }

    // Auto-fit camera to system
    const maxOrbit = Math.max(...allBodies.map(b => b.orbitRadius || 0), 20);
    rotState.current.targetDistance = maxOrbit * 2.5;
  }, [systemData]);

  // Pointer interaction
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;

    let isDragging = false;
    let lastX = 0, lastY = 0;
    let pinchDist = 0;
    let dragStartX = 0, dragStartY = 0;
    let lastCentroidX = 0, lastCentroidY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const rs = rotState.current;
      rs.targetAzimuth -= dx * 0.005;
      rs.targetPolar -= dy * 0.005;
      rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
    };

    const onPointerUp = (e) => {
      isDragging = false;
      // Check if this was a click (minimal movement)
      const moveDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      if (moveDist < 5) {
        handleClick(e);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const rs = rotState.current;
      rs.targetDistance += e.deltaY * 0.2;
      rs.targetDistance = Math.max(5, Math.min(500, rs.targetDistance));
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        isDragging = false;
        pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        lastCentroidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastCentroidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      } else if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        dragStartX = lastX;
        dragStartY = lastY;
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = pinchDist - newDist;
        pinchDist = newDist;
        const rs = rotState.current;
        rs.targetDistance += delta * 0.8;
        rs.targetDistance = Math.max(5, Math.min(500, rs.targetDistance));
        // Two-finger pan
        const newCentroidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const newCentroidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const cdx = newCentroidX - lastCentroidX;
        const cdy = newCentroidY - lastCentroidY;
        lastCentroidX = newCentroidX;
        lastCentroidY = newCentroidY;
        const cam = cameraRef.current;
        if (cam && (Math.abs(cdx) > 0.5 || Math.abs(cdy) > 0.5)) {
          focusBodyRef.current = null;
          const forward = new THREE.Vector3();
          cam.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
          const panScale = rs.distance * 0.002;
          rs.targetFocusX -= (cdx * right.x + cdy * forward.x) * panScale;
          rs.targetFocusZ -= (cdx * right.z + cdy * forward.z) * panScale;
        }
      } else if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        const rs = rotState.current;
        rs.targetAzimuth -= dx * 0.005;
        rs.targetPolar -= dy * 0.005;
        rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
      }
    };

    const onTouchEnd = (e) => {
      if (isDragging) {
        const touch = e.changedTouches[0];
        const moveDist = Math.hypot(touch.clientX - dragStartX, touch.clientY - dragStartY);
        if (moveDist < 10) {
          handleClick({ clientX: touch.clientX, clientY: touch.clientY });
        }
      }
      isDragging = false;
      pinchDist = 0;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      raycasterRef.current.params.Points.threshold = 1;

      const meshes = bodyMeshesRef.current
        .filter(bm => bm.mesh)
        .map(bm => bm.mesh);

      const intersects = raycasterRef.current.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const idx = meshes.indexOf(intersects[0].object);
        if (idx >= 0) {
          const bm = bodyMeshesRef.current.filter(bm => bm.mesh)[idx];
          if (bm) {
            handleSelectBody(bm.body);
          }
        }
      }
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
  }, [systemData]);

  const handleSelectBody = useCallback((body) => {
    setSelectedBody(body);
    const entry = bodyMeshesRef.current.find(bm => bm.body.id === body.id);
    focusBodyRef.current = entry || null;
    if (entry && entry.visualRadius) {
      rotState.current.targetDistance = Math.max(entry.visualRadius * 5, 3);
    }
    if (onSelectBody) onSelectBody(body);
  }, [onSelectBody]);

  const handleScan = useCallback(() => {
    if (!selectedBody) return;
    scanBody(selectedBody);
  }, [selectedBody, scanBody]);

  const isScanned = selectedBody && state.scannedBodies[selectedBody.id];

  if (!systemData) {
    return <div className="w-full h-full flex items-center justify-center text-orange-500">LOADING SYSTEM DATA...</div>;
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />

      {/* FSS scan prompt */}
      {state.currentLocation !== 'station' && !state.fssScannedSystems?.[state.currentSystem.seed] && !selectedBody && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-700 bg-black/95 p-4 text-center text-xs space-y-2 z-30">
          <div className="text-cyan-300 font-bold uppercase">FSS Discovery Scanner</div>
          <div className="text-cyan-600 text-[10px] max-w-48">Run a Full Spectrum System scan to discover all stellar bodies in this system.</div>
          <button onClick={fssScanSystem} className="px-4 py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold">
            RUN FSS SCAN
          </button>
        </div>
      )}

      {/* Reset view button */}
      {selectedBody && (
        <button
          onClick={() => {
            focusBodyRef.current = null;
            setSelectedBody(null);
            const maxOrbit = Math.max(...systemData.bodies.map(b => b.orbitRadius || 0), 20);
            rotState.current.targetDistance = maxOrbit * 2.5;
            rotState.current.targetFocusX = 0;
            rotState.current.targetFocusZ = 0;
          }}
          className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 border border-orange-700 bg-black/80 text-orange-400 hover:bg-orange-950/30 text-[10px] z-30"
        >
          ⟲ RESET VIEW
        </button>
      )}

      {/* System info - top left */}
      <div className="absolute top-2 left-2 text-xs space-y-0.5 pointer-events-none">
        <div className="text-orange-300 font-bold">{state.currentSystem.name}</div>
        {!state.settings?.miniScreen && (
          <>
            <div className="text-orange-600">FACTION: {systemData.faction}</div>
            <div className="text-orange-600">ECONOMY: {systemData.economy.name}</div>
            <div className="text-orange-600">BODIES: {systemData.bodyCount}</div>
            {state.fssScannedSystems?.[state.currentSystem.seed] && (() => {
              const scannable = systemData.bodies.filter(b => b.type !== BODY_TYPES.RING);
              const scanned = scannable.filter(b => state.scannedBodies[b.id]).length;
              return <div className="text-cyan-600">SCANNED: {scanned}/{scannable.length}</div>;
            })()}
            <div className="text-orange-600">STARS: {systemData.stars.length}</div>
            <div className="text-orange-800 text-[10px] mt-1">DRAG TO ROTATE · 2-FINGER PAN/PINCH · SCROLL TO ZOOM · TAP BODY</div>
          </>
        )}
      </div>

      {/* Body list - right side (collapsible) */}
      {bodiesCollapsed ? (
        <button onClick={() => setBodiesCollapsed(false)} className="absolute top-2 right-2 border border-orange-900 bg-black/80 p-2 text-xs text-orange-600 hover:text-orange-400">◀ BODIES</button>
      ) : (
      <div className="absolute top-2 right-2 bottom-2 w-40 sm:w-48 overflow-y-auto border border-orange-900/50 bg-black/80 p-2 text-xs space-y-0.5">
        <div className="flex items-center justify-between border-b border-orange-900 pb-1 mb-1">
          <span className="text-orange-700 uppercase text-[10px]">Celestial Bodies</span>
          <button onClick={() => setBodiesCollapsed(true)} className="text-orange-700 hover:text-orange-400 text-[10px]">▶</button>
        </div>
        {systemData.bodies.filter(b => b.type !== BODY_TYPES.RING).map((body) => (
          <div key={body.id}>
            <button
              onClick={() => handleSelectBody(body)}
              className={`w-full text-left px-1.5 py-1 border transition-all ${
                selectedBody?.id === body.id
                  ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                  : 'border-transparent text-orange-600 hover:border-orange-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: body.color || '#888' }}
                />
                <span className="truncate">{body.designation}</span>
              </div>
            </button>
            {systemData.stations.filter(s => s.parentId === body.id).map(station => (
              <button
                key={station.id}
                onClick={() => handleSelectBody(body)}
                className="w-full text-left pl-5 py-0.5 text-[10px] text-green-600 hover:text-green-400 flex items-center gap-1"
              >
                <span className="text-green-800">◦</span>
                <span className="truncate">{station.name}</span>
                <span className="text-green-900 text-[9px]">{station.isOrbital ? 'orb' : 'srf'}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      )}

      {/* Station docking panel — shown when in supercruise */}
      {state.currentLocation !== 'station' && systemData.stations.length > 0 && !selectedBody && (
        <div className="absolute bottom-2 left-2 right-44 sm:right-56 border border-green-800 bg-black/95 p-3 text-xs space-y-2">
          <div className="text-green-500 font-bold uppercase text-[10px] border-b border-green-900 pb-1">
            Available Stations — Request Docking
          </div>
          {state.activeMissions?.some(m => m.destinationSystem?.seed === state.currentSystem.seed) && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] border border-yellow-900 bg-yellow-950/20 px-2 py-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              ◉ MISSION TARGET SYSTEM
            </div>
          )}
          <div className="space-y-1">
            {systemData.stations.map(station => (
              <div key={station.id} className="flex items-center justify-between border border-orange-950 p-1.5">
                <div>
                  <div className="text-orange-400">{station.name}</div>
                  <div className="text-orange-700 text-[9px]">{station.parentName} · {station.economy.name}</div>
                </div>
                <button
                  onClick={() => dockAtStation(station.id)}
                  className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold"
                >
                  DOCK
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected body info - bottom */}
      {selectedBody && (
        <div className="absolute bottom-2 left-2 right-44 sm:right-56 border border-orange-700 bg-black/95 p-3 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-orange-900 pb-1">
            <span className="text-orange-300 font-bold">
              {selectedBody.name || selectedBody.designation}
            </span>
            <span className="text-orange-600 text-[10px] uppercase">
              {selectedBody.type}
            </span>
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
          </div>
          {selectedBody.materials && selectedBody.materials.length > 0 && isScanned && (
            <div className="border-t border-orange-900 pt-1">
              <div className="text-orange-700 text-[10px] uppercase mb-1">Surface Materials</div>
              <div className="flex flex-wrap gap-1">
                {selectedBody.materials.slice(0, 8).map(m => (
                  <span key={m.id} className="text-[10px] text-orange-500 border border-orange-900 px-1">
                    {m.id} ({m.concentration.toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            {isScanned ? (
              <span className="text-green-500 text-[10px]">✓ SCANNED — VALUE: {selectedBody.scanValue?.toLocaleString()} CR</span>
            ) : (
              <button
                onClick={handleScan}
                className="px-3 py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[10px]"
              >
                SCAN BODY (+{selectedBody.scanValue?.toLocaleString()} CR)
              </button>
            )}
          </div>
          {selectedBody.landable && state.fssScannedSystems?.[state.currentSystem.seed] && (
            <div className="border-t border-orange-900 pt-1 space-y-1">
              {!state.mappedBodies?.[selectedBody.id] ? (
                <button onClick={() => mapBody(selectedBody.id)} className="w-full py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold">
                  LAUNCH SURFACE PROBES
                </button>
              ) : (
                <>
                  <div className="text-cyan-500 text-[10px]">✓ MAPPED — {selectedBody.surfaceSignals?.length || 0} SURFACE SIGNALS DETECTED</div>
                  {selectedBody.surfaceSignals?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedBody.surfaceSignals.slice(0, 6).map(s => (
                        <span key={s.id} className={`text-[9px] border px-1 ${s.type === 'biological' ? 'border-green-800 text-green-500' : s.type === 'geological' ? 'border-orange-800 text-orange-500' : 'border-cyan-800 text-cyan-500'}`}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { landOnBody(selectedBody.id); if (onNavigate) onNavigate('survey'); }}
                    className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold"
                  >
                    LAND ON SURFACE
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
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