// Station Builder — construct and manage player-owned orbital stations

export const STATION_ECONOMIES = [
  { id: 'agricultural', label: 'Agricultural', desc: 'Food production hub', revenueMult: 0.8 },
  { id: 'industrial', label: 'Industrial', desc: 'Manufacturing center', revenueMult: 1.2 },
  { id: 'mining', label: 'Mining', desc: 'Resource extraction outpost', revenueMult: 1.0 },
  { id: 'hightech', label: 'High Tech', desc: 'Advanced technology research', revenueMult: 1.5 },
  { id: 'refinery', label: 'Refinery', desc: 'Raw material processing', revenueMult: 1.1 },
];

export const STATION_SERVICES = [
  { id: 'market', label: 'Commodity Market', cost: 5000000, revenuePerHour: 200000 },
  { id: 'refuel', label: 'Refuel Bay', cost: 1000000, revenuePerHour: 50000 },
  { id: 'repair', label: 'Repair Bay', cost: 1000000, revenuePerHour: 50000 },
  { id: 'outfitting', label: 'Outfitting', cost: 10000000, revenuePerHour: 300000 },
  { id: 'shipyard', label: 'Shipyard', cost: 50000000, revenuePerHour: 800000 },
];

export const STATION_BUILD_COST = 50000000;

export function getStationRevenue(station) {
  if (!station) return 0;
  const economy = STATION_ECONOMIES.find(e => e.id === station.economy);
  const mult = economy?.revenueMult || 1.0;
  let baseRevenue = 100000; // base passive revenue
  for (const serviceId of (station.services || [])) {
    const svc = STATION_SERVICES.find(s => s.id === serviceId);
    if (svc) baseRevenue += svc.revenuePerHour;
  }
  return Math.round(baseRevenue * mult);
}

export function calculateStationRevenue(station, lastCollection) {
  const hours = Math.max(0, (Date.now() - (lastCollection || Date.now())) / 3600000);
  return Math.floor(getStationRevenue(station) * hours);
}