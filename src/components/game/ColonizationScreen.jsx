// Colonization Screen — establish and manage colonies
// Colonies generate passive credit income scaled by tier, infrastructure, and happiness
// Higher tiers require more infrastructure but unlock special features (material trader, engineer)
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { COMMODITY_MAP, COMMODITY_CATEGORIES } from '@/lib/commodities';
import { Rocket, Plus, Building, Users, Factory, Wheat, Beaker, Globe, TrendingUp, Package, Coins, ArrowLeftRight, Wrench, Sparkles, Store } from 'lucide-react';

const COLONY_STAGES = [
  { id: 0, name: 'Outpost', popRequired: 0, desc: 'Initial settlement with basic infrastructure.' },
  { id: 1, name: 'Settlement', popRequired: 1000, desc: 'Growing community with expanded facilities.' },
  { id: 2, name: 'Colony', popRequired: 10000, desc: 'Self-sustaining colony with industry.' },
  { id: 3, name: 'City', popRequired: 100000, desc: 'Major population center.' },
  { id: 4, name: 'Metropolis', popRequired: 1000000, desc: 'Thriving metropolitan world.' },
];

// Colony tiers — determine size, infrastructure effort, and rewards
// Small outposts are cheap and easy; dodec stations require massive effort but unlock special features
const COLONY_TIERS = [
  { id: 0, name: 'Outpost', infraTarget: 15, establishCost: 1000000, baseIncome: 25000, features: [], desc: 'Small frontier outpost. Minimal infrastructure needed.' },
  { id: 1, name: 'Settlement', infraTarget: 30, establishCost: 5000000, baseIncome: 100000, features: ['market'], desc: 'Growing settlement with basic trade facilities.' },
  { id: 2, name: 'Station', infraTarget: 50, establishCost: 20000000, baseIncome: 350000, features: ['market', 'outfitting'], desc: 'Full station with docking and outfitting.' },
  { id: 3, name: 'Large Station', infraTarget: 75, establishCost: 100000000, baseIncome: 1000000, features: ['market', 'outfitting', 'trader'], desc: 'Major trade hub with material trader access.' },
  { id: 4, name: 'Dodec Station', infraTarget: 100, establishCost: 500000000, baseIncome: 3500000, features: ['market', 'outfitting', 'trader', 'engineer'], desc: 'Mega-station with exclusive engineering access.' },
];

const FEATURE_INFO = {
  market: { name: 'Market', icon: Store },
  outfitting: { name: 'Outfitting', icon: Wrench },
  trader: { name: 'Material Trader', icon: ArrowLeftRight, bonus: '+20% income' },
  engineer: { name: 'Special Engineer', icon: Sparkles, bonus: '+50% income' },
};

const COLONY_TYPES = {
  agricultural: { name: 'Agricultural', icon: Wheat, incomeMult: 1.0 },
  industrial: { name: 'Industrial', icon: Factory, incomeMult: 1.2 },
  research: { name: 'Research', icon: Beaker, incomeMult: 1.5 },
  mining: { name: 'Mining', icon: TrendingUp, incomeMult: 1.1 },
  mixed: { name: 'Mixed', icon: Globe, incomeMult: 1.0 },
};

const DELIVERY_EFFECTS = {
  [COMMODITY_CATEGORIES.FOODS]: { happiness: 5, infrastructure: 0, growth: 0.01, label: '+5 Happiness/T' },
  [COMMODITY_CATEGORIES.MEDICAL]: { happiness: 10, infrastructure: 2, growth: 0.02, label: '+10 Happiness, +2 Infra/T' },
  [COMMODITY_CATEGORIES.TECHNOLOGY]: { happiness: 3, infrastructure: 5, growth: 0.01, label: '+5 Infra, +3 Happiness/T' },
  [COMMODITY_CATEGORIES.METALS]: { happiness: 0, infrastructure: 3, growth: 0, label: '+3 Infra/T' },
  [COMMODITY_CATEGORIES.MINERALS]: { happiness: 0, infrastructure: 2, growth: 0, label: '+2 Infra/T' },
  [COMMODITY_CATEGORIES.INDUSTRIAL]: { happiness: 0, infrastructure: 4, growth: 0, label: '+4 Infra/T' },
  [COMMODITY_CATEGORIES.CONSUMER]: { happiness: 4, infrastructure: 0, growth: 0.01, label: '+4 Happiness/T' },
  [COMMODITY_CATEGORIES.CHEMICALS]: { happiness: 1, infrastructure: 2, growth: 0, label: '+2 Infra, +1 Happiness/T' },
  [COMMODITY_CATEGORIES.LEGAL_DRUGS]: { happiness: 6, infrastructure: 0, growth: 0, label: '+6 Happiness/T' },
  [COMMODITY_CATEGORIES.SALVAGE]: { happiness: 0, infrastructure: 1, growth: 0, label: '+1 Infra/T' },
  [COMMODITY_CATEGORIES.RAW]: { happiness: 0, infrastructure: 1, growth: 0, label: '+1 Infra/T' },
  [COMMODITY_CATEGORIES.TEXTILES]: { happiness: 2, infrastructure: 1, growth: 0.01, label: '+1 Infra, +2 Happiness/T' },
  [COMMODITY_CATEGORIES.WEAPONS]: { happiness: 0, infrastructure: 3, growth: 0, label: '+3 Infra/T' },
};

function getColonyIncomePerHour(colony) {
  const tier = COLONY_TIERS[colony.tier ?? 0];
  const type = COLONY_TYPES[colony.type] || COLONY_TYPES.mixed;
  const infraFactor = Math.min(1, (colony.infrastructure || 0) / tier.infraTarget);
  const happinessFactor = ((colony.happiness || 0) / 100) * 0.5 + 0.5;
  const stageBonus = 1 + (colony.stage || 0) * 0.2;
  let featureMult = 1;
  if (infraFactor >= 1) {
    if (tier.features.includes('trader')) featureMult += 0.2;
    if (tier.features.includes('engineer')) featureMult += 0.5;
  }
  return Math.round(tier.baseIncome * type.incomeMult * infraFactor * happinessFactor * stageBonus * featureMult);
}

function getUncollectedIncome(colony) {
  const now = Date.now();
  const lastCol = colony.lastIncomeCollection ?? colony.establishedAt ?? colony.lastUpdate ?? now;
  const elapsedHours = Math.max(0, (now - lastCol) / 3600000);
  return Math.floor(getColonyIncomePerHour(colony) * elapsedHours);
}

export default function ColonizationScreen() {
  const { state, getSystemData, addColony, updateColony, addCredits, removeCargo } = useGameState();
  const systemData = getSystemData();
  const [showEstablish, setShowEstablish] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedType, setSelectedType] = useState('agricultural');
  const [selectedTier, setSelectedTier] = useState(0);
  const [targetType, setTargetType] = useState('body');
  const [selectedPort, setSelectedPort] = useState(null);
  const [deliverColony, setDeliverColony] = useState(null);

  const colonizableBodies = useMemo(() => {
    if (!systemData) return [];
    const colonizedIds = state.colonies.map(c => c.bodyId);
    return systemData.bodies.filter(b =>
      b.type === BODY_TYPES.PLANET &&
      b.landable &&
      !colonizedIds.includes(b.id) &&
      (b.habitable || b.terraformed || b.atmosphere || b.gravity < 2)
    );
  }, [systemData, state.colonies]);

  const colonizablePorts = useMemo(() => {
    if (!systemData) return [];
    const colonizedStationIds = state.colonies.filter(c => c.isPort).map(c => c.stationId);
    return systemData.stations.filter(s => !colonizedStationIds.includes(s.id));
  }, [systemData, state.colonies]);

  const establishmentCost = COLONY_TIERS[selectedTier].establishCost;

  const handleEstablish = () => {
    const target = targetType === 'body' ? selectedBody : selectedPort;
    if (!target) return;
    if (state.credits < establishmentCost) {
      alert('INSUFFICIENT CREDITS FOR COLONIZATION');
      return;
    }

    const colonyType = COLONY_TYPES[selectedType];
    const tier = COLONY_TIERS[selectedTier];
    const colony = {
      id: `colony_${Date.now()}`,
      bodyId: targetType === 'body' ? target.id : null,
      stationId: targetType === 'port' ? target.id : null,
      bodyName: targetType === 'body' ? target.designation : target.name,
      isPort: targetType === 'port',
      portType: targetType === 'port' ? target.type : null,
      systemName: state.currentSystem.name,
      systemSeed: state.currentSystem.seed,
      type: selectedType,
      typeName: colonyType.name,
      tier: selectedTier,
      tierName: tier.name,
      stage: 0,
      population: 50,
      growthRate: (1 + Math.floor(Math.random() * 5)) / 10,
      happiness: 80,
      infrastructure: 10,
      infraTarget: tier.infraTarget,
      lastUpdate: Date.now(),
      lastIncomeCollection: Date.now(),
      establishedAt: Date.now(),
    };

    addCredits(-establishmentCost);
    addColony(colony);
    setShowEstablish(false);
    setSelectedBody(null);
    setSelectedPort(null);
    setSelectedTier(0);
  };

  const getColonyStatus = (colony) => {
    const timeSinceUpdate = Date.now() - colony.lastUpdate;
    const cyclesElapsed = Math.floor(timeSinceUpdate / (60 * 1000));

    if (cyclesElapsed > 0) {
      const newPop = Math.floor(colony.population * (1 + colony.growthRate * cyclesElapsed / 100));
      const newInfra = Math.min(100, colony.infrastructure + cyclesElapsed);
      const newHappiness = Math.max(0, Math.min(100, colony.happiness + (cyclesElapsed > 10 ? -1 : 1)));
      const newStage = getStageForPopulation(newPop);

      if (newPop !== colony.population) {
        updateColony(colony.id, {
          population: newPop,
          infrastructure: newInfra,
          happiness: newHappiness,
          stage: newStage,
          lastUpdate: Date.now(),
        });
      }

      return { ...colony, population: newPop, infrastructure: newInfra, happiness: newHappiness, stage: newStage };
    }

    return colony;
  };

  const handleCollectIncome = (colony) => {
    const income = getUncollectedIncome(colony);
    if (income <= 0) return;
    addCredits(income);
    updateColony(colony.id, { lastIncomeCollection: Date.now() });
  };

  const handleDeliver = (colony, cargoItem) => {
    const comm = COMMODITY_MAP[cargoItem.commodity];
    if (!comm) return;
    const effect = DELIVERY_EFFECTS[comm.category];
    if (!effect) return;

    const effectiveQty = Math.min(cargoItem.qty, 10);
    const happinessBoost = effect.happiness * effectiveQty;
    const infraBoost = effect.infrastructure * effectiveQty;
    const growthBoost = effect.growth * effectiveQty;

    removeCargo(cargoItem.commodity, cargoItem.qty);
    updateColony(colony.id, {
      happiness: Math.min(100, (colony.happiness || 0) + happinessBoost),
      infrastructure: Math.min(100, (colony.infrastructure || 0) + infraBoost),
      growthRate: Math.min(1, (colony.growthRate || 0) + growthBoost),
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-orange-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-orange-500" />
            <h2 className="text-orange-300 font-bold uppercase">Colonization Authority</h2>
          </div>
          <button
            onClick={() => setShowEstablish(!showEstablish)}
            className="flex items-center gap-1 px-3 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            ESTABLISH COLONY
          </button>
        </div>
        <div className="text-orange-700 text-xs mt-2">
          Found settlements on habitable worlds. Colonies generate passive credit income — deliver cargo to boost infrastructure and unlock special features at higher tiers.
        </div>
      </div>

      {/* Establish colony panel */}
      {showEstablish && (
        <div className="border border-orange-900 p-4 space-y-3">
          <h3 className="text-orange-400 text-sm font-bold uppercase">Establish New Colony</h3>

          {/* Target type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setTargetType('body'); setSelectedPort(null); }}
              className={`flex-1 py-1.5 border text-xs font-bold ${targetType === 'body' ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-900 text-orange-700'}`}
            >
              PLANETARY BODY
            </button>
            <button
              onClick={() => { setTargetType('port'); setSelectedBody(null); }}
              className={`flex-1 py-1.5 border text-xs font-bold ${targetType === 'port' ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-900 text-orange-700'}`}
            >
              STATION PORT
            </button>
          </div>

          {/* Select body or port */}
          {targetType === 'body' ? (
            <div>
              <div className="text-orange-700 text-[10px] uppercase mb-1">Select Habitable Body in {state.currentSystem.name}</div>
              {colonizableBodies.length === 0 ? (
                <div className="text-orange-700 text-xs">No suitable bodies for colonization in this system.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colonizableBodies.map(body => (
                    <button
                      key={body.id}
                      onClick={() => setSelectedBody(body)}
                      className={`border p-2 text-xs text-left ${
                        selectedBody?.id === body.id
                          ? 'border-orange-500 bg-orange-950/30'
                          : 'border-orange-900 hover:border-orange-700'
                      }`}
                    >
                      <div className="text-orange-400">{body.designation}</div>
                      <div className="text-orange-700 text-[10px]">{body.planetTypeName}</div>
                      {body.habitable && <div className="text-green-600 text-[9px]">HABITABLE</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-orange-700 text-[10px] uppercase mb-1">Select Station Port in {state.currentSystem.name}</div>
              {colonizablePorts.length === 0 ? (
                <div className="text-orange-700 text-xs">No available ports for colonization in this system.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colonizablePorts.map(port => (
                    <button
                      key={port.id}
                      onClick={() => setSelectedPort(port)}
                      className={`border p-2 text-xs text-left ${
                        selectedPort?.id === port.id
                          ? 'border-orange-500 bg-orange-950/30'
                          : 'border-orange-900 hover:border-orange-700'
                      }`}
                    >
                      <div className="text-orange-400">{port.name}</div>
                      <div className="text-orange-700 text-[10px] uppercase">{port.type} · {port.isOrbital ? 'Orbital' : 'Surface'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Select colony type */}
          {(selectedBody || selectedPort) && (
            <div>
              <div className="text-orange-700 text-[10px] uppercase mb-1">Specialization</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(COLONY_TYPES).map(([key, type]) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`border p-2 text-xs flex items-center gap-2 ${
                        selectedType === key
                          ? 'border-orange-500 bg-orange-950/30'
                          : 'border-orange-900 hover:border-orange-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-orange-500" />
                      <div>
                        <div className="text-orange-400">{type.name}</div>
                        <div className="text-orange-700 text-[9px]">×{type.incomeMult} income</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Select colony tier */}
          {(selectedBody || selectedPort) && (
            <div>
              <div className="text-orange-700 text-[10px] uppercase mb-1">Station Tier — determines size, effort, and rewards</div>
              <div className="space-y-1">
                {COLONY_TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full border p-2 text-xs text-left ${
                      selectedTier === tier.id
                        ? 'border-orange-500 bg-orange-950/30'
                        : 'border-orange-900 hover:border-orange-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 font-bold">{tier.name}</span>
                      <span className="text-orange-600 text-[10px]">{tier.establishCost.toLocaleString()} CR</span>
                    </div>
                    <div className="text-orange-700 text-[10px]">{tier.desc}</div>
                    <div className="flex flex-wrap gap-2 mt-0.5 text-[9px]">
                      <span className="text-cyan-600">INCOME: {tier.baseIncome.toLocaleString()}/hr</span>
                      <span className="text-orange-700">INFRA TARGET: {tier.infraTarget}%</span>
                      {tier.features.length > 0 && (
                        <span className="text-green-600">FEATURES: {tier.features.map(f => FEATURE_INFO[f]?.name || f).join(', ')}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(selectedBody || selectedPort) && (
            <button
              onClick={handleEstablish}
              disabled={state.credits < establishmentCost}
              className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-sm font-bold disabled:opacity-30"
            >
              ESTABLISH {COLONY_TIERS[selectedTier].name.toUpperCase()} — {establishmentCost.toLocaleString()} CR
            </button>
          )}
        </div>
      )}

      {/* Delivery panel */}
      {deliverColony && (
        <div className="border border-cyan-800 p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-900 pb-1">
            <h3 className="text-cyan-400 text-sm font-bold uppercase flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Deliver to {deliverColony.bodyName}
            </h3>
            <button onClick={() => setDeliverColony(null)} className="text-orange-700 hover:text-orange-400 text-xs">✕</button>
          </div>
          <div className="text-orange-700 text-[10px]">Deliver cargo to boost infrastructure and happiness. Higher infrastructure = more income. Max 10T per delivery.</div>
          {(state.ship?.cargo || []).length === 0 ? (
            <div className="text-orange-700 text-xs text-center py-2">No cargo in hold. Purchase goods at a station market.</div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(state.ship?.cargo || []).map(item => {
                const comm = COMMODITY_MAP[item.commodity];
                const effect = comm ? DELIVERY_EFFECTS[comm.category] : null;
                return (
                  <div key={item.commodity} className="flex items-center justify-between border border-orange-900 p-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="text-orange-400">{comm?.name || item.commodity}</div>
                      <div className="text-orange-700 text-[10px]">{comm?.category} · {item.qty}T</div>
                      {effect && <div className="text-green-600 text-[9px]">{effect.label}</div>}
                    </div>
                    <button
                      onClick={() => handleDeliver(deliverColony, item)}
                      className="px-2 py-1 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/50 text-[10px] flex-shrink-0 ml-2"
                    >
                      DELIVER {item.qty}T
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Existing colonies */}
      <div>
        <h3 className="text-orange-500 text-sm font-bold uppercase mb-2">Active Colonies ({state.colonies.length})</h3>
        {state.colonies.length === 0 ? (
          <div className="border border-orange-900 p-4 text-center text-orange-700 text-xs">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No colonies established. Start colonizing to generate passive credit income.
          </div>
        ) : (
          <div className="space-y-3">
            {state.colonies.map(colony => {
              const status = getColonyStatus(colony);
              const stage = COLONY_STAGES[status.stage];
              const nextStage = COLONY_STAGES[status.stage + 1];
              const Icon = COLONY_TYPES[status.type]?.icon || Globe;
              const tier = COLONY_TIERS[status.tier ?? 0];
              const incomePerHour = getColonyIncomePerHour(status);
              const uncollected = getUncollectedIncome(status);
              const isOperational = (status.infrastructure || 0) >= tier.infraTarget;

              return (
                <div key={colony.id} className="border border-orange-900 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-orange-300 font-bold text-sm">{status.bodyName}</div>
                        <div className="text-orange-700 text-[10px]">{tier.name} · {status.typeName} · {status.systemName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 text-xs">{stage.name}</div>
                      <div className="text-orange-700 text-[10px]">Stage {status.stage}</div>
                    </div>
                  </div>

                  {/* Income display */}
                  <div className="border border-cyan-900 bg-cyan-950/10 p-2 mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-cyan-400 text-[10px] uppercase flex items-center gap-1">
                        <Coins className="w-3 h-3" /> Income Rate
                      </div>
                      <div className="text-cyan-300 text-sm font-bold">{incomePerHour.toLocaleString()} CR/hr</div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-700 text-[10px] uppercase">Uncollected</div>
                      <div className="text-green-400 text-sm font-bold">{uncollected.toLocaleString()} CR</div>
                      <button
                        onClick={() => handleCollectIncome(colony)}
                        disabled={uncollected <= 0}
                        className="mt-1 px-2 py-0.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] disabled:opacity-30"
                      >
                        COLLECT
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <div className="text-orange-700 text-[10px] uppercase flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> Population
                      </div>
                      <div className="text-orange-300">{status.population.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-orange-700 text-[10px] uppercase flex items-center gap-1">
                        <Building className="w-2.5 h-2.5" /> Infrastructure
                      </div>
                      <div className="text-orange-300">{status.infrastructure}% / {tier.infraTarget}%</div>
                    </div>
                    <div>
                      <div className="text-orange-700 text-[10px] uppercase">Happiness</div>
                      <div className={status.happiness > 50 ? 'text-green-500' : 'text-red-500'}>{status.happiness}%</div>
                    </div>
                  </div>

                  {/* Infrastructure progress to operational */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className={isOperational ? 'text-green-500' : 'text-orange-700'}>{isOperational ? '✓ OPERATIONAL' : 'INFRASTRUCTURE TO OPERATIONAL'}</span>
                      <span className="text-orange-700">{status.infrastructure}% / {tier.infraTarget}%</span>
                    </div>
                    <div className="w-full h-1 bg-black border border-orange-900">
                      <div
                        className={`h-full ${isOperational ? 'bg-green-600' : 'bg-orange-600'}`}
                        style={{ width: `${Math.min(100, (status.infrastructure / tier.infraTarget) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Feature badges */}
                  {tier.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tier.features.map(feat => {
                        const info = FEATURE_INFO[feat];
                        const FeatureIcon = info?.icon || Building;
                        return (
                          <span
                            key={feat}
                            className={`flex items-center gap-1 px-1.5 py-0.5 border text-[9px] ${
                              isOperational
                                ? 'border-green-700 text-green-400 bg-green-950/20'
                                : 'border-gray-800 text-gray-600'
                            }`}
                            title={isOperational ? (info?.bonus || 'Active') : 'Locked — reach infrastructure target'}
                          >
                            <FeatureIcon className="w-2.5 h-2.5" />
                            {info?.name || feat}
                            {info?.bonus && isOperational && <span className="text-green-600">({info.bonus})</span>}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Growth progress to next stage */}
                  {nextStage && (
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-orange-700 mb-0.5">
                        <span>GROWTH TO {nextStage.name.toUpperCase()}</span>
                        <span>{status.population.toLocaleString()} / {nextStage.popRequired.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1 bg-black border border-orange-900">
                        <div
                          className="h-full bg-orange-600"
                          style={{ width: `${Math.min(100, (status.population / nextStage.popRequired) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeliverColony(colony)}
                      className="px-2 py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-[10px] flex items-center gap-1"
                    >
                      <Package className="w-3 h-3" /> DELIVER CARGO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getStageForPopulation(pop) {
  for (let i = COLONY_STAGES.length - 1; i >= 0; i--) {
    if (pop >= COLONY_STAGES[i].popRequired) return i;
  }
  return 0;
}