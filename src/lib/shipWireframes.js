// Ship wireframe builder — 8 distinct archetypes for all ship types
import * as THREE from 'three';
import { SHIP_MAP } from './gameState';

const ARCHETYPES = {
  wedge_fighter: ['sidewinder', 'eagle', 'viper', 'mamba', 'vulture'],
  hauler_box: ['hauler', 'adder', 'type6', 'type7', 'type8', 'type9', 'type10'],
  cobra_wing: ['cobra', 'cobramk4', 'cobramk5', 'krait_mk2', 'krait_phantom'],
  explorer: ['diamondback', 'asp', 'dolphin', 'mandalay'],
  combat_cruiser: ['federal_dropship', 'federal_assault', 'federal_corvette', 'alliance_chieftain', 'alliance_crusader', 'alliance_challenger', 'python_mk2'],
  large_multirole: ['python', 'anaconda'],
  imperial: ['imperial_courier', 'imperial_clipper', 'imperial_cutter'],
  passenger: ['orca', 'beluga'],
};

function getArchetype(id) {
  for (const [arch, ids] of Object.entries(ARCHETYPES)) {
    if (ids.includes(id)) return arch;
  }
  return 'wedge_fighter';
}

const WIRE = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
const ACCENT = new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true });

export function buildShipWireframe(shipTypeId) {
  const shipType = SHIP_MAP[shipTypeId];
  if (!shipType) return new THREE.Group();
  const arch = getArchetype(shipTypeId);
  const s = 0.8 + (shipType.class - 1) * 0.3;
  const g = new THREE.Group();
  switch (arch) {
    case 'wedge_fighter': buildWedge(g, s); break;
    case 'hauler_box': buildHauler(g, s); break;
    case 'cobra_wing': buildCobra(g, s); break;
    case 'explorer': buildExplorer(g, s); break;
    case 'combat_cruiser': buildCombat(g, s); break;
    case 'large_multirole': buildLarge(g, s); break;
    case 'imperial': buildImperial(g, s); break;
    case 'passenger': buildPassenger(g, s); break;
  }
  return g;
}

function buildWedge(g, s) {
  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.5 * s, 1.8 * s, 4), WIRE);
  hull.rotation.z = -Math.PI / 2; g.add(hull);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.6 * s, 0.04, 0.4 * s), WIRE);
  wing.position.set(0, -0.05 * s, 0.3 * s); g.add(wing);
  const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.12 * s, 0.4 * s, 6), ACCENT);
  eng.position.set(0, 0, 0.9 * s); eng.rotation.x = Math.PI / 2; g.add(eng);
  const cock = new THREE.Mesh(new THREE.SphereGeometry(0.15 * s, 6, 4), ACCENT);
  cock.position.set(0, 0.15 * s, -0.4 * s); g.add(cock);
}

function buildHauler(g, s) {
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.8 * s, 0.6 * s, 1.8 * s), WIRE); g.add(hull);
  const pod = new THREE.Mesh(new THREE.BoxGeometry(0.4 * s, 0.3 * s, 1.2 * s), ACCENT);
  pod.position.set(0, -0.4 * s, 0); g.add(pod);
  for (let i = -1; i <= 1; i += 2) {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.1 * s, 0.4 * s, 6), ACCENT);
    e.position.set(i * 0.3 * s, 0, 1 * s); e.rotation.x = Math.PI / 2; g.add(e);
  }
  const cock = new THREE.Mesh(new THREE.BoxGeometry(0.3 * s, 0.2 * s, 0.2 * s), WIRE);
  cock.position.set(0, 0.35 * s, -0.8 * s); g.add(cock);
}

function buildCobra(g, s) {
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.6 * s, 0.4 * s, 1.6 * s), WIRE); g.add(hull);
  for (let i = -1; i <= 1; i += 2) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.8 * s, 0.04, 0.6 * s), WIRE);
    w.position.set(i * 0.6 * s, -0.05 * s, 0.2 * s); w.rotation.y = i * 0.3; g.add(w);
  }
  for (let i = -1; i <= 1; i += 2) {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.1 * s, 0.4 * s, 6), ACCENT);
    e.position.set(i * 0.25 * s, 0, 0.9 * s); e.rotation.x = Math.PI / 2; g.add(e);
  }
  const cock = new THREE.Mesh(new THREE.SphereGeometry(0.15 * s, 6, 4), ACCENT);
  cock.position.set(0, 0.2 * s, -0.5 * s); g.add(cock);
}

function buildExplorer(g, s) {
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * s, 0.3 * s, 1.8 * s, 8), WIRE);
  hull.rotation.z = Math.PI / 2; g.add(hull);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.25 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), ACCENT);
  dish.position.set(0, 0.4 * s, -0.3 * s); g.add(dish);
  for (let i = -1; i <= 1; i += 2) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.6 * s, 0.04, 0.8 * s), WIRE);
    w.position.set(i * 0.5 * s, 0, 0.1 * s); g.add(w);
  }
  for (let i = -1; i <= 1; i += 2) {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.1 * s, 0.4 * s, 6), ACCENT);
    e.position.set(i * 0.25 * s, 0, 1 * s); e.rotation.x = Math.PI / 2; g.add(e);
  }
}

function buildCombat(g, s) {
  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.5 * s, 2 * s, 4), WIRE);
  hull.rotation.z = -Math.PI / 2; g.add(hull);
  for (let i = -1; i <= 1; i += 2) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.6 * s, 0.3 * s, 1 * s), ACCENT);
    p.position.set(i * 0.4 * s, -0.1 * s, 0.2 * s); g.add(p);
  }
  for (let i = -1; i <= 1; i++) {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.08 * s, 0.4 * s, 6), ACCENT);
    e.position.set(i * 0.25 * s, 0, 1.1 * s); e.rotation.x = Math.PI / 2; g.add(e);
  }
  const cock = new THREE.Mesh(new THREE.BoxGeometry(0.25 * s, 0.15 * s, 0.3 * s), ACCENT);
  cock.position.set(0, 0.25 * s, -0.6 * s); g.add(cock);
}

function buildLarge(g, s) {
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.5 * s, 0.4 * s, 2.5 * s, 8), WIRE);
  hull.rotation.z = Math.PI / 2; g.add(hull);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, 0.3 * s, 1.5 * s), ACCENT);
  upper.position.set(0, 0.35 * s, -0.2 * s); g.add(upper);
  for (let i = -1; i <= 1; i += 2) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.7 * s, 0.04, 0.6 * s), WIRE);
    w.position.set(i * 0.5 * s, -0.05 * s, 0.3 * s); g.add(w);
  }
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const e = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.08 * s, 0.4 * s, 6), ACCENT);
      e.position.set(i * 0.2 * s, j * 0.15 * s, 1.3 * s); e.rotation.x = Math.PI / 2; g.add(e);
    }
  }
}

function buildImperial(g, s) {
  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.4 * s, 2 * s, 6), WIRE);
  hull.rotation.z = -Math.PI / 2; g.add(hull);
  for (let i = -1; i <= 1; i += 2) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1 * s, 0.03, 0.8 * s), ACCENT);
    w.position.set(i * 0.6 * s, -0.05 * s, 0.1 * s); w.rotation.y = i * 0.2; g.add(w);
  }
  for (let i = -1; i <= 1; i += 2) {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.1 * s, 0.5 * s, 6), ACCENT);
    e.position.set(i * 0.2 * s, 0, 1.1 * s); e.rotation.x = Math.PI / 2; g.add(e);
  }
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4 * s, 0.3 * s), WIRE);
  fin.position.set(0, 0.3 * s, 0.2 * s); g.add(fin);
}

function buildPassenger(g, s) {
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * s, 0.3 * s, 2.2 * s, 8), WIRE);
  hull.rotation.z = Math.PI / 2; g.add(hull);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35 * s, 0.05, 4, 12), ACCENT);
  ring.rotation.y = Math.PI / 2; ring.position.x = -0.2 * s; g.add(ring);
  for (let i = -1; i <= 1; i += 2) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, 0.04, 0.7 * s), WIRE);
    w.position.set(i * 0.4 * s, -0.05 * s, 0.2 * s); g.add(w);
  }
  for (let i = -1; i <= 1; i += 2) {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.08 * s, 0.4 * s, 6), ACCENT);
    e.position.set(i * 0.2 * s, 0, 1.2 * s); e.rotation.x = Math.PI / 2; g.add(e);
  }
}