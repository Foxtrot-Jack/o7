// Station wireframe model builder — distinct 3D models per station type
import * as THREE from 'three';

export function buildStationModel(type) {
  const group = new THREE.Group();
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
  const accentMat = new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true });

  switch (type) {
    case 'coriolis': {
      // Rotating cube — classic Coriolis station
      const hull = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wireMat);
      group.add(hull);
      const inner = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), accentMat);
      group.add(inner);
      // Entry slot
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 2.1), accentMat);
      slot.position.y = 1.01;
      group.add(slot);
      // Corner pylons
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 4), wireMat);
        pylon.position.set(Math.cos(angle) * 1.1, 0, Math.sin(angle) * 1.1);
        group.add(pylon);
      }
      break;
    }
    case 'orbis': {
      // Ring/torus station — O'Neill cylinder
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.5, 6, 16), wireMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      // Central hub
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8), wireMat);
      group.add(hub);
      // Spokes
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.8), accentMat);
        spoke.position.set(Math.cos(angle) * 1, 0, Math.sin(angle) * 1);
        spoke.lookAt(0, 0, 0);
        group.add(spoke);
      }
      // Counter-rotating outer ring
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 4, 20), accentMat);
      outerRing.rotation.x = Math.PI / 2;
      group.add(outerRing);
      break;
    }
    case 'outpost': {
      // Small cluster of modules
      const main = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.6), wireMat);
      group.add(main);
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), accentMat);
      side.position.set(0.9, 0, 0);
      group.add(side);
      // Solar panels
      const panelL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), wireMat);
      panelL.position.set(-0.8, 0.5, 0);
      group.add(panelL);
      const panelR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), wireMat);
      panelR.position.set(0.8, 0.5, 0);
      group.add(panelR);
      // Docking mast
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 4), wireMat);
      mast.position.set(0, -0.8, 0);
      group.add(mast);
      // Antenna
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 3), accentMat);
      antenna.position.set(0.4, 0.8, 0);
      group.add(antenna);
      break;
    }
    case 'planetary': {
      // Dome structure on surface
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), wireMat
      );
      group.add(dome);
      // Landing pads
      const pad1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 6), accentMat);
      pad1.position.set(1.1, 0, 0.8);
      group.add(pad1);
      const pad2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 6), accentMat);
      pad2.position.set(-1.1, 0, 0.8);
      group.add(pad2);
      // Control tower
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.4, 6), wireMat);
      tower.position.set(0, 0.7, -0.6);
      group.add(tower);
      // Hangar entrance
      const hangar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.1), accentMat);
      hangar.position.set(0, 0.2, 1.45);
      group.add(hangar);
      break;
    }
    case 'megaship': {
      // Large elongated structure
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 4, 8), wireMat);
      hull.rotation.z = Math.PI / 2;
      group.add(hull);
      // Bridge section
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.8), accentMat);
      bridge.position.set(0, 0.5, -1.5);
      group.add(bridge);
      // Engine pods
      for (let i = -1; i <= 1; i += 2) {
        const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 1.2, 6), wireMat);
        pod.position.set(i * 0.7, -0.3, 1.5);
        pod.rotation.z = Math.PI / 2;
        group.add(pod);
      }
      // Cargo bays
      const bay1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.6), accentMat);
      bay1.position.set(0, -0.4, 0);
      group.add(bay1);
      break;
    }
    case 'asteroid': {
      // Station carved into asteroid
      const rock = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), wireMat);
      group.add(rock);
      // Docking arm
      const dock = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2), accentMat);
      dock.position.z = 1.2;
      group.add(dock);
      // Habitat sphere
      const hab = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), wireMat);
      hab.position.set(0.8, 0.5, 0);
      group.add(hab);
      // Refinery stacks
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1, 5), accentMat);
      stack.position.set(-0.8, 0.6, 0);
      group.add(stack);
      break;
    }
    default: {
      group.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), wireMat));
    }
  }

  return group;
}