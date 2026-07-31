// Company Screen — trade contracts and carrier orders for passive income
import React, { useState, useEffect } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { COMMODITIES, COMMODITY_MAP } from '@/lib/commodities';
import { Briefcase, TrendingUp, Plus, Trash2, Coins, Clock, Building2, Ship as ShipIcon, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

const REGISTRATION_COST = 1000000;
const ORDER_INCOME_PER_HOUR = 500000;
const MAX_ORDERS = 5;
const REP_TITLES = ['Rookie', 'Novice', 'Competent', 'Skilled', 'Professional', 'Expert', 'Master', 'Veteran', 'Elite', 'Elite I', 'Elite II'];

function getRepLevel(total) { return Math.min(10, Math.floor((total || 0) / 100000000)); }
function getRepMult(total) { return 1 + getRepLevel(total) * 0.05; }
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function CompanyScreen() {
  const { state, isSandbox, createCompany, assignShipToContract, recallShipFromContract, collectCompanyIncome, setCarrierOrder, removeCarrierOrder, collectCarrierIncome } = useGameState();
  const [name, setName] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!state.company) return;
    const i = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(i);
  }, [!!state.company]);

  // Creation view
  if (!state.company) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-orange-900 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-orange-500" />
            <h2 className="text-orange-300 font-bold uppercase text-sm">Establish a Company</h2>
          </div>
          <p className="text-orange-600 text-xs leading-relaxed">
            Register a trade company to generate passive income. Assign spare ships to trade contracts and they'll earn credits around the clock while you explore, trade, or mine — a stepping stone toward your first fleet carrier.
          </p>
          <div className="text-orange-700 text-[10px] space-y-0.5">
            <div>• Registration fee: {REGISTRATION_COST.toLocaleString()} CR</div>
            <div>• Income based on ship cargo capacity & jump range</div>
            <div>• Reputation grows with earnings (up to +50% income)</div>
            <div>• Carrier order income available once you own a carrier</div>
          </div>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Company name..." className="w-full bg-black border border-orange-900 text-orange-300 px-3 py-2 text-xs outline-none focus:border-orange-500" />
          <button onClick={() => createCompany(name.trim() || 'Independent Corp')} disabled={!isSandbox && state.credits < REGISTRATION_COST} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed">
            <Briefcase className="w-3.5 h-3.5 inline mr-1.5" /> REGISTER COMPANY
          </button>
          {!isSandbox && state.credits < REGISTRATION_COST && (
            <div className="text-red-600 text-[10px] text-center">Insufficient credits ({(REGISTRATION_COST - state.credits).toLocaleString()} CR short)</div>
          )}
        </div>
      </div>
    );
  }

  const company = state.company;
  const repLevel = getRepLevel(company.totalCollected);
  const repMult = getRepMult(company.totalCollected);
  const elapsedH = (Date.now() - company.lastCollection) / 3600000;
  const pending = Math.floor(company.contracts.reduce((s, c) => s + c.incomePerHour * elapsedH * repMult, 0));
  const rate = Math.floor(company.contracts.reduce((s, c) => s + c.incomePerHour * repMult, 0));

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      {/* Company header */}
      <div className="border border-orange-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-500" />
            <h2 className="text-orange-300 font-bold uppercase text-sm">{company.name}</h2>
          </div>
          <div className="text-right">
            <div className="text-orange-700 text-[10px] uppercase">Reputation</div>
            <div className="text-orange-300 text-xs">Lv{repLevel} — {REP_TITLES[repLevel]}</div>
            <div className="text-green-600 text-[10px]">+{Math.round((repMult - 1) * 100)}% income</div>
          </div>
        </div>
        <div className="text-orange-600 text-[10px]">Total Earned: <span className="text-orange-300">{(company.totalCollected || 0).toLocaleString()} CR</span></div>
      </div>

      {/* Pending income */}
      <div className="border border-green-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-green-500" />
          <h3 className="text-green-400 text-xs font-bold uppercase">Pending Contract Income</h3>
        </div>
        <div className="text-green-300 text-2xl font-bold">{pending.toLocaleString()} CR</div>
        <div className="flex items-center justify-between text-[10px] text-orange-700">
          <span><TrendingUp className="w-3 h-3 inline" /> Rate: {rate.toLocaleString()} CR/hr</span>
          <span><Clock className="w-3 h-3 inline" /> Last collected: {timeAgo(company.lastCollection)} ago</span>
        </div>
        <button onClick={collectCompanyIncome} disabled={pending <= 0} className="w-full py-2 border border-green-500 text-green-300 hover:bg-green-950/50 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed">
          COLLECT INCOME
        </button>
      </div>

      {/* Trade Contracts */}
      <ContractSection
        contracts={company.contracts}
        ownedShips={state.ownedShips}
        onAssign={assignShipToContract}
        onRecall={recallShipFromContract}
        repMult={repMult}
      />

      {/* Carrier Orders */}
      {state.fleetCarriers.length > 0 && (
        <CarrierOrderSection
          carriers={state.fleetCarriers}
          onSetOrder={setCarrierOrder}
          onRemoveOrder={removeCarrierOrder}
          onCollect={collectCarrierIncome}
        />
      )}
    </div>
  );
}

function ContractSection({ contracts, ownedShips, onAssign, onRecall, repMult }) {
  return (
    <div className="border border-orange-900 p-3 space-y-3">
      <h3 className="text-orange-500 text-xs font-bold uppercase flex items-center gap-1.5">
        <ShipIcon className="w-3.5 h-3.5" /> Trade Contracts ({contracts.length})
      </h3>
      <p className="text-orange-700 text-[10px]">Assign spare ships to autonomous trade routes. Income scales with cargo capacity and jump range.</p>

      {contracts.length > 0 && (
        <div className="space-y-1">
          {contracts.map(c => (
            <div key={c.id} className="border border-orange-950 p-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-orange-300 font-bold">{c.shipName}</span>
                  <span className="text-orange-700 ml-1">({SHIP_MAP[c.shipTypeId]?.name || c.shipTypeId})</span>
                </div>
                <button onClick={() => onRecall(c.id)} className="px-2 py-0.5 border border-yellow-700 text-yellow-500 hover:bg-yellow-950/30 text-[10px]">RECALL</button>
              </div>
              <div className="text-orange-600 text-[10px] mt-0.5">
                Rate: <span className="text-green-500">{Math.round(c.incomePerHour * repMult).toLocaleString()} CR/hr</span> · Assigned {timeAgo(c.assignedAt)} ago
              </div>
            </div>
          ))}
        </div>
      )}

      {ownedShips.length > 0 ? (
        <div className="space-y-1">
          <div className="text-orange-700 text-[10px] uppercase">Available Ships</div>
          {ownedShips.map(s => (
            <div key={s.id} className="flex items-center justify-between border border-orange-950 p-2 text-xs">
              <div>
                <span className="text-orange-400">{s.customName}</span>
                <span className="text-orange-700 ml-1">({SHIP_MAP[s.typeId]?.name || s.typeId})</span>
              </div>
              <button onClick={() => onAssign(s.id)} className="px-2 py-0.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px]">ASSIGN</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-orange-800 text-[10px] text-center py-2">No spare ships. Purchase additional ships at a station to assign them to contracts.</div>
      )}
    </div>
  );
}

function CarrierOrderSection({ carriers, onSetOrder, onRemoveOrder, onCollect }) {
  const [selectedCarrier, setSelectedCarrier] = useState(carriers[0]?.id || '');
  const [orderType, setOrderType] = useState('buy');
  const [commodityId, setCommodityId] = useState(COMMODITIES[0]?.id || '');

  const carrier = carriers.find(c => c.id === selectedCarrier) || carriers[0];
  if (!carrier) return null;

  const orders = carrier.orders || [];
  const marketEnabled = carrier.services?.market;
  const lastCol = carrier.lastIncomeCollection || carrier.createdAt || Date.now();
  const elapsedH = Math.max(0, (Date.now() - lastCol) / 3600000);
  const activeOrders = marketEnabled ? orders.length : 0;
  const pendingCarrier = Math.floor(activeOrders * ORDER_INCOME_PER_HOUR * elapsedH);

  return (
    <div className="border border-purple-900 p-3 space-y-3">
      <h3 className="text-purple-400 text-xs font-bold uppercase flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5" /> Carrier Trade Orders
      </h3>
      <p className="text-orange-700 text-[10px]">Set buy/sell orders on your fleet carrier for passive income. Requires the MARKET service enabled on the carrier.</p>

      {carriers.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          {carriers.map(c => (
            <button key={c.id} onClick={() => setSelectedCarrier(c.id)} className={`px-2 py-1 border text-[10px] ${selectedCarrier === c.id ? 'border-purple-500 bg-purple-950/30 text-purple-300' : 'border-purple-900 text-purple-700'}`}>{c.name}</button>
          ))}
        </div>
      )}

      {!marketEnabled && (
        <div className="text-yellow-600 text-[10px] border border-yellow-900 p-2 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> Market service is disabled on {carrier.name}. Enable it from the Carriers screen to generate order income.
        </div>
      )}

      <div className="flex items-center justify-between border border-purple-950 p-2">
        <div className="text-xs">
          <div className="text-purple-300">Pending: <span className="text-green-400">{pendingCarrier.toLocaleString()} CR</span></div>
          <div className="text-purple-700 text-[10px]">{activeOrders} active order{activeOrders !== 1 ? 's' : ''} · {ORDER_INCOME_PER_HOUR.toLocaleString()} CR/hr each</div>
        </div>
        <button onClick={() => onCollect(carrier.id)} disabled={pendingCarrier <= 0} className="px-3 py-1 border border-green-500 text-green-300 hover:bg-green-950/50 text-[10px] font-bold disabled:opacity-30">COLLECT</button>
      </div>

      {orders.length > 0 && (
        <div className="space-y-1">
          {orders.map(o => {
            const comm = COMMODITY_MAP[o.commodityId];
            return (
              <div key={o.id} className="flex items-center justify-between border border-purple-950 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={o.type === 'buy' ? 'text-cyan-400' : 'text-orange-400'}>
                    {o.type === 'buy' ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />}
                    {' '}{o.type.toUpperCase()}
                  </span>
                  <span className="text-purple-300">{comm?.name || o.commodityId}</span>
                </div>
                <button onClick={() => onRemoveOrder(carrier.id, o.id)} className="text-red-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            );
          })}
        </div>
      )}

      {orders.length < MAX_ORDERS ? (
        <div className="border border-purple-950 p-2 space-y-2">
          <div className="text-purple-700 text-[10px] uppercase">New Order ({orders.length}/{MAX_ORDERS})</div>
          <div className="flex gap-1">
            <button onClick={() => setOrderType('buy')} className={`flex-1 py-1 border text-[10px] ${orderType === 'buy' ? 'border-cyan-600 text-cyan-400' : 'border-purple-900 text-purple-800'}`}>BUY</button>
            <button onClick={() => setOrderType('sell')} className={`flex-1 py-1 border text-[10px] ${orderType === 'sell' ? 'border-orange-600 text-orange-400' : 'border-purple-900 text-purple-800'}`}>SELL</button>
          </div>
          <select value={commodityId} onChange={e => setCommodityId(e.target.value)} className="w-full bg-black border border-purple-900 text-purple-300 px-2 py-1 text-xs outline-none focus:border-purple-500">
            {COMMODITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => { onSetOrder(carrier.id, { type: orderType, commodityId }); }} className="w-full py-1.5 border border-purple-500 text-purple-300 hover:bg-purple-950/50 text-[10px] font-bold flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> ADD ORDER
          </button>
        </div>
      ) : (
        <div className="text-purple-800 text-[10px] text-center py-1">Maximum orders reached ({MAX_ORDERS}/{MAX_ORDERS})</div>
      )}
    </div>
  );
}