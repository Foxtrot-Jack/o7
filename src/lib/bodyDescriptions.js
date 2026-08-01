// Generates detailed procedural descriptions for celestial bodies based on their properties

const PLANET_TYPE_DESCRIPTIONS = {
  high_metal_content: 'a high metal content body with a dense, iron-rich mantle and a thin, rocky crust',
  rocky: 'a rocky terrestrial body with a heavily cratered, barren surface',
  rocky_ice: 'a rocky ice body where frozen volatiles mix with exposed bedrock across the surface',
  icy: 'an icy body shrouded in frozen volatiles and nitrogen frost',
  earthlike: 'an Earth-like world teeming with liquid water oceans, continental landmasses, and a breathable atmosphere',
  water_world: 'a water world covered almost entirely by deep liquid oceans with minimal land exposure',
  ammonia: 'an ammonia world with a toxic, amber-hued atmosphere and caustic surface conditions',
  gas_giant: 'a Class I gas giant with banded cloud layers of ammonia and hydrogen',
  gas_giant_ii: 'a Class II gas giant with swirling water-ice clouds and persistent atmospheric storms',
  gas_giant_iii: 'a Class III gas giant with deep, featureless ammonia cloud decks',
  gas_giant_iv: 'a Class IV gas giant with superheated atmospheric layers and convective metallic hydrogen',
  helium_rich: 'a helium-rich gas giant with a pale, inert atmosphere',
  helium_gas_giant: 'a helium gas giant with an unusually high helium-to-hydrogen ratio',
  metal_rich: 'a metal-rich body with a high-density core and molten surface deposits',
  desert: 'a desert world of endless dunes and arid, wind-swept plains',
  terracformed: 'a terraformed world deliberately engineered to support human habitation',
  lava: 'a lava world with seas of molten rock and violent, continuous volcanic activity',
  carbon: 'a carbon world with a dark, soot-like surface of compressed carbon compounds',
};

const MOON_TYPE_DESCRIPTIONS = {
  rocky: 'a rocky moon with a heavily cratered, airless surface',
  icy: 'an icy moon covered in frozen volatiles and surface fissures',
  metal_rich: 'a metal-rich moon with valuable surface deposits and a high-density core',
  rocky_ice: 'a rocky ice moon blending frozen terrain with exposed mineral-rich rock',
};

export function generateBodyDescription(body) {
  if (!body) return 'No scan data available for this body.';

  if (body.type === 'star') {
    return generateStarDescription(body);
  }

  if (body.type === 'belt') {
    return `An asteroid belt containing approximately ${(body.bodyCount || 0).toLocaleString()} individual bodies. ` +
      `The belt orbits at ${(body.orbitRadius || 0).toFixed(1)} AU from its parent body and contains recoverable minerals. ` +
      `Miners may find valuable deposits among the drifting rocks, though navigation through the field requires care.`;
  }

  if (body.type === 'asteroid') {
    return body.valuable
      ? 'A valuable stray asteroid rich in rare minerals. Spectral analysis indicates high concentrations of precious materials suitable for deep-core mining operations.'
      : 'A stray asteroid of ordinary silicate composition. Contains standard minerals of moderate industrial value.';
  }

  const isMoon = body.type === 'moon';
  const typeDesc = isMoon
    ? (MOON_TYPE_DESCRIPTIONS[body.planetType] || 'an unremarkable celestial body')
    : (PLANET_TYPE_DESCRIPTIONS[body.planetType] || 'an uncharted celestial body');

  const parts = [];
  parts.push(`This is ${typeDesc}.`);

  const temp = Math.round(body.temperature || 0);
  if (temp > 1500) {
    parts.push(`Surface temperatures reach a scorching ${temp} K, rendering the surface molten and inhospitable to all known materials.`);
  } else if (temp > 500) {
    parts.push(`With a surface temperature of ${temp} K, no known life forms can survive on the surface and water exists only as vapor.`);
  } else if (temp > 373) {
    parts.push(`At ${temp} K, water cannot exist in liquid form on the exposed surface.`);
  } else if (temp > 273) {
    parts.push(`The surface temperature of ${temp} K permits liquid water under suitable atmospheric conditions.`);
  } else if (temp > 150) {
    parts.push(`At ${temp} K, the surface is perpetually frozen, with any volatiles locked in solid ice.`);
  } else {
    parts.push(`The frigid ${temp} K surface is locked in deep freeze, preserving ancient primordial ices.`);
  }

  if (body.atmosphere) {
    parts.push('An atmosphere is present, though detailed compositional analysis requires further study.');
  } else {
    parts.push('The body lacks a significant atmosphere, leaving its surface exposed to stellar radiation and micrometeorite impacts.');
  }

  const g = (body.gravity || 0).toFixed(2);
  if (body.gravity > 2.5) {
    parts.push(`Gravity is intense at ${g} G, posing significant challenges for surface operations and requiring reinforced landing gear.`);
  } else if (body.gravity > 0.8) {
    parts.push(`Gravity of ${g} G is comparable to Earth-standard, facilitating relatively routine surface operations.`);
  } else if (body.gravity > 0.1) {
    parts.push(`Low gravity of ${g} G makes surface traversal efficient but requires careful throttle management to avoid uncontrolled bounces.`);
  } else {
    parts.push(`Negligible gravity of ${g} G creates a near-weightless environment on the surface.`);
  }

  if (body.habitable) {
    parts.push('This world is classified as habitable, with conditions theoretically suitable for human colonization and self-sustaining settlement.');
  }

  if (body.volcanic) {
    parts.push('Active volcanic processes continually reshape the surface, creating dynamic and geologically hazardous terrain.');
  }

  if (body.hasRings) {
    parts.push(`A prominent ${(body.ringType || 'rocky')} ring system encircles the body, offering lucrative mining opportunities within the ring debris.`);
  }

  const signals = body.surfaceSignals || [];
  const bio = signals.filter(s => s.type === 'biological');
  const geo = signals.filter(s => s.type === 'geological');
  const min = signals.filter(s => s.type === 'mineral');
  if (bio.length > 0) {
    parts.push(`Biological signals detected on the surface: ${bio.map(s => s.name).join(', ')}. These organisms have adapted to the local environmental conditions and represent valuable xenobiological data.`);
  }
  if (geo.length > 0) {
    parts.push(`Notable geological features identified: ${geo.map(s => s.name).join(', ')}.`);
  }
  if (min.length > 0) {
    parts.push(`Mineral surface deposits confirmed: ${min.map(s => s.name).join(', ')}.`);
  }

  if (body.materials && body.materials.length > 0) {
    const topMats = body.materials.slice(0, 5).map(m => m.id.replace(/_/g, ' '));
    parts.push(`Surface material composition analysis reveals concentrations of: ${topMats.join(', ')}${body.materials.length > 5 ? ', and other trace elements' : ''}.`);
  }

  const orbit = (body.orbitRadius || 0).toFixed(1);
  const period = (body.orbitPeriod || 0).toFixed(1);
  parts.push(`The body orbits its parent at a distance of ${orbit} AU with an orbital period of approximately ${period} standard days.`);

  return parts.join(' ');
}

function generateStarDescription(body) {
  const cls = body.starClass;
  const parts = [];
  parts.push(`This is a ${cls?.name || 'stellar'} body of spectral class ${cls?.class || 'unknown'}.`);
  parts.push(`The photosphere temperature is approximately ${Math.round(body.temperature || 0)} K, with a radius of ${(body.radius || 0).toFixed(2)} solar radii.`);

  if (cls?.class === 'NS') {
    parts.push('This neutron star emits intense radiation and powerful magnetic fields from its collapsed core. Frame Shift Drive supercharging is possible within its polar jets, though the radiation environment is extremely hazardous.');
  } else if (cls?.class === 'BH') {
    parts.push('This black hole distorts spacetime around its event horizon, where matter is compressed beyond known physical limits. Approach with extreme caution; the gravitational lensing effect is visually distinctive.');
  } else if (cls?.class === 'D') {
    parts.push('A stellar remnant, this white dwarf glows with residual heat from its former life. Its dense, degenerate matter represents the final evolutionary stage of a main-sequence star.');
  } else if (cls?.class === 'O' || cls?.class === 'B') {
    parts.push('This massive, hot-burning star emits intense ultraviolet radiation, making close approach hazardous. Its short stellar lifespan ends in a dramatic supernova event.');
  } else if (cls?.class === 'M') {
    parts.push('This cool red dwarf fuses hydrogen slowly, giving it an exceptionally long and stable lifespan. Such stars are prime candidates for hosting habitable-zone planets.');
  } else {
    parts.push('The star fuses hydrogen in its core, providing the primary energy source for this system and sustaining any dependent planetary environments.');
  }

  return parts.join(' ');
}