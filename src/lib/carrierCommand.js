// Carrier Command — unified fleet carrier management dashboard

import { calculateStationRevenue } from './stationBuilder';

export function getCarrierSummary(carrier, ownedShips) {
  if (!carrier) return null;
  const dockedShips = (ownedShips || []).filter(s => s.storedAt?.carrierId === carrier.id);
  const orders = carrier.orders || [];
  const now = Date.now();
  const lastCol = carrier.lastIncomeCollection || carrier.createdAt || now;
  const elapsedHours = Math.max(0, (now - lastCol) / 3600000);
  const activeOrders = carrier.services?.market ? orders.length : 0;
  const pendingRevenue = Math.floor(activeOrders * 500000 * elapsedHours);
  return {
    dockedShips: dockedShips.length,
    shipList: dockedShips,
    orders: orders.length,
    pendingRevenue,
    tritium: carrier.tritium || 0,
    tritiumCapacity: carrier.tritiumCapacity || 1000,
    bankBalance: carrier.bankBalance || 0,
    services: carrier.services || {},
    systemName: carrier.systemName || 'Unknown',
  };
}

export function getServiceStatus(carrier) {
  const services = carrier?.services || {};
  return [
    { id: 'market', label: 'Commodity Market', enabled: services.market },
    { id: 'shipyard', label: 'Shipyard', enabled: services.shipyard },
    { id: 'outfitting', label: 'Outfitting', enabled: services.outfitting },
    { id: 'refuel', label: 'Refuel Bay', enabled: services.refuel },
    { id: 'repair', label: 'Repair Bay', enabled: services.repair },
  ];
}