// ============================================================
// SHIP WIREFRAMES — Detailed per-ship 3D shapes
// Each ship has a recognizable silhouette inspired by Elite Dangerous
// ============================================================
import * as THREE from 'three';
import { SHIP_MAP } from './gameState';

const WIRE = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
const ACCENT = new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true });
const DETAIL = new THREE.MeshBasicMaterial({ color: 0xffaa44, wireframe: true });

function addMesh(group, geom, mat, pos = [0,0,0], rot = [0,0,0]) {
  const m = new THREE.Mesh(geom, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  group.add(m);
  return m;
}

export function buildShipWireframe(shipTypeId) {
  const shipType = SHIP_MAP[shipTypeId];
  if (!shipType) return new THREE.Group();
  const s = 0.7 + (shipType.class - 1) * 0.25;
  const g = new THREE.Group();

  const builder = SHIP_BUILDERS[shipTypeId];
  if (builder) {
    builder(g, s);
  } else {
    buildGeneric(g, s, shipTypeId);
  }
  return g;
}

// ---- Per-ship builders ----

function buildSidewinder(g, s) {
  // Compact wedge with flat top, twin rear engines, ventral fin
  addMesh(g, new THREE.ConeGeometry(0.45 * s, 1.6 * s, 4), WIRE, [0, 0, 0], [-Math.PI/2, 0, Math.PI/4]);
  // Flattened top
  addMesh(g, new THREE.BoxGeometry(0.5*s, 0.08, 0.9*s), WIRE, [0, 0.12*s, -0.1*s]);
  // Wings — forward swept
  for (const i of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.7*s, 0.03, 0.5*s), WIRE);
    addMesh(g, w.geometry, WIRE, [i*0.4*s, -0.02*s, 0.15*s], [0, i*0.4, 0]);
  }
  // Twin engines at rear
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.4*s, 6), ACCENT, [i*0.18*s, 0, 0.8*s], [Math.PI/2, 0, 0]);
  }
  // Ventral fin
  addMesh(g, new THREE.BoxGeometry(0.04, 0.25*s, 0.3*s), WIRE, [0, -0.2*s, 0.3*s]);
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.12*s, 6, 4), DETAIL, [0, 0.14*s, -0.4*s]);
}

function buildEagle(g, s) {
  // Central pod with 3 wings, single engine
  addMesh(g, new THREE.ConeGeometry(0.35*s, 1.2*s, 6), WIRE, [0, 0, 0], [-Math.PI/2, 0, 0]);
  // Three wings evenly spaced
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    addMesh(g, new THREE.BoxGeometry(0.6*s, 0.03, 0.35*s), WIRE,
      [Math.cos(angle)*0.3*s, -0.05*s, 0.1*s], [0, angle, 0]);
  }
  // Engine
  addMesh(g, new THREE.CylinderGeometry(0.15*s, 0.12*s, 0.35*s, 6), ACCENT, [0, 0, 0.65*s], [Math.PI/2, 0, 0]);
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.1*s, 6, 4), DETAIL, [0, 0.1*s, -0.35*s]);
}

function buildHauler(g, s) {
  // Boxy hull with underbelly cargo pod
  addMesh(g, new THREE.BoxGeometry(0.7*s, 0.5*s, 1.6*s), WIRE);
  // Cargo pod underneath
  addMesh(g, new THREE.BoxGeometry(0.5*s, 0.3*s, 1.0*s), ACCENT, [0, -0.35*s, 0]);
  // Single engine
  addMesh(g, new THREE.CylinderGeometry(0.15*s, 0.12*s, 0.35*s, 6), ACCENT, [0, 0, 0.9*s], [Math.PI/2, 0, 0]);
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.3*s, 0.2*s, 0.2*s), DETAIL, [0, 0.3*s, -0.75*s]);
  // Side fins
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.04, 0.3*s, 0.4*s), WIRE, [i*0.4*s, 0.1*s, 0.3*s]);
  }
}

function buildAdder(g, s) {
  // Wedge cargo ship with wide wings
  addMesh(g, new THREE.BoxGeometry(0.8*s, 0.5*s, 1.4*s), WIRE);
  // Wide wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.7*s, 0.04, 0.6*s), WIRE, [i*0.6*s, -0.05*s, 0.1*s], [0, i*0.2, 0]);
  }
  // Twin engines on wingtips
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.35*s, 6), ACCENT, [i*0.7*s, -0.05*s, 0.5*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.15*s, 6, 4), DETAIL, [0, 0.2*s, -0.55*s]);
}

function buildCobra(g, s) {
  // Long body, swept wings, dorsal fin, twin engines
  addMesh(g, new THREE.BoxGeometry(0.55*s, 0.4*s, 1.6*s), WIRE);
  // Pointed nose
  addMesh(g, new THREE.ConeGeometry(0.28*s, 0.5*s, 4), WIRE, [0, 0, -0.95*s], [-Math.PI/2, 0, Math.PI/4]);
  // Swept wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.9*s, 0.03, 0.55*s), WIRE, [i*0.6*s, -0.05*s, 0.15*s], [0, i*0.35, 0]);
  }
  // Dorsal fin
  addMesh(g, new THREE.BoxGeometry(0.04, 0.35*s, 0.35*s), WIRE, [0, 0.3*s, 0.25*s]);
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.4*s, 6), ACCENT, [i*0.22*s, 0, 0.9*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.14*s, 6, 4), DETAIL, [0, 0.2*s, -0.5*s]);
}

function buildViper(g, s) {
  // Sleek combat ship with 4 engines
  addMesh(g, new THREE.ConeGeometry(0.4*s, 1.8*s, 4), WIRE, [0, 0, 0], [-Math.PI/2, 0, Math.PI/4]);
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.7*s, 0.03, 0.5*s), WIRE, [i*0.5*s, -0.05*s, 0.1*s], [0, i*0.25, 0]);
  }
  // Four engines
  for (const i of [-1, 1]) {
    for (const j of [-1, 1]) {
      addMesh(g, new THREE.CylinderGeometry(0.1*s, 0.08*s, 0.3*s, 6), ACCENT, [i*0.15*s, j*0.12*s, 0.85*s], [Math.PI/2, 0, 0]);
    }
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.22*s, 0.14*s, 0.3*s), DETAIL, [0, 0.18*s, -0.5*s]);
}

function buildType6(g, s) {
  // Boxy transport with side pods
  addMesh(g, new THREE.BoxGeometry(0.8*s, 0.7*s, 1.8*s), WIRE);
  // Side cargo pods
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.3*s, 0.4*s, 1.2*s), ACCENT, [i*0.55*s, -0.1*s, 0]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.13*s, 0.1*s, 0.35*s, 6), ACCENT, [i*0.3*s, 0, 0.95*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.35*s, 0.25*s, 0.2*s), DETAIL, [0, 0.35*s, -0.85*s]);
}

function buildDiamondback(g, s) {
  // Long thin body with large sensor dish on top
  addMesh(g, new THREE.CylinderGeometry(0.35*s, 0.25*s, 1.8*s, 8), WIRE, [0, 0, 0], [0, 0, Math.PI/2]);
  // Sensor dish
  addMesh(g, new THREE.SphereGeometry(0.3*s, 8, 4, 0, Math.PI*2, 0, Math.PI/2), DETAIL, [0, 0.35*s, -0.2*s]);
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.8*s, 0.03, 0.7*s), WIRE, [i*0.5*s, 0, 0.1*s]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.13*s, 0.1*s, 0.4*s, 6), ACCENT, [i*0.25*s, 0, 0.95*s], [Math.PI/2, 0, 0]);
  }
}

function buildAsp(g, s) {
  // Wide flat body with twin booms and engine nacelles
  addMesh(g, new THREE.BoxGeometry(0.8*s, 0.35*s, 1.5*s), WIRE);
  // Twin booms extending rear
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.2*s, 0.2*s, 0.8*s), WIRE, [i*0.4*s, 0, 0.6*s]);
  }
  // Engine nacelles at end of booms
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.18*s, 0.15*s, 0.4*s, 8), ACCENT, [i*0.4*s, 0, 1.1*s], [Math.PI/2, 0, 0]);
  }
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.6*s, 0.03, 0.6*s), WIRE, [i*0.65*s, -0.05*s, 0]);
  }
  // Cockpit — large canopy
  addMesh(g, new THREE.SphereGeometry(0.2*s, 8, 6), DETAIL, [0, 0.18*s, -0.5*s]);
}

function buildType7(g, s) {
  // Large boxy transport
  addMesh(g, new THREE.BoxGeometry(0.9*s, 0.8*s, 2.0*s), WIRE);
  // Cargo bay detail
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.04, 0.4*s, 0.6*s), ACCENT, [i*0.45*s, -0.1*s, 0.2*s]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.4*s, 6), ACCENT, [i*0.3*s, 0, 1.05*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.4*s, 0.3*s, 0.2*s), DETAIL, [0, 0.4*s, -0.95*s]);
}

function buildPython(g, s) {
  // Wide rectangular body with side nacelles
  addMesh(g, new THREE.BoxGeometry(0.9*s, 0.5*s, 1.8*s), WIRE);
  // Side nacelles
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.25*s, 0.3*s, 1.2*s), ACCENT, [i*0.55*s, -0.05*s, 0.2*s]);
  }
  // Engines in nacelles
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.15*s, 0.12*s, 0.35*s, 6), ACCENT, [i*0.55*s, -0.05*s, 0.9*s], [Math.PI/2, 0, 0]);
  }
  // Flat top with cockpit
  addMesh(g, new THREE.BoxGeometry(0.5*s, 0.15*s, 0.5*s), DETAIL, [0, 0.3*s, -0.4*s]);
  // Rounded nose
  addMesh(g, new THREE.SphereGeometry(0.3*s, 8, 4, 0, Math.PI*2, 0, Math.PI/2), WIRE, [0, 0, -0.9*s], [-Math.PI/2, 0, 0]);
}

function buildAnaconda(g, s) {
  // Very long narrow body with dorsal fin, multiple engines
  addMesh(g, new THREE.CylinderGeometry(0.4*s, 0.3*s, 2.8*s, 8), WIRE, [0, 0, 0], [0, 0, Math.PI/2]);
  // Pointed nose
  addMesh(g, new THREE.ConeGeometry(0.3*s, 0.6*s, 8), WIRE, [0, 0, -1.7*s], [Math.PI/2, 0, 0]);
  // Dorsal fin
  addMesh(g, new THREE.BoxGeometry(0.04, 0.5*s, 0.6*s), WIRE, [0, 0.35*s, 0.2*s]);
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.8*s, 0.03, 0.7*s), WIRE, [i*0.5*s, -0.05*s, 0.3*s]);
  }
  // Triple engine arrangement
  addMesh(g, new THREE.CylinderGeometry(0.16*s, 0.13*s, 0.4*s, 8), ACCENT, [0, 0, 1.5*s], [Math.PI/2, 0, 0]);
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.13*s, 0.1*s, 0.35*s, 6), ACCENT, [i*0.25*s, 0, 1.4*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.3*s, 0.18*s, 0.35*s), DETAIL, [0, 0.25*s, -1.0*s]);
  // Sensor array on nose
  addMesh(g, new THREE.BoxGeometry(0.04, 0.2*s, 0.04), DETAIL, [0, 0.2*s, -1.3*s]);
}

function buildVulture(g, s) {
  // Wide fighter with large engine nacelles
  addMesh(g, new THREE.ConeGeometry(0.35*s, 1.4*s, 4), WIRE, [0, 0, 0], [-Math.PI/2, 0, Math.PI/4]);
  // Large engine nacelles on sides
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.22*s, 0.18*s, 0.9*s, 8), ACCENT, [i*0.45*s, -0.05*s, 0.3*s], [Math.PI/2, 0, 0]);
  }
  // Wings connecting nacelles
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.3*s, 0.03, 0.5*s), WIRE, [i*0.3*s, -0.05*s, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.18*s, 8, 6), DETAIL, [0, 0.15*s, -0.4*s]);
}

function buildImperialCourier(g, s) {
  // Sleek dart shape
  addMesh(g, new THREE.ConeGeometry(0.3*s, 1.8*s, 6), WIRE, [0, 0, 0], [-Math.PI/2, 0, 0]);
  // Swept wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.9*s, 0.02, 0.6*s), ACCENT, [i*0.5*s, -0.03*s, 0.15*s], [0, i*0.3, 0]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.35*s, 6), ACCENT, [i*0.15*s, 0, 0.85*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.12*s, 6, 4), DETAIL, [0, 0.08*s, -0.5*s]);
}

function buildImperialClipper(g, s) {
  // Wide swept-wing design
  addMesh(g, new THREE.ConeGeometry(0.35*s, 2.0*s, 6), WIRE, [0, 0, 0], [-Math.PI/2, 0, 0]);
  // Large swept wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(1.2*s, 0.02, 0.8*s), ACCENT, [i*0.7*s, -0.03*s, 0.1*s], [0, i*0.35, 0]);
  }
  // Twin engines on wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.15*s, 0.12*s, 0.4*s, 6), ACCENT, [i*0.5*s, -0.03*s, 0.7*s], [Math.PI/2, 0, 0]);
  }
  // Fin
  addMesh(g, new THREE.BoxGeometry(0.04, 0.4*s, 0.4*s), WIRE, [0, 0.3*s, 0.3*s]);
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.15*s, 8, 6), DETAIL, [0, 0.15*s, -0.6*s]);
}

function buildImperialCutter(g, s) {
  // Very large elegant swept design
  addMesh(g, new THREE.ConeGeometry(0.4*s, 2.5*s, 6), WIRE, [0, 0, 0], [-Math.PI/2, 0, 0]);
  // Very large swept wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(1.5*s, 0.02, 1.0*s), ACCENT, [i*0.8*s, -0.03*s, 0.15*s], [0, i*0.4, 0]);
  }
  // Quad engines
  for (const i of [-1, 1]) {
    for (const j of [0, 1]) {
      addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.4*s, 6), ACCENT, [i*0.5*s, -0.03*s + j*0.12*s, 1.0*s], [Math.PI/2, 0, 0]);
    }
  }
  // Fin
  addMesh(g, new THREE.BoxGeometry(0.04, 0.5*s, 0.5*s), WIRE, [0, 0.35*s, 0.3*s]);
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.18*s, 8, 6), DETAIL, [0, 0.18*s, -0.8*s]);
}

function buildFederalCorvette(g, s) {
  // Large military battleship
  addMesh(g, new THREE.BoxGeometry(0.7*s, 0.6*s, 2.5*s), WIRE);
  // Pointed nose
  addMesh(g, new THREE.ConeGeometry(0.35*s, 0.8*s, 4), WIRE, [0, 0, -1.65*s], [Math.PI/2, 0, Math.PI/4]);
  // Military wings with weapon mounts
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.9*s, 0.08, 0.8*s), ACCENT, [i*0.6*s, -0.05*s, 0.2*s]);
  }
  // Quad engine nacelles
  for (const i of [-1, 1]) {
    for (const j of [-1, 1]) {
      addMesh(g, new THREE.CylinderGeometry(0.13*s, 0.1*s, 0.4*s, 6), ACCENT, [i*0.2*s, j*0.15*s, 1.3*s], [Math.PI/2, 0, 0]);
    }
  }
  // Bridge tower
  addMesh(g, new THREE.BoxGeometry(0.4*s, 0.25*s, 0.4*s), DETAIL, [0, 0.4*s, -0.3*s]);
}

function buildFederalDropship(g, s) {
  // Blocky military ship with side pods
  addMesh(g, new THREE.BoxGeometry(0.8*s, 0.6*s, 1.8*s), WIRE);
  // Side pods
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.3*s, 0.35*s, 0.8*s), ACCENT, [i*0.5*s, -0.05*s, 0.1*s]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.35*s, 6), ACCENT, [i*0.25*s, 0, 0.95*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.35*s, 0.22*s, 0.25*s), DETAIL, [0, 0.35*s, -0.8*s]);
}

function buildAllianceChieftain(g, s) {
  // Angular combat ship with forward-swept wings
  addMesh(g, new THREE.ConeGeometry(0.4*s, 1.8*s, 4), WIRE, [0, 0, 0], [-Math.PI/2, 0, Math.PI/4]);
  // Forward-swept wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.8*s, 0.04, 0.6*s), ACCENT, [i*0.5*s, -0.05*s, 0.2*s], [0, i*-0.3, 0]);
  }
  // Twin engine nacelles
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.16*s, 0.13*s, 0.5*s, 8), ACCENT, [i*0.3*s, 0, 0.9*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.25*s, 0.16*s, 0.3*s), DETAIL, [0, 0.2*s, -0.55*s]);
  // Tail fins
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.04, 0.3*s, 0.25*s), WIRE, [i*0.2*s, 0.2*s, 0.6*s]);
  }
}

function buildKrait(g, s) {
  // Wide flat body with twin booms
  addMesh(g, new THREE.BoxGeometry(0.9*s, 0.35*s, 1.5*s), WIRE);
  // Twin booms
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.18*s, 0.18*s, 0.7*s), WIRE, [i*0.4*s, 0, 0.55*s]);
  }
  // Engine nacelles
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.16*s, 0.13*s, 0.4*s, 8), ACCENT, [i*0.4*s, 0, 1.0*s], [Math.PI/2, 0, 0]);
  }
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.5*s, 0.03, 0.5*s), WIRE, [i*0.6*s, -0.05*s, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.18*s, 8, 6), DETAIL, [0, 0.15*s, -0.45*s]);
}

function buildMamba(g, s) {
  // Sleek racing-inspired fighter
  addMesh(g, new THREE.ConeGeometry(0.35*s, 1.8*s, 4), WIRE, [0, 0, 0], [-Math.PI/2, 0, Math.PI/4]);
  // Swept wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.6*s, 0.03, 0.5*s), ACCENT, [i*0.4*s, -0.05*s, 0.2*s], [0, i*0.35, 0]);
  }
  // Large single engine
  addMesh(g, new THREE.CylinderGeometry(0.2*s, 0.16*s, 0.45*s, 8), ACCENT, [0, 0, 0.9*s], [Math.PI/2, 0, 0]);
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.15*s, 8, 6), DETAIL, [0, 0.15*s, -0.5*s]);
}

function buildType9(g, s) {
  // Very large boxy freighter
  addMesh(g, new THREE.BoxGeometry(1.0*s, 0.9*s, 2.2*s), WIRE);
  // Cargo bay lines
  for (let i = -1; i <= 1; i++) {
    addMesh(g, new THREE.BoxGeometry(1.02*s, 0.02, 0.02), ACCENT, [0, 0, i*0.5*s]);
  }
  // Four engine nacelles
  for (const i of [-1, 1]) {
    for (const j of [-1, 1]) {
      addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.4*s, 6), ACCENT, [i*0.35*s, j*0.25*s, 1.15*s], [Math.PI/2, 0, 0]);
    }
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.4*s, 0.3*s, 0.2*s), DETAIL, [0, 0.45*s, -1.0*s]);
}

function buildOrca(g, s) {
  // Sleek passenger liner
  addMesh(g, new THREE.CylinderGeometry(0.35*s, 0.25*s, 2.2*s, 8), WIRE, [0, 0, 0], [0, 0, Math.PI/2]);
  // Pointed nose
  addMesh(g, new THREE.ConeGeometry(0.25*s, 0.5*s, 8), WIRE, [0, 0, -1.35*s], [Math.PI/2, 0, 0]);
  // Observation lounge ring
  addMesh(g, new THREE.TorusGeometry(0.35*s, 0.06, 4, 12), ACCENT, [0, 0, -0.3*s], [0, Math.PI/2, 0]);
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.6*s, 0.03, 0.7*s), WIRE, [i*0.45*s, -0.05*s, 0.2*s]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.13*s, 0.1*s, 0.4*s, 6), ACCENT, [i*0.2*s, 0, 1.1*s], [Math.PI/2, 0, 0]);
  }
}

function buildBeluga(g, s) {
  // Large whale-shaped passenger ship
  addMesh(g, new THREE.CylinderGeometry(0.45*s, 0.35*s, 2.4*s, 8), WIRE, [0, 0, 0], [0, 0, Math.PI/2]);
  // Rounded nose
  addMesh(g, new THREE.SphereGeometry(0.45*s, 8, 6), WIRE, [0, 0, -1.2*s]);
  // Observation ring
  addMesh(g, new THREE.TorusGeometry(0.4*s, 0.08, 4, 12), ACCENT, [0, 0, -0.5*s], [0, Math.PI/2, 0]);
  // Large wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.7*s, 0.04, 0.8*s), WIRE, [i*0.55*s, -0.05*s, 0.2*s]);
  }
  // Triple engines
  addMesh(g, new THREE.CylinderGeometry(0.15*s, 0.12*s, 0.4*s, 6), ACCENT, [0, 0, 1.25*s], [Math.PI/2, 0, 0]);
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.35*s, 6), ACCENT, [i*0.25*s, 0, 1.2*s], [Math.PI/2, 0, 0]);
  }
}

function buildDolphin(g, s) {
  // Small sleek passenger ship
  addMesh(g, new THREE.CylinderGeometry(0.3*s, 0.22*s, 1.6*s, 8), WIRE, [0, 0, 0], [0, 0, Math.PI/2]);
  // Rounded nose
  addMesh(g, new THREE.SphereGeometry(0.3*s, 8, 6), WIRE, [0, 0, -0.8*s]);
  // Wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.5*s, 0.03, 0.5*s), WIRE, [i*0.4*s, -0.05*s, 0.1*s]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.35*s, 6), ACCENT, [i*0.18*s, 0, 0.85*s], [Math.PI/2, 0, 0]);
  }
  // Observation window
  addMesh(g, new THREE.TorusGeometry(0.25*s, 0.04, 4, 8), DETAIL, [0, 0, -0.4*s], [0, Math.PI/2, 0]);
}

function buildMandalay(g, s) {
  // Explorer with large sensor array
  addMesh(g, new THREE.CylinderGeometry(0.35*s, 0.25*s, 1.8*s, 8), WIRE, [0, 0, 0], [0, 0, Math.PI/2]);
  // Large sensor dish
  addMesh(g, new THREE.SphereGeometry(0.35*s, 8, 4, 0, Math.PI*2, 0, Math.PI/2), DETAIL, [0, 0.3*s, -0.3*s]);
  // Long wings
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.9*s, 0.03, 0.7*s), WIRE, [i*0.55*s, 0, 0.1*s]);
  }
  // Twin engines on wingtips
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.4*s, 6), ACCENT, [i*0.5*s, 0, 0.7*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.SphereGeometry(0.15*s, 8, 6), DETAIL, [0, 0.15*s, -0.6*s]);
}

function buildType8(g, s) {
  // Medium boxy transport
  addMesh(g, new THREE.BoxGeometry(0.85*s, 0.75*s, 1.9*s), WIRE);
  // Side cargo detail
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.04, 0.5*s, 1.2*s), ACCENT, [i*0.43*s, -0.05*s, 0.1*s]);
  }
  // Twin engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.14*s, 0.11*s, 0.38*s, 6), ACCENT, [i*0.28*s, 0, 1.0*s], [Math.PI/2, 0, 0]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.38*s, 0.28*s, 0.2*s), DETAIL, [0, 0.38*s, -0.9*s]);
}

function buildType10(g, s) {
  // Very large heavy freighter/defender
  addMesh(g, new THREE.BoxGeometry(1.1*s, 1.0*s, 2.4*s), WIRE);
  // Armor plating detail
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(1.12*s, 0.04, 0.04), ACCENT, [0, i*0.3*s, 0.3*s]);
  }
  // Six engine nacelles
  for (const i of [-1, 1]) {
    for (const j of [-1, 0, 1]) {
      addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.4*s, 6), ACCENT, [i*0.4*s, j*0.2*s, 1.25*s], [Math.PI/2, 0, 0]);
    }
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.45*s, 0.32*s, 0.2*s), DETAIL, [0, 0.5*s, -1.1*s]);
  // Weapon hardpoints on top
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.04, 0.15*s, 0.15*s), DETAIL, [i*0.4*s, 0.55*s, 0]);
  }
}

function buildPythonMk2(g, s) {
  // Python-based combat variant
  addMesh(g, new THREE.BoxGeometry(0.9*s, 0.5*s, 1.7*s), WIRE);
  // Side nacelles with weapon mounts
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.25*s, 0.3*s, 1.0*s), ACCENT, [i*0.55*s, -0.05*s, 0.15*s]);
  }
  // Engines
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.CylinderGeometry(0.15*s, 0.12*s, 0.35*s, 6), ACCENT, [i*0.55*s, -0.05*s, 0.8*s], [Math.PI/2, 0, 0]);
  }
  // Extra combat hardpoints on top
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.04, 0.2*s, 0.04), DETAIL, [i*0.3*s, 0.35*s, -0.1*s]);
  }
  // Cockpit
  addMesh(g, new THREE.BoxGeometry(0.5*s, 0.15*s, 0.5*s), DETAIL, [0, 0.3*s, -0.35*s]);
}

// ---- Ship builder registry ----
const SHIP_BUILDERS = {
  sidewinder: buildSidewinder,
  eagle: buildEagle,
  hauler: buildHauler,
  adder: buildAdder,
  cobra: buildCobra,
  cobramk4: buildCobra,
  cobramk5: buildCobra,
  viper: buildViper,
  type6: buildType6,
  diamondback: buildDiamondback,
  asp: buildAsp,
  type7: buildType7,
  python: buildPython,
  python_mk2: buildPythonMk2,
  type9: buildType9,
  anaconda: buildAnaconda,
  vulture: buildVulture,
  imperial_courier: buildImperialCourier,
  imperial_clipper: buildImperialClipper,
  imperial_cutter: buildImperialCutter,
  federal_dropship: buildFederalDropship,
  federal_assault: buildFederalDropship,
  federal_corvette: buildFederalCorvette,
  alliance_chieftain: buildAllianceChieftain,
  alliance_crusader: buildAllianceChieftain,
  alliance_challenger: buildAllianceChieftain,
  krait_phantom: buildKrait,
  krait_mk2: buildKrait,
  mamba: buildMamba,
  type8: buildType8,
  type10: buildType10,
  orca: buildOrca,
  beluga: buildBeluga,
  dolphin: buildDolphin,
  mandalay: buildMandalay,
};

// Generic fallback (shouldn't be needed — all ships have builders)
function buildGeneric(g, s, shipTypeId) {
  addMesh(g, new THREE.ConeGeometry(0.4*s, 1.6*s, 6), WIRE, [0, 0, 0], [-Math.PI/2, 0, 0]);
  for (const i of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.7*s, 0.04, 0.5*s), WIRE, [i*0.5*s, -0.05*s, 0.1*s], [0, i*0.2, 0]);
  }
  addMesh(g, new THREE.CylinderGeometry(0.12*s, 0.1*s, 0.4*s, 6), ACCENT, [0, 0, 0.8*s], [Math.PI/2, 0, 0]);
}