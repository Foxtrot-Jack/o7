// 3D System Orrery — wireframe planetary bodies orbiting in real-time
// Classic Elite-style orrery with rotation and pinch zoom
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES, GUARDIAN_BLUEPRINTS } from '@/lib/system';
import { buildStationModel } from '@/lib/stationModelBuilder';
import { buildShipModel } from '@/lib/shipModelBuilder';
import { buildCustomShipModel, buildCarrierModel, buildGenericCarrierModel } from '@/lib/modelBuilder';
import { SHIP_MAP, SHIP_TYPES, getProbesRequired } from '@/lib/gameState';
import { MODULES } from '@/lib/shipOutfitting';
import CelestialBodyList from './CelestialBodyList';
import MiningPanel from './MiningPanel';
import RadioChatter from './RadioChatter';
import ShipCopilot from './ShipCopilot';
import PlayerStructurePanel from './PlayerStructurePanel';
import { generateBodyDescription } from '@/lib/bodyDescriptions';
import { COMMODITY_MAP } from '@/lib/commodities';
import { colorEnabledFor, monoUIActive, desaturateColor, desaturateObject3D, effectiveTheme } from '@/lib/monoColor';

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
  const shipMeshRef = useRef(null);
  const shipPosRef = useRef({ x: 0, y: 0, z: 5 });
  const travelRef = useRef(null);
  const scoopFrameRef = useRef(0);
  const npcShipsRef = useRef([]);
  const carrierMeshesRef = useRef([]);
  const tempVecRef = useRef(new THREE.Vector3());
  const focusWorldPosRef = useRef(new THREE.Vector3());
  const orbitWorldPosRef = useRef(new THREE.Vector3());
  const lastTravelPctRef = useRef(-1);
  const orbitAnchorRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gridRef = useRef(null);

  const { state, getSystemData, scanBody, dockAtStation, fssScanSystem, mapBody, landOnBody, refuel, addCargo, addMaterial } = useGameState();
  const settings = state.settings || {};
  const effTheme = effectiveTheme(state);
  const monoUI = monoUIActive(settings);
  const starColorsOn = colorEnabledFor('stars', effTheme, settings.monoOverrides);
  const planetColorsOn = colorEnabledFor('planets', effTheme, settings.monoOverrides);
  const shipColorsOn = colorEnabledFor('ships', effTheme, settings.monoOverrides);
  const stationColorsOn = colorEnabledFor('stations', effTheme, settings.monoOverrides);
  const bodyListScale = (settings.uiScale?.bodyList ?? 100) / 100;
  const showShipCopilot = settings.showShipCopilot !== false;
  const showRadioChatter = settings.showRadioChatter !== false;
  const [selectedBody, setSelectedBody] = useState(null);
  const [hoveredBody, setHoveredBody] = useState(null);
  const [bodiesCollapsed, setBodiesCollapsed] = useState(state.settings?.miniScreen || false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [orbitingBodyId, setOrbitingBodyId] = useState(null);
  const [selectedPlayerStructure, setSelectedPlayerStructure] = useState(null);
  const [fssDismissedSeed, setFssDismissedSeed] = useState(null);
  const [scoopActive, setScoopActive] = useState(false);
  const [miningHotspotId, setMiningHotspotId] = useState(null);

  // Player-owned colonies and stations in this system — shown in the body list
  const playerStructures = useMemo(() => {
    if (!state.currentSystem) return [];
    const seed = state.currentSystem.seed;
    const structures = [];
    for (const colony of state.colonies || []) {
      if (colony.systemSeed === seed) {
        structures.push({ id: colony.id, name: colony.name, kind: 'colony', parentBodyId: colony.bodyId || null, data: colony });
      }
    }
    for (const station of state.ownedStations || []) {
      if (station.systemSeed === seed) {
        structures.push({ id: station.id, name: station.name, kind: 'station', parentBodyId: null, data: station });
      }
    }
    return structures;
  }, [state.currentSystem, state.colonies, state.ownedStations]);

  const handleSelectPlayerStructure = useCallback((structure) => {
    setSelectedPlayerStructure(structure);
    setSelectedStation(null);
    setSelectedBody(null);
  }, []);

  // Ref mirror of state so the animation loop (useEffect[]) always reads
  // the latest values instead of a stale first-render closure.
  const stateRef = useRef(state);
  stateRef.current = state;

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Reference grid — horizontal (coplanar with orbits), uniform color to hide center cross
    // Sized dynamically in the build effect to cover the full system view
    const gridHelper = new THREE.GridHelper(200, 20, 0x110800, 0x110800);
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(0.1, (now - (lastTimeRef.current || now)) / 1000);
      lastTimeRef.current = now;
      const t = now * 0.00003;

      // Update body positions FIRST so camera focus tracks current positions (reduces jitter)
      for (const bm of bodyMeshesRef.current) {
        if (bm.visualOrbitRadius > 0) {
          const angle = t * bm.invSqrtOrbit + bm.phaseOffset;
          bm.group.position.x = Math.cos(angle) * bm.visualOrbitRadius;
          bm.group.position.z = Math.sin(angle) * bm.visualOrbitRadius;
          bm.group.position.y = 0;
        }
        if (bm.mesh) {
          bm.mesh.rotation.y += dt * 0.06;
        }
      }

      // Update orbital station positions (surface stations rotate with their parent planet)
      for (const sm of stationMeshesRef.current) {
        if (sm.isSurface) continue;
        const angle = t * sm.invSqrtOrbit + sm.phaseOffset;
        const orbitR = sm.orbitR;
        sm.model.position.x = Math.cos(angle) * orbitR;
        sm.model.position.z = Math.sin(angle) * orbitR;
        sm.model.position.y = 0;
        sm.model.rotation.y += dt * 0.12;
      }

      // Smooth camera AFTER body positions are current
      const rs = rotState.current;
      const sRot = 1 - Math.exp(-dt * 6);
      const sFocus = 1 - Math.exp(-dt * 5);
      rs.azimuth += (rs.targetAzimuth - rs.azimuth) * sRot;
      rs.polar += (rs.targetPolar - rs.polar) * sRot;
      rs.distance += (rs.targetDistance - rs.distance) * sRot;
      rs.focusX += (rs.targetFocusX - rs.focusX) * sFocus;
      rs.focusZ += (rs.targetFocusZ - rs.focusZ) * sFocus;
      if (focusBodyRef.current) {
        const fwp = focusWorldPosRef.current;
        focusBodyRef.current.group.getWorldPosition(fwp);
        rs.targetFocusX = fwp.x;
        rs.targetFocusZ = fwp.z;
      }
      // During ship travel, focus the camera on the ship so it stays in view
      if (travelRef.current && shipPosRef.current) {
        rs.targetFocusX = shipPosRef.current.x;
        rs.targetFocusZ = shipPosRef.current.z;
      }
      updateCameraPosition(camera, rs);

      // Pulse selected marker
      if (selectedMarkerRef.current) {
        const pulse = 1 + Math.sin(now * 0.005) * 0.3;
        selectedMarkerRef.current.scale.set(pulse, pulse, pulse);
      }

      // Ship travel animation
      if (travelRef.current && shipMeshRef.current) {
        const travel = travelRef.current;
        const targetPos = tempVecRef.current;
        if (travel.targetType === 'station') {
          travel.stationModel.getWorldPosition(targetPos);
        } else if (travel.targetType === 'body') {
          travel.bodyEntry.group.getWorldPosition(targetPos);
        }
        const sp = shipPosRef.current;
        const dx = targetPos.x - sp.x;
        const dz = targetPos.z - sp.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.8) {
          const onComplete = travel.onComplete;
          if (travel.targetType === 'body') {
            orbitAnchorRef.current = travel.bodyEntry;
            setOrbitingBodyId(travel.bodyEntry.body.id);
          } else if (travel.targetType === 'station') {
            orbitAnchorRef.current = bodyMeshesRef.current.find(bm => bm.body.id === travel.station.parentId) || null;
            setOrbitingBodyId(travel.station.parentId);
          }
          travelRef.current = null;
          lastTravelPctRef.current = -1;
          setTravelInfo(null);
          if (onComplete) onComplete();
        } else {
          const moveX = (dx / dist) * travel.speed * dt;
          const moveZ = (dz / dist) * travel.speed * dt;
          sp.x += moveX;
          sp.z += moveZ;
          shipMeshRef.current.position.set(sp.x, 0, sp.z);
          shipMeshRef.current.rotation.y = Math.atan2(dx, dz);
          const progress = Math.min(0.99, 1 - dist / travel.initialDist);
          const pct = Math.round(progress * 100);
          if (pct !== lastTravelPctRef.current) {
            lastTravelPctRef.current = pct;
            setTravelInfo(prev => prev ? { ...prev, progress } : null);
          }
        }
      }

      // Ship orbits its anchored body when not traveling
      if (!travelRef.current && shipMeshRef.current && orbitAnchorRef.current) {
        const anchor = orbitAnchorRef.current;
        const awp = orbitWorldPosRef.current;
        anchor.group.getWorldPosition(awp);
        const ax = awp.x;
        const az = awp.z;
        const orbitR = Math.max(1, (anchor.visualRadius || 1) * 2.5);
        const angle = now * 0.0003;
        const ox = ax + Math.cos(angle) * orbitR;
        const oz = az + Math.sin(angle) * orbitR;
        shipPosRef.current.x = ox;
        shipPosRef.current.z = oz;
        shipMeshRef.current.position.set(ox, 0, oz);
        shipMeshRef.current.rotation.y = angle + Math.PI / 2;

        // Fuel scoop — check every 30 frames using latest state via ref
        if (anchor.body.type === BODY_TYPES.STAR) {
          scoopFrameRef.current++;
          if (scoopFrameRef.current >= 30) {
            scoopFrameRef.current = 0;
            const curState = stateRef.current;
            const modules = curState.ship?.modules || {};
            const scoopMod = Object.values(modules).find(id => typeof id === 'string' && id.startsWith('fsc_'));
            if (scoopMod && curState.ship.fuel < curState.ship.fuelCapacity) {
              const scoopSize = parseInt(scoopMod.split('_')[1].replace('a', '')) || 1;
              refuel(scoopSize * 0.5);
            }
          }
        }
      }

      // NPC ship traffic
      for (const npc of npcShipsRef.current) {
        const dx = npc.targetX - npc.x;
        const dz = npc.targetZ - npc.z;
        const nd = Math.hypot(dx, dz);
        if (nd < 1) {
          npc.targetX = (Math.random() - 0.5) * 40;
          npc.targetZ = (Math.random() - 0.5) * 40;
        } else {
          npc.x += (dx / nd) * npc.speed * dt;
          npc.z += (dz / nd) * npc.speed * dt;
          npc.model.position.set(npc.x, 0, npc.z);
          npc.model.rotation.y = Math.atan2(dx, dz);
        }
      }

      // Fleet carriers — slow orbit near system center
      for (const cm of carrierMeshesRef.current) {
        const orbitR = 15;
        const angle = t * 0.15 + cm.phaseOffset;
        cm.model.position.x = Math.cos(angle) * orbitR;
        cm.model.position.z = Math.sin(angle) * orbitR;
        cm.model.position.y = 0;
        cm.model.rotation.y += dt * 0.06;
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

    // Clear old carrier meshes
    for (const cm of carrierMeshesRef.current) {
      scene.remove(cm.model);
      cm.model.traverse(child => { if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose(); });
    }
    carrierMeshesRef.current = [];

    // Create bodies
    const allBodies = systemData.bodies;
    const center = { x: 0, y: 0, z: 0 };
    const bodyGroupMap = {};
    const moonSlotByPlanet = {};

    for (const body of allBodies) {
      // Skip rings — rendered on their parent planet
      if (body.type === BODY_TYPES.RING) continue;
      // Only show FSS-discovered bodies (primary star always visible)
      const isPrimaryStar = body.parent === null && body.type === BODY_TYPES.STAR;
      if (!isPrimaryStar && !state.fssDiscoveredBodies?.[body.id]) continue;

      const group = new THREE.Group();
      let mesh = null;

      if (body.type === BODY_TYPES.STAR) {
        // Star — glowing wireframe sphere (much larger than planets)
        const radius = Math.max(3, Math.min(10, body.radius * 1.2));
        const geom = new THREE.SphereGeometry(radius, 16, 12);
        const starColor = new THREE.Color(body.color);
        if (!starColorsOn) desaturateColor(starColor);
        const mat = new THREE.MeshBasicMaterial({
          color: starColor,
          wireframe: true,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);

        // Glow sprite
        const glowGeom = new THREE.SphereGeometry(radius * 1.5, 8, 6);
        const glowColor = new THREE.Color(body.color);
        if (!starColorsOn) desaturateColor(glowColor);
        const glowMat = new THREE.MeshBasicMaterial({
          color: glowColor,
          transparent: true,
          opacity: 0.15,
        });
        group.add(new THREE.Mesh(glowGeom, glowMat));
      } else if (body.type === BODY_TYPES.PLANET || body.type === BODY_TYPES.MOON) {
        const isGasGiant = body.planetType?.startsWith('gas_giant') || body.planetType?.startsWith('helium');
        const radius = body.type === BODY_TYPES.MOON
          ? Math.max(0.05, Math.min(0.2, body.radius * 0.2))
          : isGasGiant
            ? Math.max(1, Math.min(3, body.radius * 0.12))
            : Math.max(0.3, Math.min(1.2, body.radius * 0.4));
        const geom = new THREE.SphereGeometry(radius, 12, 8);
        const planetColor = new THREE.Color(body.color);
        if (!planetColorsOn) desaturateColor(planetColor);
        const mat = new THREE.MeshBasicMaterial({
          color: planetColor,
          wireframe: true,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);

        // Rings
        if (body.hasRings) {
          const ringGeom = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 24);
          const ringColor = new THREE.Color(0x8a7a5a);
          if (!planetColorsOn) desaturateColor(ringColor);
          const ringMat = new THREE.MeshBasicMaterial({
            color: ringColor,
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
        // Asteroid belt — orbit line only (dots removed to prevent venn-diagram overlap with orbit rings)
      } else if (body.type === BODY_TYPES.ASTEROID) {
        const radius = Math.max(0.1, body.radius * 2);
        const geom = new THREE.OctahedronGeometry(radius, 0);
        const astColor = new THREE.Color(body.valuable ? 0xffaa44 : 0x554433);
        if (!planetColorsOn) desaturateColor(astColor);
        const mat = new THREE.MeshBasicMaterial({
          color: astColor,
          wireframe: true,
        });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);
      } else if (body.type === BODY_TYPES.ALIEN_SITE) {
        const radius = 0.4;
        const geom = new THREE.OctahedronGeometry(radius, 1);
        const alienColor = new THREE.Color(0xaa44ff);
        if (!planetColorsOn) desaturateColor(alienColor);
        const mat = new THREE.MeshBasicMaterial({ color: alienColor, wireframe: true, transparent: true, opacity: 0.8 });
        mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);
      }

      // Attach to parent's group first so the orbital hierarchy is correct
      // (moons orbit their planet, planets orbit their star) and the parent group
      // is available to attach the orbit line to.
      const parentGroup = body.parent ? bodyGroupMap[body.parent] : null;
      if (parentGroup) parentGroup.add(group); else scene.add(group);
      bodyGroupMap[body.id] = group;

      const getVisualRadius = (b) => {
        if (b.type === BODY_TYPES.STAR) return Math.max(3, Math.min(10, b.radius * 1.2));
        if (b.type === BODY_TYPES.PLANET) {
          const gg = b.planetType?.startsWith('gas_giant') || b.planetType?.startsWith('helium');
          return gg ? Math.max(1, Math.min(3, b.radius * 0.12)) : Math.max(0.3, Math.min(1.2, b.radius * 0.4));
        }
        if (b.type === BODY_TYPES.MOON) return Math.max(0.05, Math.min(0.2, b.radius * 0.2));
        if (b.type === BODY_TYPES.ASTEROID) return Math.max(0.1, b.radius * 2);
        return 1;
      };
      const visualRadius = getVisualRadius(body);

      // Visual orbit radius is parent-relative so distances look realistic:
      // moons hug their planet, planets keep their generated distance from the star,
      // and asteroids scatter near their belt.
      const parentEntry = body.parent ? bodyMeshesRef.current.find(bm => bm.body.id === body.parent) : null;
      let visualOrbitRadius = 0;
      if (body.orbitRadius > 0) {
        if (parentEntry && parentEntry.body.type === BODY_TYPES.PLANET) {
          const slot = moonSlotByPlanet[body.parent] = (moonSlotByPlanet[body.parent] || 0) + 1;
          visualOrbitRadius = Math.max(parentEntry.visualRadius * 1.6, parentEntry.visualRadius * (1.5 + slot * 0.7));
        } else if (parentEntry && parentEntry.body.type === BODY_TYPES.BELT) {
          visualOrbitRadius = (Math.random() - 0.5) * 4;
        } else {
          visualOrbitRadius = body.orbitRadius;
        }
      }

      // Orbit line drawn around the parent so a moon's ring follows its planet, not the star.
      if (visualOrbitRadius > 0 && body.type !== BODY_TYPES.RING && body.type !== BODY_TYPES.ASTEROID) {
        const orbitGeom = new THREE.BufferGeometry();
        const segments = 64;
        const orbitPositions = new Float32Array((segments + 1) * 3);
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          orbitPositions[i * 3] = Math.cos(a) * visualOrbitRadius;
          orbitPositions[i * 3 + 1] = 0;
          orbitPositions[i * 3 + 2] = Math.sin(a) * visualOrbitRadius;
        }
        orbitGeom.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
        const orbitMat = new THREE.LineBasicMaterial({
          color: body.type === BODY_TYPES.STAR ? 0x553300 : 0x332200,
          transparent: true,
          opacity: 0.4,
        });
        const orbitLine = new THREE.Line(orbitGeom, orbitMat);
        (parentGroup || scene).add(orbitLine);
        orbitLinesRef.current.push(orbitLine);
      }

      bodyMeshesRef.current.push({
        body,
        group,
        mesh,
        visualRadius,
        visualOrbitRadius,
        phaseOffset: Math.random() * Math.PI * 2,
        invSqrtOrbit: visualOrbitRadius > 0 ? 1 / Math.sqrt(visualOrbitRadius) : 0,
      });
    }

    // Build station wireframe models
    for (const station of systemData.stations) {
      const parentBody = allBodies.find(b => b.id === station.parentId);
      if (!parentBody) continue;
      const parentEntry = bodyMeshesRef.current.find(bm => bm.body.id === station.parentId);
      if (!parentEntry) continue;

      const stationModel = buildStationModel(station.type);
      if (!stationColorsOn) desaturateObject3D(stationModel);
      const isGasGiant = parentBody.planetType?.startsWith('gas_giant') || parentBody.planetType?.startsWith('helium');
      const planetVisualRadius = parentBody.type === BODY_TYPES.MOON
        ? Math.max(0.05, Math.min(0.2, parentBody.radius * 0.2))
        : isGasGiant
          ? Math.max(1, Math.min(3, parentBody.radius * 0.12))
          : Math.max(0.3, Math.min(1.2, parentBody.radius * 0.4));
      const stationScale = Math.max(0.03, Math.min(0.1, planetVisualRadius * 0.08));
      stationModel.scale.setScalar(stationScale);

      if (station.isOrbital) {
        // Orbital station — child of planet's group, orbits the planet
        parentEntry.group.add(stationModel);
        const _orbitR = planetVisualRadius * 2.5;
        stationMeshesRef.current.push({
          station,
          model: stationModel,
          parentBody,
          planetVisualRadius,
          orbitR: _orbitR,
          invSqrtOrbit: 0.5 / Math.sqrt(Math.max(0.01, _orbitR)),
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
        stationMeshesRef.current.push({
          station,
          model: stationModel,
          parentBody,
          planetVisualRadius,
          phaseOffset: 0,
          isSurface: true,
        });
      }
    }

    // Build player ship model
    if (shipMeshRef.current) {
      scene.remove(shipMeshRef.current);
      shipMeshRef.current.traverse(child => { if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose(); });
    }
    let shipModel;
    if (state.ship.type === 'custom' && state.ship.customShipId) {
      const customDesign = (state.customShips || []).find(s => s.id === state.ship.customShipId);
      shipModel = customDesign ? buildCustomShipModel(customDesign, 0x00ff88) : buildShipModel(2);
    } else {
      const shipType = SHIP_MAP[state.ship.type];
      const shipClass = shipType?.class || 1;
      shipModel = buildShipModel(shipClass);
    }
    if (!shipColorsOn) desaturateObject3D(shipModel);
    shipModel.scale.setScalar(0.25);
    scene.add(shipModel);
    shipMeshRef.current = shipModel;
    // Determine the body the ship should orbit — station's parent if docked, last surface body if returning, else primary star
    let anchorBody = null;
    if (state.currentLocation === 'station' && state.currentStationId) {
      const dockStation = systemData.stations.find(s => s.id === state.currentStationId);
      if (dockStation) {
        anchorBody = bodyMeshesRef.current.find(bm => bm.body.id === dockStation.parentId) || null;
      }
    } else if (state.lastOrbitBodyId) {
      anchorBody = bodyMeshesRef.current.find(bm => bm.body.id === state.lastOrbitBodyId) || null;
    }
    if (!anchorBody) anchorBody = bodyMeshesRef.current[0] || null;
    orbitAnchorRef.current = anchorBody;
    setOrbitingBodyId(anchorBody?.body?.id || null);
    // Initial position — at the anchored body
    if (anchorBody) {
      const swp = new THREE.Vector3();
      anchorBody.group.getWorldPosition(swp);
      shipPosRef.current = { x: swp.x, y: 0, z: swp.z };
    } else {
      shipPosRef.current = { x: 0, y: 0, z: 5 };
    }
    shipModel.position.set(shipPosRef.current.x, 0, shipPosRef.current.z);
    travelRef.current = null;
    setTravelInfo(null);

    // Create NPC traffic
    for (const sm of npcShipsRef.current) {
      scene.remove(sm.model);
      sm.model.traverse(child => { if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose(); });
    }
    npcShipsRef.current = [];
    const popBoost = (state.currentSystem.population || 0) > 0 ? 2 : 0;
    const numNpc = Math.min(8, Math.max(0, Math.floor((systemData.stations.length || 1) * 1.5) + popBoost));
    const npcShipTypes = SHIP_TYPES.filter(s => s.cost > 0);
    for (let i = 0; i < numNpc; i++) {
      const npcType = npcShipTypes[Math.floor(Math.random() * npcShipTypes.length)] || SHIP_TYPES[0];
      const npcModel = buildShipModel(npcType.class);
      if (!shipColorsOn) desaturateObject3D(npcModel);
      npcModel.scale.setScalar(0.2);
      scene.add(npcModel);
      npcShipsRef.current.push({
        model: npcModel,
        x: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40,
        targetX: (Math.random() - 0.5) * 40,
        targetZ: (Math.random() - 0.5) * 40,
        speed: 2 + Math.random() * 3,
      });
    }

    // Build fleet carrier models for carriers parked in this system
    for (const cm of carrierMeshesRef.current) {
      scene.remove(cm.model);
      cm.model.traverse(child => { if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose(); });
    }
    carrierMeshesRef.current = [];
    const carriersHere = (state.fleetCarriers || []).filter(c => c.systemSeed === state.currentSystem.seed);
    for (const carrier of carriersHere) {
      const carrierModel = carrier.design
        ? buildCarrierModel(carrier.design, 0xff8800)
        : buildGenericCarrierModel(0xff8800);
      if (!shipColorsOn) desaturateObject3D(carrierModel);
      carrierModel.scale.setScalar(carrier.isGuilded ? 1.5 : 0.5);
      scene.add(carrierModel);
      carrierMeshesRef.current.push({
        model: carrierModel,
        carrier,
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Auto-fit grid to cover full system view
    if (gridRef.current) {
      scene.remove(gridRef.current);
      gridRef.current.geometry.dispose();
      gridRef.current.material.dispose();
    }
    const maxOrbit = Math.max(...allBodies.map(b => b.orbitRadius || 0), 20);
    const gridSize = Math.max(400, maxOrbit * 6);
    const gridDivisions = Math.min(80, Math.max(20, Math.floor(gridSize / 25)));
    const newGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x110800, 0x110800);
    scene.add(newGrid);
    gridRef.current = newGrid;

    // Auto-fit camera to system
    rotState.current.targetDistance = maxOrbit * 2.5;
  }, [systemData, state.ship?.type, state.ship?.customShipId, state.fleetCarriers?.filter(c => c.systemSeed === state.currentSystem?.seed).length, state.fssDiscoveredBodies, starColorsOn, planetColorsOn, shipColorsOn, stationColorsOn]);

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
      rs.targetDistance = Math.max(0.3, Math.min(500, rs.targetDistance));
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
        rs.targetDistance = Math.max(0.3, Math.min(500, rs.targetDistance));
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

      const stationModels = stationMeshesRef.current
        .filter(sm => sm.model)
        .map(sm => sm.model);

      const bodyIntersects = raycasterRef.current.intersectObjects(meshes, false);
      const stationIntersects = raycasterRef.current.intersectObjects(stationModels, true);

      if (bodyIntersects.length > 0 && (stationIntersects.length === 0 || bodyIntersects[0].distance <= stationIntersects[0].distance)) {
        const idx = meshes.indexOf(bodyIntersects[0].object);
        if (idx >= 0) {
          const bm = bodyMeshesRef.current.filter(bm => bm.mesh)[idx];
          if (bm) {
            handleSelectBody(bm.body);
          }
        }
      } else if (stationIntersects.length > 0) {
        let hitStation = null;
        for (const sm of stationMeshesRef.current) {
          const hits = raycasterRef.current.intersectObject(sm.model, true);
          if (hits.length > 0) { hitStation = sm.station; break; }
        }
        if (hitStation) {
          handleSelectStation(hitStation);
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
    setSelectedStation(null);
    setSelectedPlayerStructure(null);
    // Rings have no mesh — focus on their parent planet instead
    const lookupId = body.type === BODY_TYPES.RING ? body.parent : body.id;
    const entry = bodyMeshesRef.current.find(bm => bm.body.id === lookupId);
    focusBodyRef.current = entry || null;
    if (entry && entry.visualRadius) {
      rotState.current.targetDistance = Math.max(entry.visualRadius * 5, 3);
    }
    if (onSelectBody) onSelectBody(body);
  }, [onSelectBody]);

  const handleSelectStation = useCallback((station) => {
    setSelectedStation(station);
    setSelectedBody(null);
    setSelectedPlayerStructure(null);
    const parentEntry = bodyMeshesRef.current.find(bm => bm.body.id === station.parentId);
    focusBodyRef.current = parentEntry || null;
    if (parentEntry && parentEntry.visualRadius) {
      rotState.current.targetDistance = Math.max(parentEntry.visualRadius * 5, 3);
    }
  }, []);

  const getShipSpeed = () => {
    const shipType = SHIP_MAP[state.ship?.type];
    const shipClass = shipType?.class || (state.ship?.type === 'custom' ? 2 : 1);
    // Base cruise speed — drastically reduced so in-system travel takes time,
    // giving a real reason to upgrade thrusters and apply Dirty Drive engineering.
    const baseByClass = { 1: 3.0, 2: 2.6, 3: 2.2, 4: 1.8, 5: 1.5, 6: 1.2 };
    let speed = baseByClass[shipClass] ?? 1.8;
    // Thruster module quality: A-grade (~2x class E) and pre-engineered drives push speed up.
    const thrModId = state.ship?.modules?.core_thr;
    const thrMod = MODULES[thrModId];
    if (thrMod && thrMod.thrust) {
      const stockThrust = (thrMod.size || 4) * 10 * 0.7;
      speed *= Math.max(0.5, thrMod.thrust / stockThrust);
    }
    // Dirty Drive engineering adds up to +50% thrust at grade 5.
    const eng = state.ship?.modules?.__engineering?.core_thr;
    if (eng && eng.blueprint === 'dirty_drive') {
      speed *= (1 + (eng.level || 0) * 0.1);
    }
    return Math.max(0.4, speed);
  };

  const handleTravelToStation = useCallback((station) => {
    const sm = stationMeshesRef.current.find(s => s.station.id === station.id);
    if (!sm) return;
    const targetPos = new THREE.Vector3();
    sm.model.getWorldPosition(targetPos);
    const dist = Math.hypot(targetPos.x - shipPosRef.current.x, targetPos.z - shipPosRef.current.z);
    if (dist < 0.8) {
      dockAtStation(station.id);
      return;
    }
    setOrbitingBodyId(null);
    travelRef.current = {
      targetType: 'station',
      stationModel: sm.model,
      station,
      speed: getShipSpeed(),
      initialDist: dist,
      onComplete: () => dockAtStation(station.id),
    };
    lastTravelPctRef.current = -1;
    setTravelInfo({ target: station.name, type: 'Docking', progress: 0 });
    setSelectedStation(null);
  }, [dockAtStation, state.ship?.type]);

  const handleTravelToBody = useCallback((body) => {
    // Rings have no mesh — travel to the parent planet instead
    const lookupId = body.type === BODY_TYPES.RING ? body.parent : body.id;
    const entry = bodyMeshesRef.current.find(bm => bm.body.id === lookupId);
    if (!entry) return;
    const worldPos = new THREE.Vector3();
    entry.group.getWorldPosition(worldPos);
    const dist = Math.hypot(worldPos.x - shipPosRef.current.x, worldPos.z - shipPosRef.current.z);
    if (dist < 0.8) return;
    setOrbitingBodyId(null);
    travelRef.current = {
      targetType: 'body',
      bodyEntry: entry,
      body,
      speed: getShipSpeed(),
      initialDist: dist,
      onComplete: null,
    };
    lastTravelPctRef.current = -1;
    setTravelInfo({ target: body.name || body.designation, type: 'In Transit', progress: 0 });
  }, [state.ship?.type]);

  const handleScan = useCallback(() => {
    if (!selectedBody) return;
    scanBody(selectedBody);
  }, [selectedBody, scanBody]);

  const handleMineHotspot = useCallback((hs) => {
    const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
    const cargoCapacity = state.ship?.cargoCapacity ?? 0;
    if (cargoUsed >= cargoCapacity) return;
    setMiningHotspotId(hs.id);
    setTimeout(() => {
      const yieldQty = Math.max(1, Math.round((1 + Math.random() * 3) * 10) / 10);
      addMaterial(hs.materialId, yieldQty);
      addCargo(hs.materialId, Math.floor(yieldQty));
      setMiningHotspotId(null);
    }, 1500);
  }, [state.ship, addCargo, addMaterial]);

  const isScanned = selectedBody && state.scannedBodies[selectedBody.id];

  // ---- FUEL SCOOPING ----
  // Scoopable main-sequence star classes (not brown dwarfs, neutron stars, white dwarfs, black holes)
  const SCOOPABLE_STARS = ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'RG'];

  // Find equipped fuel scoop module
  const fuelScoopModule = useMemo(() => {
    const modules = state.ship?.modules || {};
    for (const [key, modId] of Object.entries(modules)) {
      if (!key.startsWith('opt_')) continue;
      const mod = MODULES[modId];
      if (mod && mod.type === 'fuel_scoop') return mod;
    }
    return null;
  }, [state.ship?.modules]);

  // Effective scoop rate in T/s — scaled from module scoopRate so bigger tanks take meaningful time
  const scoopRatePerSec = fuelScoopModule ? fuelScoopModule.scoopRate * 0.15 : 0;

  // Is the orbiting body a scoopable star?
  const orbitingScoopableStar = useMemo(() => {
    if (!orbitingBodyId || !systemData) return null;
    const body = systemData.bodies.find(b => b.id === orbitingBodyId);
    if (body && body.type === BODY_TYPES.STAR && SCOOPABLE_STARS.includes(body.starClass?.class)) return body;
    return null;
  }, [orbitingBodyId, systemData]);

  const fuelFull = (state.ship?.fuel ?? 0) >= (state.ship?.fuelCapacity ?? 0);
  const canFuelScoop = !!(fuelScoopModule && orbitingScoopableStar && !fuelFull && !travelInfo);

  // Fuel scoop ticking — adds fuel incrementally while active
  useEffect(() => {
    if (!scoopActive) return;
    if (!fuelScoopModule || !orbitingScoopableStar) { setScoopActive(false); return; }
    const TICK_MS = 100;
    const fuelPerTick = scoopRatePerSec * (TICK_MS / 1000);
    const interval = setInterval(() => {
      const cur = stateRef.current.ship?.fuel ?? 0;
      const cap = stateRef.current.ship?.fuelCapacity ?? 0;
      if (cur >= cap) { setScoopActive(false); return; }
      refuel(fuelPerTick);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [scoopActive, fuelScoopModule, orbitingScoopableStar, scoopRatePerSec, refuel]);

  // Stop scooping if we leave orbit or travel
  useEffect(() => {
    if (scoopActive && (!orbitingScoopableStar || travelInfo)) setScoopActive(false);
  }, [orbitingScoopableStar, travelInfo, scoopActive]);

  if (!systemData) {
    return <div className="w-full h-full flex items-center justify-center text-orange-500">LOADING SYSTEM DATA...</div>;
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />

      {/* UI overlays — greyscaled in monochrome; the 3D canvas keeps its color */}
      <div className={`crt-overlays absolute inset-0 z-20 ${monoUI ? 'crt-mono-ui' : ''}`}>

      {/* FSS scan prompt */}
      {state.currentLocation !== 'station' && !state.fssScannedSystems?.[state.currentSystem?.seed] && !selectedBody && fssDismissedSeed !== state.currentSystem?.seed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-700 bg-black/95 p-4 text-center text-xs space-y-2 z-30">
          <button onClick={() => setFssDismissedSeed(state.currentSystem?.seed)} className="absolute top-1 right-1 text-cyan-700 hover:text-cyan-400 text-[10px]">✕</button>
          <div className="text-cyan-300 font-bold uppercase">FSS Discovery Scanner</div>
          <div className="text-cyan-600 text-[10px] max-w-48">Run a Full Spectrum System scan to discover all stellar bodies in this system.</div>
          <button onClick={() => onNavigate('fss')} className="px-4 py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold">
            OPEN FSS SCANNER
          </button>
        </div>
      )}

      {/* Fuel scoop indicator */}
      {state.currentLocation !== 'station' && (() => {
        const modules = state.ship?.modules || {};
        const hasScoop = Object.values(modules).some(id => typeof id === 'string' && id.startsWith('fsc_'));
        if (hasScoop && (state.ship?.fuel ?? 0) < (state.ship?.fuelCapacity ?? 0)) {
          return (
            <div className="absolute top-14 right-44 sm:right-56 border border-cyan-700 bg-black/95 px-3 py-1 text-[10px] text-cyan-500 z-30">
              ⚡ FUEL SCOOP READY
            </div>
          );
        }
        return null;
      })()}

      {/* Travel progress */}
      {travelInfo && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 border border-cyan-700 bg-black/95 p-2 text-xs space-y-1 w-64 max-w-[80%] z-30">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-bold uppercase text-[10px]">{travelInfo.type}</span>
            <span className="text-cyan-500 text-[10px]">{Math.round(travelInfo.progress * 100)}%</span>
          </div>
          <div className="text-cyan-600 text-[10px]">→ {travelInfo.target}</div>
          <div className="w-full h-1.5 bg-black border border-cyan-900">
            <div className="h-full bg-cyan-600 transition-all" style={{ width: `${travelInfo.progress * 100}%` }} />
          </div>
        </div>
      )}

      {/* Reset view button */}
      {selectedBody && (
        <button
          onClick={() => {
            focusBodyRef.current = null;
            setSelectedBody(null);
            setSelectedStation(null);
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
        <div className="text-orange-300 font-bold">{state.currentSystem?.name || '---'}</div>
        {!state.settings?.miniScreen && (
          <>
            <div className="text-orange-600">FACTION: {systemData.faction}</div>
            <div className="text-orange-600">ECONOMY: {systemData.economy.name}</div>
            <div className="text-orange-600">MAPPED: {(() => {
              const mappable = systemData.bodies.filter(b => b.type === 'planet' || b.type === 'moon');
              const mapped = mappable.filter(b => state.mappedBodies?.[b.id]?.mapped).length;
              return `${mapped}/${mappable.length}`;
            })()}</div>
            {(() => {
              const scannable = systemData.bodies.filter(b => b.type === 'star' || b.type === 'planet' || b.type === 'moon' || b.type === 'belt' || b.type === 'alien_site');
              const fssCount = scannable.filter(b => state.fssDiscoveredBodies?.[b.id]).length;
              return <div className="text-cyan-600">FSS: {fssCount}/{scannable.length}</div>;
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
      <div className="absolute top-2 right-2 bottom-2 w-40 sm:w-48 overflow-y-auto border border-orange-900/50 bg-black/80 p-2 text-xs space-y-0.5" style={{ zoom: bodyListScale }}>
        <div className="flex items-center justify-between border-b border-orange-900 pb-1 mb-1">
          <span className="text-orange-700 uppercase text-[10px]">Celestial Bodies</span>
          <button onClick={() => setBodiesCollapsed(true)} className="text-orange-700 hover:text-orange-400 text-[10px]">▶</button>
        </div>
        <CelestialBodyList
          systemData={systemData}
          selectedBody={selectedBody}
          selectedStation={selectedStation}
          selectedPlayerStructure={selectedPlayerStructure}
          onSelectBody={handleSelectBody}
          onSelectStation={handleSelectStation}
          fssDiscoveredBodies={state.fssDiscoveredBodies}
          scannedBodies={state.scannedBodies}
          probeProgress={state.probeProgress}
          playerStructures={playerStructures}
          onSelectPlayerStructure={handleSelectPlayerStructure}
        />
      </div>
      )}

      {/* Ship AI copilot + radio chatter — stacked above the info panel */}
      <div className="absolute bottom-2 left-2 right-44 sm:right-56 z-20 flex flex-col gap-1 max-h-[85vh] overflow-y-auto">
      {(showShipCopilot || showRadioChatter) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 shrink-0">
          {showShipCopilot && <ShipCopilot />}
          {showRadioChatter && <RadioChatter />}
        </div>
      )}

      {/* Station docking panel — shown when in supercruise */}
      {state.currentLocation !== 'station' && systemData.stations.length > 0 && !selectedBody && !selectedStation && !selectedPlayerStructure && (
        <div className="border border-green-800 bg-black/95 p-3 text-xs space-y-2 shrink-0">
          <div className="text-green-500 font-bold uppercase text-[10px] border-b border-green-900 pb-1">
            Available Stations — Request Docking
          </div>
          {state.activeMissions?.some(m => m.destinationSystem?.seed === state.currentSystem?.seed) && (
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
                  onClick={() => handleTravelToStation(station)}
                  disabled={!!travelInfo}
                  className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-50"
                >
                  {travelInfo ? '···' : 'DOCK'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player-owned colony / station info + actions */}
      {selectedPlayerStructure && (
        <PlayerStructurePanel
          structure={selectedPlayerStructure}
          systemData={systemData}
          orbitingBodyId={orbitingBodyId}
          travelInfo={travelInfo}
          onTravelToStation={handleTravelToStation}
          onTravelToBody={handleTravelToBody}
          onNavigate={onNavigate}
          onClose={() => setSelectedPlayerStructure(null)}
        />
      )}

      {/* Selected station info - bottom */}
      {selectedStation && (
        <div className="border border-green-700 bg-black/95 p-3 text-xs space-y-2 shrink-0">
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
          </div>
          <button
            onClick={() => handleTravelToStation(selectedStation)}
            disabled={!!travelInfo}
            className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-50"
          >
            {travelInfo ? `TRAVELING — ${Math.round(travelInfo.progress * 100)}%` : '⚡ TRAVEL & DOCK'}
          </button>
        </div>
      )}

      {/* Selected body info - bottom */}
      {selectedBody && (
        <div className="border border-orange-700 bg-black/95 p-3 text-xs space-y-2 shrink-0">
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
            {selectedBody.type === BODY_TYPES.ALIEN_SITE && (
              <>
                <div className="col-span-2 text-purple-400 font-bold uppercase text-[10px]">{selectedBody.alienSubtype?.replace(/_/g, ' ') || 'Alien Remnant'}</div>
                <div>BLUEPRINT: <span className="text-purple-300">{(GUARDIAN_BLUEPRINTS.find(b => b.id === selectedBody.guardianBlueprint) || {}).name || selectedBody.guardianBlueprint}</span></div>
                <div>VALUE: <span className="text-orange-300">{selectedBody.scanValue?.toLocaleString()} CR</span></div>
              </>
            )}
            {selectedBody.elementComposition?.length > 0 && (
              <div className="col-span-2 border-t border-orange-900/50 pt-1 mt-1">
                <div className="text-orange-700 uppercase text-[10px] mb-1">Elemental Composition</div>
                <div className="flex flex-wrap gap-1">
                  {selectedBody.elementComposition.map(el => (
                    <span key={el.symbol} className="text-[9px] border border-orange-950 text-orange-500 px-1">{el.symbol} {el.percentage}%</span>
                  ))}
                </div>
              </div>
            )}
            {selectedBody.type === BODY_TYPES.RING && (
              <>
                <div>TYPE: <span className="text-orange-300 capitalize">{selectedBody.ringType || 'rocky'} Ring</span></div>
                <div>HOTSPOTS: <span className="text-orange-300">{selectedBody.hotspots?.length || 0}</span></div>
                {(() => {
                  const parentScanned = state.scannedBodies?.[selectedBody.parent];
                  if (!parentScanned) return <div className="text-orange-700 text-[10px] text-center py-1">⚠ SCAN PARENT PLANET TO REVEAL HOTSPOTS</div>;
                  return (selectedBody.hotspots || []).map(hs => {
                    const inOrbit = orbitingBodyId === selectedBody.parent;
                    const matName = COMMODITY_MAP[hs.materialId]?.name || hs.materialId;
                    const isMining = miningHotspotId === hs.id;
                    return (
                      <button
                        key={hs.id}
                        onClick={() => handleMineHotspot(hs)}
                        disabled={!inOrbit || isMining}
                        className={`w-full flex items-center gap-1 py-0.5 px-1 text-[10px] border transition-all ${
                          inOrbit
                            ? 'border-amber-700 text-amber-400 hover:bg-amber-950/30 disabled:opacity-50'
                            : 'border-transparent text-amber-600'
                        }`}
                      >
                        <span className="flex-1 text-left">{matName} — Hotspot ✓</span>
                        {inOrbit && (
                          <span className="text-amber-700">{isMining ? '...' : '[MINE]'}</span>
                        )}
                      </button>
                    );
                  });
                })()}
              </>
            )}
          </div>
          {/* Mining panel — space mining only (rings & asteroid belts) */}
          {(() => {
            const isMinable = selectedBody.type === BODY_TYPES.RING ||
              selectedBody.type === BODY_TYPES.BELT;
            if (!isMinable || !selectedBody.materials || selectedBody.materials.length === 0) return null;
            const isRing = selectedBody.type === BODY_TYPES.RING;
            const inOrbit = isRing
              ? orbitingBodyId === selectedBody.parent
              : orbitingBodyId === selectedBody.id;
            if (!inOrbit) return null;
            const miningBody = isRing
              ? { ...selectedBody, _parentName: systemData.bodies.find(b => b.id === selectedBody.parent)?.designation }
              : selectedBody;
            return <MiningPanel body={miningBody} />;
          })()}
          {/* Surface deposits — require SRV (land first) */}
          {selectedBody.type === BODY_TYPES.PLANET && selectedBody.landable && selectedBody.materials?.length > 0 && orbitingBodyId === selectedBody.id && (
            <div className="border-t border-orange-900 pt-1">
              <div className="text-cyan-700 text-[10px] text-center py-1">⚠ SURFACE DEPOSITS — LAND AND DEPLOY SRV TO MINE</div>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            {isScanned ? (
              <span className={selectedBody.type === BODY_TYPES.ALIEN_SITE ? 'text-purple-400 text-[10px]' : 'text-green-500 text-[10px]'}>✓ SCANNED — VALUE: {selectedBody.scanValue?.toLocaleString()} CR{selectedBody.type === BODY_TYPES.ALIEN_SITE ? ` · BLUEPRINT: ${(GUARDIAN_BLUEPRINTS.find(b => b.id === selectedBody.guardianBlueprint) || {}).name || ''}` : ''}</span>
            ) : orbitingBodyId === (selectedBody.type === BODY_TYPES.RING ? selectedBody.parent : selectedBody.id) ? (
              <button
                onClick={handleScan}
                className={`px-3 py-1 border ${selectedBody.type === BODY_TYPES.ALIEN_SITE ? 'border-purple-500 text-purple-300 hover:bg-purple-950/50' : 'border-orange-500 text-orange-300 hover:bg-orange-950/50'} text-[10px]`}
              >
                {selectedBody.type === BODY_TYPES.ALIEN_SITE ? `⊕ SCAN — GUARDIAN BLUEPRINT (+${selectedBody.scanValue?.toLocaleString()} CR)` : `SCAN BODY (+${selectedBody.scanValue?.toLocaleString()} CR)`}
              </button>
            ) : (
              <span className="text-orange-700 text-[10px]">⚠ MUST BE IN ORBIT TO SCAN — TRAVEL TO THIS BODY FIRST</span>
            )}
          </div>
          {(() => {
            const isRing = selectedBody.type === BODY_TYPES.RING;
            const inOrbit = isRing
              ? orbitingBodyId === selectedBody.parent
              : orbitingBodyId === selectedBody.id;
            return inOrbit ? (
              <div className="w-full py-1.5 border border-cyan-800 text-cyan-500 text-[10px] text-center">✓ IN ORBIT</div>
            ) : (
              <button
                onClick={() => handleTravelToBody(selectedBody)}
                disabled={!!travelInfo}
                className="w-full py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold disabled:opacity-50"
              >
                {travelInfo ? `TRAVELING — ${Math.round(travelInfo.progress * 100)}%` : '⚡ TRAVEL TO BODY'}
              </button>
            );
          })()}
          {/* Fuel scoop panel — shown when orbiting a scoopable star with a fuel scoop equipped */}
          {selectedBody.type === BODY_TYPES.STAR && orbitingBodyId === selectedBody.id && (() => {
            const starClass = selectedBody.starClass?.class;
            const isScoopable = SCOOPABLE_STARS.includes(starClass);
            const currentFuel = state.ship?.fuel ?? 0;
            const fuelCap = state.ship?.fuelCapacity ?? 0;
            const fuelPct = fuelCap > 0 ? Math.min(100, (currentFuel / fuelCap) * 100) : 0;
            if (!fuelScoopModule) {
              return (
                <div className="border-t border-orange-900 pt-1 space-y-1">
                  <div className="text-orange-700 text-[10px] uppercase">Fuel Scoop</div>
                  <div className="text-orange-800 text-[10px] text-center py-1">⚠ NO FUEL SCOOP EQUIPPED — VISIT OUTFITTING</div>
                </div>
              );
            }
            if (!isScoopable) {
              return (
                <div className="border-t border-orange-900 pt-1 space-y-1">
                  <div className="text-orange-700 text-[10px] uppercase">Fuel Scoop</div>
                  <div className="text-red-700 text-[10px] text-center py-1">✗ {starClass}-CLASS STAR NOT SCOOPABLE</div>
                </div>
              );
            }
            return (
              <div className="border-t border-orange-900 pt-1 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-orange-500 uppercase">Fuel Scoop — {fuelScoopModule.name}</span>
                  <span className="text-orange-600">{scoopRatePerSec.toFixed(1)} T/s</span>
                </div>
                {/* Fuel level bar */}
                <div className="w-full h-3 bg-black border border-orange-950 relative">
                  <div
                    className={`h-full transition-all ${scoopActive ? 'bg-green-600' : 'bg-orange-600'}`}
                    style={{ width: `${fuelPct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] text-orange-300">
                    {currentFuel.toFixed(1)} / {fuelCap} T
                  </span>
                </div>
                {scoopActive ? (
                  <>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-green-500 animate-pulse">◉ SCOOPING — {scoopRatePerSec.toFixed(1)} T/s</span>
                      <span className="text-green-600">{((fuelCap - currentFuel) / scoopRatePerSec).toFixed(0)}s to full</span>
                    </div>
                    <button
                      onClick={() => setScoopActive(false)}
                      className="w-full py-1.5 border border-red-700 text-red-400 hover:bg-red-950/30 text-[10px] font-bold"
                    >
                      ■ STOP SCOOPING
                    </button>
                  </>
                ) : fuelFull ? (
                  <div className="text-green-500 text-[10px] text-center py-1.5">✓ FUEL TANK FULL</div>
                ) : (
                  <button
                    onClick={() => setScoopActive(true)}
                    className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold"
                  >
                    ⛽ START FUEL SCOOPING
                  </button>
                )}
              </div>
            );
          })()}
          {selectedBody.landable && state.fssDiscoveredBodies?.[selectedBody.id] && (() => {
            const probeState = state.probeProgress?.[selectedBody.id];
            const required = probeState?.required || getProbesRequired(selectedBody);
            const launched = probeState?.launched || 0;
            const complete = probeState?.complete || state.mappedBodies?.[selectedBody.id]?.mapped;
            const probePct = required > 0 ? Math.min(100, Math.round((launched / required) * 100)) : 0;
            return (
              <div className="border-t border-orange-900 pt-1 space-y-1">
                {!complete ? (
                  <>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-cyan-500 uppercase">Surface Scan</span>
                      <span className="text-cyan-600">{launched}/{required} probes · {probePct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black border border-cyan-950">
                      <div className="h-full bg-cyan-600 transition-all" style={{ width: `${probePct}%` }} />
                    </div>
                    {orbitingBodyId === selectedBody.id ? (
                      <button onClick={() => mapBody(selectedBody.id)} className="w-full py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold">
                        🚀 LAUNCH PROBE ({required - launched} remaining)
                      </button>
                    ) : (
                      <div className="text-orange-700 text-[10px] text-center py-1.5">⚠ MUST BE IN ORBIT TO LAUNCH PROBES</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-cyan-500 text-[10px] font-bold">✓ SURFACE SCAN COMPLETE — 100%</div>
                    <div className="border border-orange-950 bg-black/50 p-2 max-h-32 overflow-y-auto">
                      <div className="text-orange-700 text-[9px] uppercase mb-1">Planetary Survey Report</div>
                      <div className="text-orange-500 text-[10px] leading-relaxed">{generateBodyDescription(selectedBody)}</div>
                    </div>
                    {selectedBody.surfaceSignals?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] text-orange-700 uppercase">Signals:</span>
                        {selectedBody.surfaceSignals.slice(0, 6).map(s => (
                          <span key={s.id} className={`text-[9px] border px-1 ${s.type === 'biological' ? 'border-green-800 text-green-500' : s.type === 'geological' ? 'border-orange-800 text-orange-500' : 'border-cyan-800 text-cyan-500'}`}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {orbitingBodyId === selectedBody.id ? (
                      <button
                        onClick={() => { landOnBody(selectedBody.id); if (onNavigate) onNavigate('survey'); }}
                        className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold"
                      >
                        LAND ON SURFACE
                      </button>
                    ) : (
                      <div className="text-orange-700 text-[10px] text-center py-1.5">⚠ MUST BE IN ORBIT TO LAND</div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
      </div>
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