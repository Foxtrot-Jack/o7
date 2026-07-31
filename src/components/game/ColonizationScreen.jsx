// Colonization Screen — establish and manage colonies
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { makeRng, randInt, pick } from '@/lib/prng';
import { Rocket, Plus, Building, Users, Factory, Wheat, Beaker, Globe, TrendingUp } from 'lucide-react';

const COLONY_STAGES = [
  { id: 0, name: 'Outpost', popRequired: 0, desc: 'Initial settlement with basic infrastructure.' },
  { id: 1, name: 'Settlement', popRequired: 1000, desc: 'Growing community with expanded facilities.' },
  { id: 2, name: 'Colony', popRequired: 10000, desc: 'Self-sustaining colony with industry.' },
  { id: 3, name: 'City', popRequired: 100000, desc: 'Major population center.' },
  { id: 4, name: 'Metropolis', popRequired: 1000000, desc: 'Thriving metropolitan world.' },
];

const COLONY_TYPES = {
  agricultural: { name: 'Agricultural Colony', icon: Wheat, produces: ['basic_food', 'grain', 'fruit_veg', 'coffee'] },
  industrial: { name: 'Industrial Colony', icon: Factory, produces: ['ceramic_composites', 'polymers', 'power_generators'] },
  research: { name: 'Research Outpost', icon: Beaker, produces: ['progenitor_cells', 'superconductors', 'advanced_catalysers'] },
  mining: { name: 'Mining Colony', icon: TrendingUp, produces: ['iron', 'silicon', 'titanium', 'platinum'] },
  mixed: { name: 'Mixed Colony', icon: Globe, produces: ['basic_food', 'polymers', 'computer_components'] },
};

export default function ColonizationScreen() {
  const { state, getSystemData, addColony, updateColony, addCredits, addCargo } = useGameState();
  const systemData = getSystemData();
  const [showEstablish, setShowEstablish] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedType, setSelectedType] = useState('agricultural');
  const [targetType, setTargetType] = useState('body');
  const [selectedPort, setSelectedPort] = useState(null);

  // Get colonizable bodies (landable planets, not already colonized)
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

  const ESTABLISHMENT_COST = 5000000;

  const handleEstablish = () => {
    const target = targetType === 'body' ? selectedBody : selectedPort;
    if (!target) return;
    if (state.credits < ESTABLISHMENT_COST) {
      alert('INSUFFICIENT CREDITS FOR COLONIZATION');
      return;
    }

    const colonyType = COLONY_TYPES[selectedType];
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
      stage: 0,
      population: 50,
      growthRate: (1 + Math.floor(Math.random() * 5)) / 10,
      happiness: 80,
      infrastructure: 10,
      lastUpdate: Date.now(),
      produces: colonyType.produces,
      establishedAt: Date.now(),
    };

    addCredits(-ESTABLISHMENT_COST);
    addColony(colony);
    setShowEstablish(false);
    setSelectedBody(null);
    setSelectedPort(null);
  };

  // Simulate colony growth (called when viewing)
  const getColonyStatus = (colony) => {
    const timeSinceUpdate = Date.now() - colony.lastUpdate;
    const cyclesElapsed = Math.floor(timeSinceUpdate / (60 * 1000)); // 1 min per cycle

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

  const handleCollectResources = (colony) => {
    // Give player resources from the colony
    const rng = makeRng(colony.id + ':collect:' + Math.floor(Date.now() / 60000));
    const resource = pick(rng, colony.produces);
    const qty = randInt(rng, 1, 10);
    addCargo(resource, qty);
    alert(`Collected ${qty}T of ${resource} from ${colony.bodyName}`);
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
          Found new settlements on habitable worlds. Colonies grow over time and produce resources.
          Establishment cost: <span className="text-orange-400">{ESTABLISHMENT_COST.toLocaleString()} CR</span>
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
              <div className="text-orange-700 text-[10px] uppercase mb-1">Colony Type</div>
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
                      <span className="text-orange-400">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedBody || selectedPort) && (
            <button
              onClick={handleEstablish}
              disabled={state.credits < ESTABLISHMENT_COST}
              className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-sm font-bold disabled:opacity-30"
            >
              ESTABLISH {COLONY_TYPES[selectedType].name.toUpperCase()} — {ESTABLISHMENT_COST.toLocaleString()} CR
            </button>
          )}
        </div>
      )}

      {/* Existing colonies */}
      <div>
        <h3 className="text-orange-500 text-sm font-bold uppercase mb-2">Active Colonies ({state.colonies.length})</h3>
        {state.colonies.length === 0 ? (
          <div className="border border-orange-900 p-4 text-center text-orange-700 text-xs">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No colonies established. Start colonizing to generate passive resources.
          </div>
        ) : (
          <div className="space-y-3">
            {state.colonies.map(colony => {
              const status = getColonyStatus(colony);
              const stage = COLONY_STAGES[status.stage];
              const nextStage = COLONY_STAGES[status.stage + 1];
              const Icon = COLONY_TYPES[status.type].icon;

              return (
                <div key={colony.id} className="border border-orange-900 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-orange-300 font-bold text-sm">{status.bodyName} — {status.typeName}</div>
                        <div className="text-orange-700 text-[10px]">{status.systemName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 text-xs">{stage.name}</div>
                      <div className="text-orange-700 text-[10px]">Stage {status.stage}</div>
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
                      <div className="text-orange-300">{status.infrastructure}%</div>
                    </div>
                    <div>
                      <div className="text-orange-700 text-[10px] uppercase">Happiness</div>
                      <div className={status.happiness > 50 ? 'text-green-500' : 'text-red-500'}>{status.happiness}%</div>
                    </div>
                  </div>

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

                  {/* Resources */}
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-orange-700">
                      PRODUCES: {status.produces.slice(0, 3).join(', ')}
                    </div>
                    <button
                      onClick={() => handleCollectResources(colony)}
                      className="px-2 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px]"
                    >
                      COLLECT RESOURCES
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