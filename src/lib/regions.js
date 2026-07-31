// Galaxy region names — named sectors based on galactic coordinates

export function getRegionName(x, y, z) {
  const r = Math.sqrt(x * x + y * y);

  if (r < 500) return 'Galactic Core';
  if (r > 17000) return 'The Outer Void';

  const angle = Math.atan2(y, x);
  const sector = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;

  // Distance from Sol (-5500, -4200)
  const solDist = Math.sqrt((x + 5500) ** 2 + (y + 4200) ** 2);
  if (solDist < 800) return 'Sol Sector';
  if (solDist < 2000) return 'Old World Reach';

  const innerRegions = [
    'Inner Scutum', 'Carina Arm', 'Norma Arm', 'Inner Sagittarius',
    'Scutum-Centaurus', 'Inner Perseus', 'Near 3kpc Arm', 'Outer Bulge',
  ];
  const middleRegions = [
    'Middle Scutum', 'Outer Carina', 'Norma Reach', 'Middle Sagittarius',
    'Centaurus Arm', 'Middle Perseus', 'Far 3kpc Arm', 'Lyra Bridge',
  ];
  const outerRegions = [
    'Outer Scutum', 'Formidine Rift', 'Sanguineous Rim', 'Outer Sagittarius',
    'Outer Centaurus', 'Perseus Stem', 'Achelous Sector', 'Cinder Void',
  ];

  if (r < 6000) return innerRegions[sector];
  if (r < 12000) return middleRegions[sector];
  return outerRegions[sector];
}

export function getRegionDescription(regionName) {
  const descs = {
    'Galactic Core': 'The supermassive black hole at the heart of the galaxy. Dense with ancient stars.',
    'The Outer Void': 'The vast, sparse frontier beyond the galactic disk. Few stars, infinite silence.',
    'Sol Sector': 'The birthplace of humanity. Dense with history and civilization.',
    'Formidine Rift': 'A mysterious gap between spiral arms, largely unexplored.',
    'Sanguineous Rim': 'The blood-red outer rim, named for its nebulae.',
  };
  return descs[regionName] || 'A region of the galaxy awaiting exploration.';
}