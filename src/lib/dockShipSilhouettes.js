// Dock Camera ship silhouettes — vector hulls keyed by manufacturer, scaled by ship class.
// Drawn in local space pointing +x (travel direction), centered on origin.
// Provides a few dozen visually distinct silhouettes (8 manufacturer shapes x 4 class sizes).

const CLASS_SCALE = { 1: 0.7, 2: 1.0, 3: 1.45, 4: 1.95 };

const SHAPE_BY_MFR = {
  'Drake-Voss': 'trader',
  'Orion Heavy': 'hauler',
  'Sentinel Forge': 'combat',
  'Kepler Aeroworks': 'explorer',
  'Meridian Luxe': 'luxury',
  'Solaris Dynasty': 'imperial',
  'Proxima Corp': 'explorer',
  'Omega Corp': 'generic',
  'Vortex Dynamics': 'combat',
  'Stellaris Corp': 'imperial',
  'Nova Forge': 'hauler',
  'Helios Dynamics': 'explorer',
  'Independent': 'generic',
};

function traceHull(ctx, shape) {
  ctx.beginPath();
  switch (shape) {
    case 'trader':
      ctx.moveTo(13, 0); ctx.lineTo(3, -4); ctx.lineTo(-6, -7); ctx.lineTo(-11, -3);
      ctx.lineTo(-11, 3); ctx.lineTo(-6, 7); ctx.lineTo(3, 4); ctx.closePath();
      break;
    case 'hauler':
      ctx.moveTo(10, -4); ctx.lineTo(10, 4); ctx.lineTo(-9, 6); ctx.lineTo(-12, 3);
      ctx.lineTo(-12, -3); ctx.lineTo(-9, -6); ctx.closePath();
      break;
    case 'combat':
      ctx.moveTo(13, 0); ctx.lineTo(-2, -6); ctx.lineTo(-11, -4); ctx.lineTo(-9, 0);
      ctx.lineTo(-11, 4); ctx.lineTo(-2, 6); ctx.closePath();
      break;
    case 'explorer':
      ctx.moveTo(14, 0); ctx.lineTo(2, -3); ctx.lineTo(-10, -4); ctx.lineTo(-13, 0);
      ctx.lineTo(-10, 4); ctx.lineTo(2, 3); ctx.closePath();
      break;
    case 'luxury':
      ctx.moveTo(12, 0); ctx.bezierCurveTo(8, -5, -6, -6, -12, -3);
      ctx.lineTo(-12, 3); ctx.bezierCurveTo(-6, 6, 8, 5, 12, 0); ctx.closePath();
      break;
    case 'imperial':
      ctx.moveTo(13, 0); ctx.lineTo(5, -5); ctx.lineTo(-5, -7); ctx.lineTo(-11, -3);
      ctx.lineTo(-11, 3); ctx.lineTo(-5, 7); ctx.lineTo(5, 5); ctx.closePath();
      break;
    default: // generic
      ctx.moveTo(12, 0); ctx.lineTo(-2, -4); ctx.lineTo(-10, -3); ctx.lineTo(-10, 3); ctx.lineTo(-2, 4); ctx.closePath();
  }
}

function accents(ctx, shape) {
  switch (shape) {
    case 'trader':
      ctx.beginPath(); ctx.arc(7, 0, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-12, -3, 2, 1.5); ctx.fillRect(-12, 1.5, 2, 1.5);
      break;
    case 'hauler':
      ctx.fillRect(-6, -5.5, 3, 2); ctx.fillRect(-2, -5.5, 3, 2);
      ctx.fillRect(-6, 3.5, 3, 2); ctx.fillRect(-2, 3.5, 3, 2);
      break;
    case 'combat':
      ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(-9, -7); ctx.lineTo(-8, -4); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4, 5); ctx.lineTo(-9, 7); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(5, 0, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    case 'explorer':
      ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, -7); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -7, 1, 0, Math.PI * 2); ctx.fill();
      break;
    case 'luxury':
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(2 - i * 4, 0, 0.8, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'imperial':
      ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(-8, -10); ctx.lineTo(-3, -7); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-5, 7); ctx.lineTo(-8, 10); ctx.lineTo(-3, 7); ctx.closePath(); ctx.fill();
      break;
    default:
      ctx.beginPath(); ctx.arc(6, 0, 1.4, 0, Math.PI * 2); ctx.fill();
  }
}

// Draw a ship silhouette. Caller has already translated + rotated to the ship's
// position/heading. color = hull fill, glowColor = engine exhaust.
export function drawSilhouette(ctx, ship, color, glowColor) {
  const s = CLASS_SCALE[ship.class] || 1;
  const shape = SHAPE_BY_MFR[ship.manufacturer] || 'generic';

  // hull
  ctx.save();
  ctx.scale(s, s);
  traceHull(ctx, shape);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.5 / s;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  accents(ctx, shape);
  ctx.restore();

  // engine glow
  ctx.save();
  ctx.scale(s, s);
  ctx.fillStyle = glowColor;
  if ((ship.class || 2) >= 3) {
    ctx.fillRect(-13, -3, 2, 1.5);
    ctx.fillRect(-13, 1.5, 2, 1.5);
  } else {
    ctx.fillRect(-12.5, -1, 2, 2);
  }
  ctx.restore();
}

// Visual radius (for hit-testing / selection ring), already class-scaled.
export function shipVisualRadius(ship) {
  return Math.round(14 * (CLASS_SCALE[ship.class] || 1));
}