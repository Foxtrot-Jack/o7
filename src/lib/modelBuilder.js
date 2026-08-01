// Shared 3D model builders for custom ships and carriers
// Used by both the ShipBuilder3D preview and the SystemOrrery
import * as THREE from 'three';
import { SHIP_SLOTS, SHIP_PART_MAP } from './shipParts';
import { CARRIER_SLOTS, CARRIER_PART_MAP } from './carrierParts';

// Create a wireframe geometry from a shape name and slot category
export function createGeometry(shape, category) {
  switch (shape) {
    case 'cone': return new THREE.ConeGeometry(0.5, 2, 6);
    case 'box': return new THREE.BoxGeometry(
      category === 'wing' ? 0.6 : 1.5,
      category === 'wing' ? 0.15 : 0.8,
      category === 'wing' ? 1.5 : 2
    );
    case 'cylinder': return new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8);
    case 'sphere': return new THREE.SphereGeometry(0.6, 8, 6);
    case 'wedge': return new THREE.CylinderGeometry(0.05, 0.8, 2, 4);
    case 'octagon': return new THREE.CylinderGeometry(0.8, 0.8, 2, 8);
    default: return new THREE.BoxGeometry(1, 1, 1);
  }
}

// Build a complete wireframe model from a custom design (ship or carrier)
export function buildCustomModel(design, slots, partMap, color = 0x00ff88) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, wireframe: true });

  for (const slot of slots) {
    const partRef = design.parts?.[slot.id];
    if (!partRef?.partId) continue;
    const part = partMap[partRef.partId];
    if (!part) continue;

    const geom = createGeometry(part.shape, slot.category);
    const mesh = new THREE.Mesh(geom, mat.clone());
    const offset = partRef.position || [0, 0, 0];
    mesh.position.set(
      slot.pos[0] + offset[0],
      slot.pos[1] + offset[1],
      slot.pos[2] + offset[2]
    );
    const s = partRef.scale || [1, 1, 1];
    mesh.scale.set(s[0], s[1], s[2]);

    if (part.shape === 'cone' || part.shape === 'wedge') {
      if (slot.category === 'hull' || slot.category === 'engine') mesh.rotation.x = Math.PI / 2;
      if (slot.category === 'cockpit') mesh.rotation.x = -Math.PI / 2;
    }
    if (slot.id === 'wing_left') mesh.rotation.z = Math.PI / 12;
    if (slot.id === 'wing_right') mesh.rotation.z = -Math.PI / 12;
    const rot = partRef.rotation || [0, 0, 0];
    mesh.rotation.x += rot[0] * Math.PI / 180;
    mesh.rotation.y += rot[1] * Math.PI / 180;
    mesh.rotation.z += rot[2] * Math.PI / 180;

    group.add(mesh);
  }
  return group;
}

// Build a custom ship model from a ship design
export function buildCustomShipModel(design, color = 0x00ff88) {
  return buildCustomModel(design, SHIP_SLOTS, SHIP_PART_MAP, color);
}

// Build a custom carrier model from a carrier design
export function buildCarrierModel(design, color = 0xff8800) {
  return buildCustomModel(design, CARRIER_SLOTS, CARRIER_PART_MAP, color);
}

// Build a generic carrier model for carriers without a custom design
export function buildGenericCarrierModel(color = 0xff8800) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, wireframe: true });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 4), mat);
  group.add(hull);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
  bridge.position.set(0, 1.2, 1);
  group.add(bridge);

  const dockL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 2), mat);
  dockL.position.set(-2, 0, 0);
  group.add(dockL);
  const dockR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 2), mat);
  dockR.position.set(2, 0, 0);
  group.add(dockR);

  const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 6), mat);
  engL.rotation.x = Math.PI / 2;
  engL.position.set(-0.8, 0, -2.5);
  group.add(engL);
  const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 6), mat);
  engR.rotation.x = Math.PI / 2;
  engR.position.set(0.8, 0, -2.5);
  group.add(engR);

  return group;
}