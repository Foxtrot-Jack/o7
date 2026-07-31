// Build a wireframe ship model that varies by ship class (1-4)
import * as THREE from 'three';

export function buildShipModel(shipClass) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });

  if (shipClass <= 1) {
    // Class 1 — Small dart (Sidewinder / Eagle)
    const body = new THREE.ConeGeometry(0.15, 0.5, 4);
    const bodyMesh = new THREE.Mesh(body, mat);
    bodyMesh.rotation.x = Math.PI / 2;
    group.add(bodyMesh);
  } else if (shipClass === 2) {
    // Class 2 — Medium swept-wing (Cobra / Asp)
    const body = new THREE.ConeGeometry(0.12, 0.6, 4);
    const bodyMesh = new THREE.Mesh(body, mat);
    bodyMesh.rotation.x = Math.PI / 2;
    group.add(bodyMesh);
    const wing = new THREE.BoxGeometry(0.5, 0.03, 0.2);
    group.add(new THREE.Mesh(wing, mat));
  } else if (shipClass === 3) {
    // Class 3 — Large bulky (Python / Type-7)
    const body = new THREE.BoxGeometry(0.25, 0.15, 0.6);
    group.add(new THREE.Mesh(body, mat));
    const nose = new THREE.ConeGeometry(0.12, 0.25, 4);
    const noseMesh = new THREE.Mesh(nose, mat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.position.z = 0.4;
    group.add(noseMesh);
  } else {
    // Class 4 — Huge elongated (Anaconda / Cutter)
    const body = new THREE.CylinderGeometry(0.15, 0.2, 0.9, 6);
    const bodyMesh = new THREE.Mesh(body, mat);
    bodyMesh.rotation.x = Math.PI / 2;
    group.add(bodyMesh);
    const wing = new THREE.BoxGeometry(0.7, 0.05, 0.35);
    group.add(new THREE.Mesh(wing, mat));
  }

  return group;
}