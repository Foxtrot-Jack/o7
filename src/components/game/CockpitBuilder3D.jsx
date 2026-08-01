// 3D Cockpit Builder — place and customize cockpit accessories on slot markers
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { COCKPIT_PART_MAP } from '@/lib/cockpitParts';

export default function CockpitBuilder3D({ design, config, selectedSlot, onSelectSlot }) {
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
  const rotRef = useRef({ azimuth: Math.PI / 2, polar: Math.PI / 2.2, distance: 4, targetDistance: 4 });

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
      camera.lookAt(0, 0, -0.5);
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

  // Build cockpit frame + slot markers
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

    const ww = config.windowWidth / 2;
    const wh = config.windowHeight / 2;
    const z = -config.depth;

    // Window outline + canopy struts
    const pts = [
      [-ww, -wh, z], [ww, -wh, z],
      [-ww, wh, z], [ww, wh, z],
      [-ww, -wh, z], [-ww, wh, z],
      [ww, -wh, z], [ww, wh, z],
      [0, -wh, z], [0, wh, z],
      [-ww, wh, z], [-ww - 0.2, wh, z + 0.5],
      [ww, wh, z], [ww + 0.2, wh, z + 0.5],
      [-ww, -wh, z], [-ww - 0.2, -wh, z + 0.4],
      [ww, -wh, z], [ww + 0.2, -wh, z + 0.4],
    ];
    const fGeom = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
    const fMat = new THREE.LineBasicMaterial({ color: 0x553300, transparent: true, opacity: 0.6 });
    frame.add(new THREE.LineSegments(fGeom, fMat));

    // Dashboard
    const dashGeom = new THREE.BoxGeometry(config.windowWidth * 0.9, 0.05, 0.5);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0x331a00, wireframe: true });
    const dash = new THREE.Mesh(dashGeom, dashMat);
    dash.position.set(0, -wh - 0.05, z + 0.25);
    dash.rotation.x = -0.25;
    frame.add(dash);

    // Slot markers
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x442200, wireframe: true, transparent: true, opacity: 0.4 });
    const selMarkerMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.8 });
    for (const slot of config.slots) {
      const isSel = slot.id === selectedSlot;
      const mGeom = new THREE.SphereGeometry(0.08, 6, 4);
      const marker = new THREE.Mesh(mGeom, isSel ? selMarkerMat : markerMat);
      marker.position.set(...slot.pos);
      marker.userData.slot = slot.id;
      frame.add(marker);
      slotMarkersRef.current.push(marker);
    }
  }, [config, selectedSlot]);

  // Build accessory meshes
  useEffect(() => {
    const group = groupRef.current;
    if (!group || !config) return;

    for (const m of meshesRef.current) {
      if (m) { group.remove(m); m.geometry.dispose(); m.material.dispose(); }
    }
    meshesRef.current = [];

    const baseMat = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
    const selMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });

    for (const slot of config.slots) {
      const partRef = design?.parts?.[slot.id];
      if (!partRef?.partId) continue;
      const part = COCKPIT_PART_MAP[partRef.partId];
      if (!part) continue;

      const geom = createCockpitGeometry(part.shape);
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
  }, [design, config, selectedSlot]);

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
    const onWheel = (e) => { e.preventDefault(); rotRef.current.targetDistance = Math.max(1.5, Math.min(10, rotRef.current.targetDistance + e.deltaY * 0.01)); };
    const onTouchStart = (e) => {
      if (e.touches.length === 2) { isDragging = false; pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
      else if (e.touches.length === 1) { isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; dragStartX = lastX; dragStartY = lastY; }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const delta = pinchDist - newDist; pinchDist = newDist;
        rotRef.current.targetDistance = Math.max(1.5, Math.min(10, rotRef.current.targetDistance + delta * 0.05));
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