// 3D Galaxy Map — rotatable, pinch-zoomable view of procedurally generated stars
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { generateStarsInRange, distance3D, getStarColor, GALACTIC_RADIUS, generateGalaxyOverview } from '@/lib/galaxy';
import { useGameState } from '@/lib/gameState';

export default function GalaxyMap({ onJumpToSystem }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const pointsRef = useRef(null);
  const playerMarkerRef = useRef(null);
  const selectedRef = useRef(null);
  const selectedLineRef = useRef(null);
  const shipMarkersRef = useRef(null);
  const colonyMarkersRef = useRef(null);
  const trailRef = useRef(null);
  const overviewRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const animationIdRef = useRef(null);

  const { state, setCurrentSystem, addBookmark, removeBookmark } = useGameState();
  const [selectedStar, setSelectedStar] = useState(null);
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [filters, setFilters] = useState({ spectral: 'all', security: 'all', population: 'all', showParkedShips: true, showColonies: true });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showTrail, setShowTrail] = useState(true);

  // Rotation/zoom state
  const rotState = useRef({
    azimuth: 0,
    polar: Math.PI / 3,
    distance: 200,
    targetAzimuth: 0,
    targetPolar: Math.PI / 3,
    targetDistance: 200,
    panX: 0,
    panZ: 0,
    targetPanX: 0,
    targetPanZ: 0,
  });

  // Generate stars around player
  useEffect(() => {
    setLoading(true);
    const center = state.currentSystem;
    const range = 80;
    const generated = generateStarsInRange(center.x, center.y, center.z, range);
    setStars(generated);
    setLoading(false);
  }, [state.currentSystem]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
    updateCameraPosition(camera, rotState.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Add grid for reference
    const gridHelper = new THREE.GridHelper(400, 40, 0x331100, 0x1a0800);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Smooth rotation interpolation
      const rs = rotState.current;
      rs.azimuth += (rs.targetAzimuth - rs.azimuth) * 0.1;
      rs.polar += (rs.targetPolar - rs.polar) * 0.1;
      rs.distance += (rs.targetDistance - rs.distance) * 0.1;
      rs.panX += (rs.targetPanX - rs.panX) * 0.1;
      rs.panZ += (rs.targetPanZ - rs.panZ) * 0.1;
      updateCameraPosition(camera, rs);

      // Pulse player marker
      if (playerMarkerRef.current) {
        const t = Date.now() * 0.003;
        const scale = 1 + Math.sin(t) * 0.3;
        playerMarkerRef.current.scale.set(scale, scale, scale);
      }

      // Rotate selected line
      if (selectedLineRef.current) {
        selectedLineRef.current.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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

  // Update stars when generated
  useEffect(() => {
    if (!sceneRef.current || stars.length === 0) return;

    // Remove old points
    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      pointsRef.current.material.dispose();
    }

    // Remove old player marker
    if (playerMarkerRef.current) {
      sceneRef.current.remove(playerMarkerRef.current);
    }

    const center = state.currentSystem;

    // Create star points
    const positions = new Float32Array(stars.length * 3);
    const colors = new Float32Array(stars.length * 3);
    const sizes = new Float32Array(stars.length);

    const visited = state.discoveredSystems || {};
    const spectralMap = { O: ['O', 'B'], A: ['A', 'F'], G: ['G'], K: ['K'], M: ['M'], NS: ['NS'], BH: ['BH'] };
    const passesFilter = (star) => {
      if (filters.spectral !== 'all' && !spectralMap[filters.spectral]?.includes(star.starClass.class)) return false;
      if (filters.security !== 'all' && star.security !== filters.security) return false;
      if (filters.population !== 'all') {
        const p = star.population || 0;
        if (filters.population === 'uninhabited' && p > 0) return false;
        if (filters.population === 'low' && (p === 0 || p > 1000000)) return false;
        if (filters.population === 'medium' && (p <= 1000000 || p > 1000000000)) return false;
        if (filters.population === 'high' && p <= 1000000000) return false;
      }
      return true;
    };
    stars.forEach((star, i) => {
      positions[i * 3] = star.x - center.x;
      positions[i * 3 + 1] = star.y - center.y;
      positions[i * 3 + 2] = star.z - center.z;

      const isVisited = !!visited[star.seed];
      const color = new THREE.Color(getStarColor(star.starClass));
      if (isVisited) color.lerp(new THREE.Color(0x00ff66), 0.4);
      if (!passesFilter(star)) color.multiplyScalar(0.05);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = star.starClass.class === 'BH' ? 8 : star.starClass.class === 'NS' ? 6 : isVisited ? 4 : 3;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.9,
    });

    const points = new THREE.Points(geometry, material);
    sceneRef.current.add(points);
    pointsRef.current = points;

    // Player marker — a pulsing diamond
    const markerGeom = new THREE.BufferGeometry();
    const markerPos = new Float32Array([0, 0, 0]);
    markerGeom.setAttribute('position', new THREE.BufferAttribute(markerPos, 3));
    const markerMat = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 12,
      sizeAttenuation: false,
      transparent: true,
      opacity: 1,
    });
    const marker = new THREE.Points(markerGeom, markerMat);
    sceneRef.current.add(marker);
    playerMarkerRef.current = marker;

    // Clean old markers
    if (shipMarkersRef.current) { sceneRef.current.remove(shipMarkersRef.current); shipMarkersRef.current.geometry.dispose(); shipMarkersRef.current.material.dispose(); shipMarkersRef.current = null; }
    if (colonyMarkersRef.current) { sceneRef.current.remove(colonyMarkersRef.current); colonyMarkersRef.current.geometry.dispose(); colonyMarkersRef.current.material.dispose(); colonyMarkersRef.current = null; }

    // Parked ship markers (cyan)
    if (filters.showParkedShips) {
      const shipSystems = new Set();
      state.ownedShips.forEach(s => { if (s.storedAt?.systemSeed) shipSystems.add(s.storedAt.systemSeed); });
      const shipStars = stars.filter(s => shipSystems.has(s.seed));
      if (shipStars.length > 0) {
        const sp = new Float32Array(shipStars.length * 3);
        shipStars.forEach((s, i) => { sp[i*3] = s.x-center.x; sp[i*3+1] = s.y-center.y; sp[i*3+2] = s.z-center.z; });
        const sg = new THREE.BufferGeometry();
        sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
        const sm = new THREE.PointsMaterial({ color: 0x00ccff, size: 10, sizeAttenuation: false, transparent: true, opacity: 0.9 });
        const sps = new THREE.Points(sg, sm);
        sceneRef.current.add(sps);
        shipMarkersRef.current = sps;
      }
    }

    // Colony markers (purple)
    if (filters.showColonies) {
      const colonySystems = new Set(state.colonies.map(c => c.systemSeed));
      const colStars = stars.filter(s => colonySystems.has(s.seed));
      if (colStars.length > 0) {
        const cp = new Float32Array(colStars.length * 3);
        colStars.forEach((s, i) => { cp[i*3] = s.x-center.x; cp[i*3+1] = s.y-center.y; cp[i*3+2] = s.z-center.z; });
        const cg = new THREE.BufferGeometry();
        cg.setAttribute('position', new THREE.BufferAttribute(cp, 3));
        const cm = new THREE.PointsMaterial({ color: 0xcc44ff, size: 10, sizeAttenuation: false, transparent: true, opacity: 0.9 });
        const cps = new THREE.Points(cg, cm);
        sceneRef.current.add(cps);
        colonyMarkersRef.current = cps;
      }
    }

    // Flight log trail — green line connecting last 50 visited systems
    if (trailRef.current) { sceneRef.current.remove(trailRef.current); trailRef.current.geometry.dispose(); trailRef.current.material.dispose(); trailRef.current = null; }
    if (showTrail && state.flightLog?.length > 1) {
      const trailPositions = new Float32Array(state.flightLog.length * 3);
      state.flightLog.forEach((sys, i) => {
        trailPositions[i * 3] = sys.x - center.x;
        trailPositions[i * 3 + 1] = sys.y - center.y;
        trailPositions[i * 3 + 2] = sys.z - center.z;
      });
      const trailGeom = new THREE.BufferGeometry();
      trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.LineBasicMaterial({ color: 0x00aa44, transparent: true, opacity: 0.4 });
      const trail = new THREE.Line(trailGeom, trailMat);
      sceneRef.current.add(trail);
      trailRef.current = trail;
    }

    // Galaxy overview — spiral structure background for wide view
    if (overviewRef.current) { sceneRef.current.remove(overviewRef.current); overviewRef.current.geometry.dispose(); overviewRef.current.material.dispose(); }
    const ovPts = generateGalaxyOverview();
    const ovPos = new Float32Array(ovPts.length * 3);
    const ovCol = new Float32Array(ovPts.length * 3);
    ovPts.forEach((p, i) => {
      ovPos[i*3] = p.x - center.x;
      ovPos[i*3+1] = p.y - center.y;
      ovPos[i*3+2] = p.z - center.z;
      const b = Math.min(1, p.density / 3) * 0.5;
      ovCol[i*3] = b;
      ovCol[i*3+1] = b * 0.5;
      ovCol[i*3+2] = b * 0.1;
    });
    const ovGeom = new THREE.BufferGeometry();
    ovGeom.setAttribute('position', new THREE.BufferAttribute(ovPos, 3));
    ovGeom.setAttribute('color', new THREE.BufferAttribute(ovCol, 3));
    const ovMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.5 });
    const ovCloud = new THREE.Points(ovGeom, ovMat);
    sceneRef.current.add(ovCloud);
    overviewRef.current = ovCloud;

    // Set initial zoom to show a good range
    rotState.current.targetDistance = 120;
  }, [stars, state.currentSystem, filters, state.discoveredSystems, state.ownedShips, state.colonies, showTrail, state.flightLog]);

  // Mouse + touch interaction — rotate, pinch, two-finger pan, tap to select
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;

    let isDragging = false;
    let lastX = 0, lastY = 0;
    let pinchDist = 0;
    let lastCentroidX = 0, lastCentroidY = 0;
    let dragStartX = 0, dragStartY = 0;
    let touchMoved = false;
    let lastTapTime = 0;
    let isMultiTouch = false;

    const handleStarTap = (clientX, clientY) => {
      const now = Date.now();
      if (now - lastTapTime < 300) return;
      lastTapTime = now;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      raycasterRef.current.params.Points.threshold = 15;

      if (pointsRef.current) {
        const intersects = raycasterRef.current.intersectObject(pointsRef.current);
        if (intersects.length > 0) {
          intersects.sort((a, b) => a.distanceToRay - b.distanceToRay);
          const idx = intersects[0].index;
          const star = stars[idx];
          if (star) {
            handleSelectStar(star);
          }
        }
      }
    };

    // Mouse handlers
    const onMouseDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging || isMultiTouch) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const rs = rotState.current;
      rs.targetAzimuth -= dx * 0.005;
      rs.targetPolar -= dy * 0.005;
      rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
    };

    const onMouseUp = (e) => {
      const moveDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      isDragging = false;
      if (moveDist < 5) {
        handleStarTap(e.clientX, e.clientY);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const rs = rotState.current;
      rs.targetDistance += e.deltaY * 0.3;
      rs.targetDistance = Math.max(20, Math.min(50000, rs.targetDistance));
    };

    // Touch handlers — one finger rotate, two finger pinch+pan, tap to select
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        isMultiTouch = true;
        isDragging = false;
        pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        lastCentroidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastCentroidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      } else if (e.touches.length === 1) {
        isMultiTouch = false;
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        dragStartX = lastX;
        dragStartY = lastY;
        touchMoved = false;
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const newCentroidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const newCentroidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        // Pinch zoom
        const delta = pinchDist - newDist;
        pinchDist = newDist;
        const rs = rotState.current;
        rs.targetDistance += delta * 0.8;
        rs.targetDistance = Math.max(20, Math.min(50000, rs.targetDistance));

        // Two-finger pan (content follows fingers)
        const cdx = newCentroidX - lastCentroidX;
        const cdy = newCentroidY - lastCentroidY;
        lastCentroidX = newCentroidX;
        lastCentroidY = newCentroidY;
        const cam = cameraRef.current;
        if (cam && (Math.abs(cdx) > 0.5 || Math.abs(cdy) > 0.5)) {
          const forward = new THREE.Vector3();
          cam.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
          const panScale = rs.distance * 0.0015;
          rs.targetPanX -= (cdx * right.x + cdy * forward.x) * panScale;
          rs.targetPanZ -= (cdx * right.z + cdy * forward.z) * panScale;
        }
      } else if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        if (Math.abs(e.touches[0].clientX - dragStartX) > 5 || Math.abs(e.touches[0].clientY - dragStartY) > 5) {
          touchMoved = true;
        }
        const rs = rotState.current;
        rs.targetAzimuth -= dx * 0.005;
        rs.targetPolar -= dy * 0.005;
        rs.targetPolar = Math.max(0.1, Math.min(Math.PI - 0.1, rs.targetPolar));
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length === 0) {
        if (isDragging && !touchMoved && !isMultiTouch) {
          const touch = e.changedTouches[0];
          handleStarTap(touch.clientX, touch.clientY);
        }
        isDragging = false;
        isMultiTouch = false;
        pinchDist = 0;
      } else if (e.touches.length === 1) {
        isMultiTouch = false;
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        dragStartX = lastX;
        dragStartY = lastY;
        touchMoved = true;
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [stars]);

  const handleSelectStar = useCallback((star) => {
    setSelectedStar(star);

    // Draw selection line from player to star
    if (selectedLineRef.current && sceneRef.current) {
      sceneRef.current.remove(selectedLineRef.current);
      selectedLineRef.current.geometry.dispose();
      selectedLineRef.current.material.dispose();
    }

    if (sceneRef.current) {
      const center = state.currentSystem;
      const points = new Float32Array([
        0, 0, 0,
        star.x - center.x, star.y - center.y, star.z - center.z
      ]);
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(geom, mat);
      sceneRef.current.add(line);
      selectedLineRef.current = line;
    }
  }, [state.currentSystem]);

  const handleJump = useCallback(() => {
    if (!selectedStar) return;
    const dist = distance3D(
      { x: state.currentSystem.x, y: state.currentSystem.y, z: state.currentSystem.z },
      { x: selectedStar.x, y: selectedStar.y, z: selectedStar.z }
    );

    // Check fuel — each LY costs 0.5 fuel
    const fuelCost = Math.ceil(dist * 0.5);
    if (fuelCost > state.ship.fuel) {
      alert('INSUFFICIENT FUEL FOR JUMP');
      return;
    }

    // Deduct fuel and jump
    setCurrentSystem({
      ...selectedStar,
      visited: true,
    });
    setSelectedStar(null);
    if (onJumpToSystem) onJumpToSystem();
  }, [selectedStar, state.currentSystem, state.ship.fuel, setCurrentSystem, onJumpToSystem]);

  const jumpDistance = selectedStar
    ? distance3D(
        { x: state.currentSystem.x, y: state.currentSystem.y, z: state.currentSystem.z },
        { x: selectedStar.x, y: selectedStar.y, z: selectedStar.z }
      ).toFixed(1)
    : null;

  const fuelCost = selectedStar ? Math.ceil(parseFloat(jumpDistance) * 0.5) : null;

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: 'none' }} />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-orange-500 text-sm animate-pulse">SCANNING STELLAR DATABASE...</div>
        </div>
      )}

      {/* HUD overlay - top left */}
      <div className="absolute top-2 left-2 text-orange-600 text-xs space-y-0.5 pointer-events-none">
        <div>GALACTIC POSITION: {state.currentSystem.x.toFixed(0)}, {state.currentSystem.y.toFixed(0)}, {state.currentSystem.z.toFixed(0)}</div>
        <div>STARS IN RANGE: {stars.length}</div>
        <div className="text-orange-800">DRAG TO ROTATE · 2-FINGER PAN/PINCH · SCROLL TO ZOOM · TAP STAR TO SELECT</div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-16 left-2 flex gap-1 z-20">
        <button onClick={() => { rotState.current.targetDistance = 30000; }} className="px-2 py-0.5 border border-orange-700 bg-black/80 text-orange-500 hover:bg-orange-950/30 text-[10px]">GALAXY VIEW</button>
        <button onClick={() => { rotState.current.targetDistance = 120; }} className="px-2 py-0.5 border border-orange-700 bg-black/80 text-orange-500 hover:bg-orange-950/30 text-[10px]">LOCAL VIEW</button>
      </div>

      {/* Star legend - top right */}
      <div className="absolute top-2 right-2 text-xs space-y-0.5 pointer-events-none">
        <div className="text-orange-700 uppercase text-[10px]">Spectral Classes</div>
        {[
          { c: '#9bb0ff', l: 'O - Blue Supergiant' },
          { c: '#cad7ff', l: 'A - White' },
          { c: '#fff4ea', l: 'G - Yellow' },
          { c: '#ffd2a1', l: 'K - Orange Dwarf' },
          { c: '#ffcc6f', l: 'M - Red Dwarf' },
          { c: '#cccccc', l: 'NS - Neutron Star' },
          { c: '#330000', l: 'BH - Black Hole' },
        ].map((item) => (
          <div key={item.l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: item.c, boxShadow: `0 0 4px ${item.c}` }} />
            <span className="text-orange-600">{item.l}</span>
          </div>
        ))}
      </div>

      {/* Filter toggle */}
      <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 border border-orange-900 text-orange-600 hover:text-orange-400 text-[10px] z-30">
        {showFilterPanel ? '▼ HIDE FILTERS' : '▲ FILTERS'}
      </button>
      <button onClick={() => setShowBookmarks(!showBookmarks)} className="absolute top-2 left-1/2 translate-x-16 px-2 py-0.5 border border-yellow-900 text-yellow-600 hover:text-yellow-400 text-[10px] z-30">
        ★ ({state.bookmarkedSystems?.length || 0})
      </button>
      {showBookmarks && (
        <div className="absolute top-8 left-1/2 translate-x-16 w-64 max-w-[80%] border border-yellow-900 bg-black/95 p-2 space-y-1 text-[10px] z-30 max-h-60 overflow-y-auto">
          <div className="text-yellow-700 uppercase mb-1">Bookmarked Systems</div>
          {state.bookmarkedSystems?.length === 0 && <div className="text-orange-800">No bookmarks yet.</div>}
          {state.bookmarkedSystems?.map(bm => (
            <div key={bm.seed} className="flex items-center justify-between border border-yellow-950 p-1.5">
              <div className="min-w-0 flex-1">
                <div className="text-yellow-400 truncate">{bm.name}</div>
                <div className="text-yellow-800 text-[9px]">{bm.starClass?.class || bm.starClass} · {bm.population > 0 ? bm.population.toLocaleString() : 'Uninhabited'}</div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setSelectedStar(bm); setShowBookmarks(false); }} className="px-1.5 py-0.5 border border-yellow-700 text-yellow-400 text-[9px]">SELECT</button>
                <button onClick={() => removeBookmark(bm.seed)} className="px-1.5 py-0.5 border border-red-900 text-red-600 text-[9px]">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter panel */}
      {showFilterPanel && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 max-w-[90%] border border-orange-900 bg-black/95 p-2 space-y-2 text-[10px] z-30">
          <div>
            <div className="text-orange-700 uppercase mb-0.5">Star Type</div>
            <div className="flex flex-wrap gap-0.5">
              {['all', 'O', 'A', 'G', 'K', 'M', 'NS', 'BH'].map(f => (
                <button key={f} onClick={() => setFilters({...filters, spectral: f})} className={`px-1.5 py-0.5 border ${filters.spectral === f ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-orange-700 uppercase mb-0.5">Security</div>
            <div className="flex flex-wrap gap-0.5">
              {['all', 'high', 'medium', 'low', 'anarchy'].map(f => (
                <button key={f} onClick={() => setFilters({...filters, security: f})} className={`px-1.5 py-0.5 border ${filters.security === f ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{f.slice(0, 4)}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-orange-700 uppercase mb-0.5">Population</div>
            <div className="flex flex-wrap gap-0.5">
              {['all', 'uninhabited', 'low', 'medium', 'high'].map(f => (
                <button key={f} onClick={() => setFilters({...filters, population: f})} className={`px-1.5 py-0.5 border ${filters.population === f ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{f.slice(0, 4)}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 border-t border-orange-900 pt-1">
            <button onClick={() => setFilters({...filters, showParkedShips: !filters.showParkedShips})} className={`flex-1 py-0.5 border ${filters.showParkedShips ? 'border-cyan-600 text-cyan-400' : 'border-orange-900 text-orange-800'}`}>⚓ SHIPS</button>
            <button onClick={() => setFilters({...filters, showColonies: !filters.showColonies})} className={`flex-1 py-0.5 border ${filters.showColonies ? 'border-purple-600 text-purple-400' : 'border-orange-900 text-orange-800'}`}>★ COLONIES</button>
            </div>
            <button onClick={() => setShowTrail(!showTrail)} className={`w-full py-0.5 border mt-1 ${showTrail ? 'border-green-600 text-green-400' : 'border-orange-900 text-orange-800'}`}>~ FLIGHT TRAIL ({state.flightLog?.length || 0})</button>
        </div>
      )}

      {/* Player marker indicator + marker legend */}
      <div className="absolute bottom-2 left-2 text-xs pointer-events-none space-y-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-500">CURRENT: {state.currentSystem.name}</span>
        </div>
        {filters.showParkedShips && state.ownedShips.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span className="text-cyan-400">PARKED SHIPS</span>
          </div>
        )}
        {filters.showColonies && state.colonies.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span className="text-purple-400">COLONIES</span>
          </div>
        )}
      </div>

      {/* Selected star panel */}
      {selectedStar && (
        <div className="absolute bottom-2 right-2 left-2 sm:left-auto sm:w-80 border border-orange-700 bg-black/95 p-3 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-orange-900 pb-1">
            <span className="text-orange-300 font-bold">{selectedStar.name}</span>
            <span
              className="px-1.5 py-0.5 text-[10px] border"
              style={{ borderColor: selectedStar.starClass.color, color: selectedStar.starClass.color }}
            >
              {selectedStar.starClass.class} - {selectedStar.starClass.name}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-orange-600">
            <div>DISTANCE: <span className="text-orange-300">{jumpDistance} LY</span></div>
            <div>SECURITY: <span className="text-orange-300 capitalize">{selectedStar.security}</span></div>
            <div>FUEL COST: <span className="text-orange-300">{fuelCost} T</span></div>
            <div>POPULATION: <span className="text-orange-300">{selectedStar.population > 0 ? selectedStar.population.toLocaleString() : 'Uninhabited'}</span></div>
          </div>
          <button
            onClick={() => {
              const isBookmarked = state.bookmarkedSystems?.find(s => s.seed === selectedStar.seed);
              if (isBookmarked) removeBookmark(selectedStar.seed);
              else addBookmark(selectedStar);
            }}
            className="w-full py-1.5 border border-yellow-700 text-yellow-400 hover:bg-yellow-950/30 text-xs font-bold"
          >
            {state.bookmarkedSystems?.find(s => s.seed === selectedStar.seed) ? '★ REMOVE BOOKMARK' : '☆ BOOKMARK SYSTEM'}
          </button>
          <button
            onClick={handleJump}
            disabled={fuelCost > state.ship.fuel}
            className={`w-full py-2 border text-xs font-bold transition-all ${
              fuelCost > state.ship.fuel
                ? 'border-red-900 text-red-800 cursor-not-allowed'
                : 'border-orange-500 text-orange-300 hover:bg-orange-950/50'
            }`}
          >
            {fuelCost > state.ship.fuel ? 'INSUFFICIENT FUEL' : `ENGAGE FSD — JUMP TO ${selectedStar.name.toUpperCase()}`}
          </button>
        </div>
      )}
    </div>
  );
}

function updateCameraPosition(camera, rs) {
  const x = rs.distance * Math.sin(rs.polar) * Math.cos(rs.azimuth);
  const y = rs.distance * Math.cos(rs.polar);
  const z = rs.distance * Math.sin(rs.polar) * Math.sin(rs.azimuth);
  camera.position.set(x + rs.panX, y, z + rs.panZ);
  camera.lookAt(rs.panX, 0, rs.panZ);
}