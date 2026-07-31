// ============================================================
// SHIP WIREFRAMES — Clean, minimal, recognizable shapes
// "Less is more" — each ship uses 3-6 pieces max
// Hull + Wings + Engines = instantly readable as a ship
// ============================================================
import * as THREE from 'three';
import { SHIP_MAP } from './gameState';

const W = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
const E = new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true });
const C = new THREE.MeshBasicMaterial({ color: 0xffcc66, wireframe: true });

function p(geo, mat, x, y, z, rx, ry, rz) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x||0, y||0, z||0);
  m.rotation.set(rx||0, ry||0, rz||0);
  return m;
}

// Geometry helpers — all low-poly for clean wireframe
const cone4 = (r, h) => new THREE.ConeGeometry(r, h, 4);
const cone6 = (r, h) => new THREE.ConeGeometry(r, h, 6);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r, h) => new THREE.CylinderGeometry(r, r, h, 6);
const eng = (r, h) => new THREE.CylinderGeometry(r, r * 0.85, h, 6);
const wing = (w, d) => new THREE.BoxGeometry(w, 0.02, d);

// Orientation: Nose = -Z, Engines = +Z, Left = -X, Right = +X, Up = +Y
// Cone: rx = -PI/2 makes tip point -Z (forward)
// Cylinder: rx = PI/2 makes axis go along Z (horizontal)

export function buildShipWireframe(id) {
  const st = SHIP_MAP[id];
  if (!st) return new THREE.Group();
  const s = 0.6 + (st.class - 1) * 0.2;
  const g = new THREE.Group();
  const builder = BUILDERS[id] || buildGeneric;
  builder(g, s);
  return g;
}

// ---- Small fighters (Class 1) ----

function buildSidewinder(g, s) {
  g.add(p(cone4(0.35*s, 1.3*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.5*s, 0.35*s), W, 0.35*s, 0, 0.05*s, 0, -0.2));
  g.add(p(wing(0.5*s, 0.35*s), W, -0.35*s, 0, 0.05*s, 0, 0.2));
  g.add(p(eng(0.08*s, 0.2*s), E, 0.1*s, 0, 0.6*s, Math.PI/2));
  g.add(p(eng(0.08*s, 0.2*s), E, -0.1*s, 0, 0.6*s, Math.PI/2));
}

function buildEagle(g, s) {
  g.add(p(cone4(0.3*s, 1.0*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.4*s, 0.3*s), W, 0.28*s, 0, 0.05*s, 0, 0.25));
  g.add(p(wing(0.4*s, 0.3*s), W, -0.28*s, 0, 0.05*s, 0, -0.25));
  g.add(p(eng(0.1*s, 0.25*s), E, 0, 0, 0.5*s, Math.PI/2));
}

function buildHauler(g, s) {
  g.add(p(box(0.5*s, 0.4*s, 1.3*s), W));
  g.add(p(box(0.35*s, 0.2*s, 0.8*s), W, 0, -0.28*s, 0));
  g.add(p(eng(0.12*s, 0.25*s), E, 0, 0, 0.7*s, Math.PI/2));
  g.add(p(box(0.25*s, 0.15*s, 0.15*s), C, 0, 0.25*s, -0.65*s));
}

function buildAdder(g, s) {
  g.add(p(box(0.55*s, 0.4*s, 1.2*s), W));
  g.add(p(wing(0.5*s, 0.5*s), W, 0.45*s, -0.05*s, 0));
  g.add(p(wing(0.5*s, 0.5*s), W, -0.45*s, -0.05*s, 0));
  g.add(p(eng(0.1*s, 0.2*s), E, 0.4*s, -0.05*s, 0.5*s, Math.PI/2));
  g.add(p(eng(0.1*s, 0.2*s), E, -0.4*s, -0.05*s, 0.5*s, Math.PI/2));
}

function buildViper(g, s) {
  g.add(p(cone4(0.3*s, 1.5*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.45*s, 0.4*s), W, 0.32*s, 0, 0.1*s, 0, -0.2));
  g.add(p(wing(0.45*s, 0.4*s), W, -0.32*s, 0, 0.1*s, 0, 0.2));
  g.add(p(eng(0.09*s, 0.2*s), E, 0.12*s, 0, 0.7*s, Math.PI/2));
  g.add(p(eng(0.09*s, 0.2*s), E, -0.12*s, 0, 0.7*s, Math.PI/2));
}

// ---- Medium ships (Class 2) ----

function buildCobra(g, s) {
  g.add(p(box(0.45*s, 0.3*s, 1.5*s), W));
  g.add(p(cone4(0.22*s, 0.4*s), W, 0, 0, -0.85*s, -Math.PI/2));
  g.add(p(wing(0.65*s, 0.5*s), W, 0.5*s, -0.05*s, 0.1*s, 0, -0.3));
  g.add(p(wing(0.65*s, 0.5*s), W, -0.5*s, -0.05*s, 0.1*s, 0, 0.3));
  g.add(p(eng(0.12*s, 0.25*s), E, 0.2*s, 0, 0.75*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.25*s), E, -0.2*s, 0, 0.75*s, Math.PI/2));
}

function buildType6(g, s) {
  g.add(p(box(0.6*s, 0.55*s, 1.6*s), W));
  g.add(p(box(0.2*s, 0.3*s, 1.0*s), W, 0.42*s, -0.1*s, 0));
  g.add(p(box(0.2*s, 0.3*s, 1.0*s), W, -0.42*s, -0.1*s, 0));
  g.add(p(eng(0.12*s, 0.25*s), E, 0.22*s, 0, 0.8*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.25*s), E, -0.22*s, 0, 0.8*s, Math.PI/2));
}

function buildDiamondback(g, s) {
  g.add(p(cyl(0.25*s, 1.6*s), W, 0, 0, 0, Math.PI/2));
  g.add(p(wing(0.65*s, 0.6*s), W, 0.5*s, 0, 0));
  g.add(p(wing(0.65*s, 0.6*s), W, -0.5*s, 0, 0));
  g.add(p(eng(0.12*s, 0.3*s), E, 0.22*s, 0, 0.8*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, -0.22*s, 0, 0.8*s, Math.PI/2));
}

function buildDolphin(g, s) {
  g.add(p(cyl(0.22*s, 1.4*s), W, 0, 0, 0, Math.PI/2));
  g.add(p(cone6(0.22*s, 0.3*s), W, 0, 0, -0.75*s, -Math.PI/2));
  g.add(p(wing(0.4*s, 0.4*s), W, 0.35*s, -0.05*s, 0.1*s));
  g.add(p(wing(0.4*s, 0.4*s), W, -0.35*s, -0.05*s, 0.1*s));
  g.add(p(eng(0.1*s, 0.25*s), E, 0.15*s, 0, 0.7*s, Math.PI/2));
  g.add(p(eng(0.1*s, 0.25*s), E, -0.15*s, 0, 0.7*s, Math.PI/2));
}

function buildAsp(g, s) {
  g.add(p(box(0.6*s, 0.25*s, 1.3*s), W));
  g.add(p(box(0.15*s, 0.15*s, 0.6*s), W, 0.35*s, 0, 0.65*s));
  g.add(p(box(0.15*s, 0.15*s, 0.6*s), W, -0.35*s, 0, 0.65*s));
  g.add(p(cyl(0.16*s, 0.4*s), E, 0.35*s, 0, 1.0*s, Math.PI/2));
  g.add(p(cyl(0.16*s, 0.4*s), E, -0.35*s, 0, 1.0*s, Math.PI/2));
  g.add(p(cone6(0.18*s, 0.2*s), C, 0, 0.12*s, -0.55*s));
}

function buildVulture(g, s) {
  g.add(p(cone4(0.35*s, 1.3*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(cyl(0.2*s, 0.8*s), E, 0.4*s, -0.05*s, 0.3*s, Math.PI/2));
  g.add(p(cyl(0.2*s, 0.8*s), E, -0.4*s, -0.05*s, 0.3*s, Math.PI/2));
  g.add(p(wing(0.25*s, 0.4*s), W, 0.3*s, -0.05*s, 0));
  g.add(p(wing(0.25*s, 0.4*s), W, -0.3*s, -0.05*s, 0));
}

function buildMandalay(g, s) {
  g.add(p(cyl(0.25*s, 1.6*s), W, 0, 0, 0, Math.PI/2));
  g.add(p(wing(0.75*s, 0.6*s), W, 0.55*s, 0, 0));
  g.add(p(wing(0.75*s, 0.6*s), W, -0.55*s, 0, 0));
  g.add(p(eng(0.13*s, 0.3*s), E, 0.5*s, 0, 0.7*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.3*s), E, -0.5*s, 0, 0.7*s, Math.PI/2));
}

function buildKrait(g, s) {
  g.add(p(box(0.65*s, 0.25*s, 1.3*s), W));
  g.add(p(box(0.15*s, 0.15*s, 0.5*s), W, 0.38*s, 0, 0.6*s));
  g.add(p(box(0.15*s, 0.15*s, 0.5*s), W, -0.38*s, 0, 0.6*s));
  g.add(p(cyl(0.17*s, 0.4*s), E, 0.38*s, 0, 0.95*s, Math.PI/2));
  g.add(p(cyl(0.17*s, 0.4*s), E, -0.38*s, 0, 0.95*s, Math.PI/2));
  g.add(p(wing(0.4*s, 0.4*s), W, 0.55*s, -0.05*s, 0));
  g.add(p(wing(0.4*s, 0.4*s), W, -0.55*s, -0.05*s, 0));
}

function buildMamba(g, s) {
  g.add(p(cone4(0.3*s, 1.5*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.5*s, 0.45*s), W, 0.38*s, -0.05*s, 0.15*s, 0, -0.3));
  g.add(p(wing(0.5*s, 0.45*s), W, -0.38*s, -0.05*s, 0.15*s, 0, 0.3));
  g.add(p(eng(0.18*s, 0.35*s), E, 0, 0, 0.8*s, Math.PI/2));
}

function buildImperialCourier(g, s) {
  g.add(p(cone6(0.25*s, 1.5*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.6*s, 0.5*s), W, 0.45*s, -0.03*s, 0.1*s, 0, -0.25));
  g.add(p(wing(0.6*s, 0.5*s), W, -0.45*s, -0.03*s, 0.1*s, 0, 0.25));
  g.add(p(eng(0.1*s, 0.25*s), E, 0.12*s, 0, 0.75*s, Math.PI/2));
  g.add(p(eng(0.1*s, 0.25*s), E, -0.12*s, 0, 0.75*s, Math.PI/2));
}

// ---- Large ships (Class 3-4) ----

function buildType7(g, s) {
  g.add(p(box(0.7*s, 0.65*s, 1.8*s), W));
  g.add(p(eng(0.13*s, 0.3*s), E, 0.25*s, 0, 0.9*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.3*s), E, -0.25*s, 0, 0.9*s, Math.PI/2));
}

function buildFederalDropship(g, s) {
  g.add(p(box(0.65*s, 0.5*s, 1.5*s), W));
  g.add(p(box(0.22*s, 0.3*s, 0.7*s), W, 0.48*s, -0.05*s, 0.1*s));
  g.add(p(box(0.22*s, 0.3*s, 0.7*s), W, -0.48*s, -0.05*s, 0.1*s));
  g.add(p(eng(0.13*s, 0.25*s), E, 0.22*s, 0, 0.8*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.25*s), E, -0.22*s, 0, 0.8*s, Math.PI/2));
}

function buildAllianceChieftain(g, s) {
  g.add(p(cone4(0.35*s, 1.5*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.6*s, 0.5*s), W, 0.45*s, -0.05*s, 0.15*s, 0, 0.3));
  g.add(p(wing(0.6*s, 0.5*s), W, -0.45*s, -0.05*s, 0.15*s, 0, -0.3));
  g.add(p(cyl(0.15*s, 0.4*s), E, 0.28*s, 0, 0.8*s, Math.PI/2));
  g.add(p(cyl(0.15*s, 0.4*s), E, -0.28*s, 0, 0.8*s, Math.PI/2));
}

function buildImperialClipper(g, s) {
  g.add(p(cone6(0.3*s, 1.8*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.8*s, 0.65*s), W, 0.6*s, -0.03*s, 0.1*s, 0, -0.3));
  g.add(p(wing(0.8*s, 0.65*s), W, -0.6*s, -0.03*s, 0.1*s, 0, 0.3));
  g.add(p(eng(0.13*s, 0.3*s), E, 0.4*s, -0.03*s, 0.8*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.3*s), E, -0.4*s, -0.03*s, 0.8*s, Math.PI/2));
}

function buildPython(g, s) {
  g.add(p(box(0.7*s, 0.35*s, 1.5*s), W));
  g.add(p(box(0.22*s, 0.25*s, 1.0*s), W, 0.5*s, -0.05*s, 0.2*s));
  g.add(p(box(0.22*s, 0.25*s, 1.0*s), W, -0.5*s, -0.05*s, 0.2*s));
  g.add(p(eng(0.13*s, 0.25*s), E, 0.5*s, -0.05*s, 0.8*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.25*s), E, -0.5*s, -0.05*s, 0.8*s, Math.PI/2));
}

function buildOrca(g, s) {
  g.add(p(cyl(0.25*s, 1.8*s), W, 0, 0, 0, Math.PI/2));
  g.add(p(cone6(0.25*s, 0.4*s), W, 0, 0, -1.0*s, -Math.PI/2));
  g.add(p(wing(0.5*s, 0.55*s), W, 0.42*s, -0.05*s, 0.15*s));
  g.add(p(wing(0.5*s, 0.55*s), W, -0.42*s, -0.05*s, 0.15*s));
  g.add(p(eng(0.12*s, 0.3*s), E, 0.18*s, 0, 0.9*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, -0.18*s, 0, 0.9*s, Math.PI/2));
}

function buildType8(g, s) {
  g.add(p(box(0.65*s, 0.6*s, 1.7*s), W));
  g.add(p(eng(0.13*s, 0.28*s), E, 0.24*s, 0, 0.85*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.28*s), E, -0.24*s, 0, 0.85*s, Math.PI/2));
}

function buildBeluga(g, s) {
  g.add(p(cyl(0.35*s, 2.0*s), W, 0, 0, 0, Math.PI/2));
  g.add(p(cone6(0.35*s, 0.3*s), W, 0, 0, -1.05*s, -Math.PI/2));
  g.add(p(wing(0.55*s, 0.6*s), W, 0.5*s, -0.05*s, 0.15*s));
  g.add(p(wing(0.55*s, 0.6*s), W, -0.5*s, -0.05*s, 0.15*s));
  g.add(p(eng(0.13*s, 0.3*s), E, 0, 0, 1.05*s, Math.PI/2));
  g.add(p(eng(0.11*s, 0.28*s), E, 0.22*s, 0, 1.0*s, Math.PI/2));
  g.add(p(eng(0.11*s, 0.28*s), E, -0.22*s, 0, 1.0*s, Math.PI/2));
}

// ---- Very large ships (Class 4) ----

function buildAnaconda(g, s) {
  g.add(p(cyl(0.28*s, 2.5*s), W, 0, 0, 0, Math.PI/2));
  g.add(p(cone6(0.28*s, 0.5*s), W, 0, 0, -1.4*s, -Math.PI/2));
  g.add(p(wing(0.65*s, 0.55*s), W, 0.5*s, -0.05*s, 0.2*s));
  g.add(p(wing(0.65*s, 0.55*s), W, -0.5*s, -0.05*s, 0.2*s));
  g.add(p(eng(0.14*s, 0.3*s), E, 0, 0, 1.3*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.28*s), E, 0.22*s, 0, 1.25*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.28*s), E, -0.22*s, 0, 1.25*s, Math.PI/2));
}

function buildType9(g, s) {
  g.add(p(box(0.8*s, 0.7*s, 2.0*s), W));
  g.add(p(eng(0.12*s, 0.3*s), E, 0.3*s, 0.15*s, 1.0*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, -0.3*s, 0.15*s, 1.0*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, 0.3*s, -0.15*s, 1.0*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, -0.3*s, -0.15*s, 1.0*s, Math.PI/2));
}

function buildFederalCorvette(g, s) {
  g.add(p(box(0.65*s, 0.5*s, 2.2*s), W));
  g.add(p(cone4(0.3*s, 0.6*s), W, 0, 0, -1.3*s, -Math.PI/2));
  g.add(p(wing(0.65*s, 0.6*s), W, 0.55*s, -0.05*s, 0.2*s));
  g.add(p(wing(0.65*s, 0.6*s), W, -0.55*s, -0.05*s, 0.2*s));
  g.add(p(eng(0.12*s, 0.3*s), E, 0.25*s, 0.12*s, 1.1*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, -0.25*s, 0.12*s, 1.1*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, 0.25*s, -0.12*s, 1.1*s, Math.PI/2));
  g.add(p(eng(0.12*s, 0.3*s), E, -0.25*s, -0.12*s, 1.1*s, Math.PI/2));
}

function buildImperialCutter(g, s) {
  g.add(p(cone6(0.35*s, 2.2*s), W, 0, 0, 0, -Math.PI/2));
  g.add(p(wing(0.85*s, 0.7*s), W, 0.7*s, -0.03*s, 0.15*s, 0, -0.3));
  g.add(p(wing(0.85*s, 0.7*s), W, -0.7*s, -0.03*s, 0.15*s, 0, 0.3));
  g.add(p(eng(0.13*s, 0.3*s), E, 0.4*s, -0.03*s, 1.0*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.3*s), E, -0.4*s, -0.03*s, 1.0*s, Math.PI/2));
  g.add(p(eng(0.11*s, 0.28*s), E, 0.2*s, -0.03*s, 1.05*s, Math.PI/2));
  g.add(p(eng(0.11*s, 0.28*s), E, -0.2*s, -0.03*s, 1.05*s, Math.PI/2));
}

function buildType10(g, s) {
  g.add(p(box(0.9*s, 0.8*s, 2.2*s), W));
  for (const dx of [-0.35, 0, 0.35]) {
    for (const dy of [-0.2, 0.2]) {
      g.add(p(eng(0.1*s, 0.3*s), E, dx*s, dy*s, 1.1*s, Math.PI/2));
    }
  }
}

function buildPythonMk2(g, s) {
  g.add(p(box(0.7*s, 0.35*s, 1.4*s), W));
  g.add(p(box(0.22*s, 0.25*s, 0.9*s), W, 0.5*s, -0.05*s, 0.15*s));
  g.add(p(box(0.22*s, 0.25*s, 0.9*s), W, -0.5*s, -0.05*s, 0.15*s));
  g.add(p(eng(0.13*s, 0.25*s), E, 0.5*s, -0.05*s, 0.75*s, Math.PI/2));
  g.add(p(eng(0.13*s, 0.25*s), E, -0.5*s, -0.05*s, 0.75*s, Math.PI/2));
}

// ---- Builder registry ----
const BUILDERS = {
  sidewinder: buildSidewinder,
  eagle: buildEagle,
  hauler: buildHauler,
  adder: buildAdder,
  viper: buildViper,
  cobra: buildCobra,
  cobramk4: buildCobra,
  cobramk5: buildCobra,
  type6: buildType6,
  diamondback: buildDiamondback,
  dolphin: buildDolphin,
  asp: buildAsp,
  type7: buildType7,
  federal_dropship: buildFederalDropship,
  federal_assault: buildFederalDropship,
  vulture: buildVulture,
  mandalay: buildMandalay,
  krait_phantom: buildKrait,
  krait_mk2: buildKrait,
  mamba: buildMamba,
  imperial_courier: buildImperialCourier,
  imperial_clipper: buildImperialClipper,
  python: buildPython,
  python_mk2: buildPythonMk2,
  orca: buildOrca,
  type8: buildType8,
  type9: buildType9,
  beluga: buildBeluga,
  anaconda: buildAnaconda,
  federal_corvette: buildFederalCorvette,
  imperial_cutter: buildImperialCutter,
  type10: buildType10,
  alliance_chieftain: buildAllianceChieftain,
  alliance_crusader: buildAllianceChieftain,
  alliance_challenger: buildAllianceChieftain,
};

function buildGeneric(g, s) {
  g.add(p(box(0.5*s, 0.3*s, 1.4*s), W));
  g.add(p(wing(0.5*s, 0.4*s), W, 0.4*s, -0.05*s, 0.1*s));
  g.add(p(wing(0.5*s, 0.4*s), W, -0.4*s, -0.05*s, 0.1*s));
  g.add(p(eng(0.11*s, 0.25*s), E, 0, 0, 0.7*s, Math.PI/2));
}