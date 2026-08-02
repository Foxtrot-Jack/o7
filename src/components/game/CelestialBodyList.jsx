// CelestialBodyList — hierarchical tree of all system bodies
import React, { useState } from 'react';
import { BODY_TYPES } from '@/lib/system';

const TYPE_SYMBOLS = {
  star: '★',
  planet: '●',
  moon: '◦',
  belt: '≡',
  asteroid: '⋅',
  ring: '○',
};

export default function CelestialBodyList({
  systemData,
  selectedBody,
  selectedStation,
  onSelectBody,
  onSelectStation,
  fssDiscoveredBodies,
  scannedBodies,
  probeProgress,
  playerStructures = [],
  onSelectPlayerStructure,
}) {
  const tree = buildBodyTree(systemData.bodies);

  return (
    <div className="space-y-0">
      {tree.map(node => (
        <BodyNode
          key={node.body.id}
          node={node}
          depth={0}
          stations={systemData.stations}
          selectedBody={selectedBody}
          selectedStation={selectedStation}
          onSelectBody={onSelectBody}
          onSelectStation={onSelectStation}
          fssDiscoveredBodies={fssDiscoveredBodies}
          scannedBodies={scannedBodies}
          probeProgress={probeProgress}
          playerStructures={playerStructures}
          onSelectPlayerStructure={onSelectPlayerStructure}
        />
      ))}
      {/* Player-owned structures in this system (colonies, stations) */}
      {playerStructures.length > 0 && (
        <div className="mt-1 pt-1 border-t border-purple-900/50">
          <div className="text-purple-600 uppercase text-[9px] mb-0.5">Your Assets</div>
          {playerStructures.map(structure => (
            <button
              key={structure.id}
              onClick={() => onSelectPlayerStructure?.(structure)}
              className={`w-full text-left flex items-center gap-1 px-1 py-0.5 text-[10px] border transition-all ${
                selectedStation?.id === structure.id
                  ? 'border-purple-500 bg-purple-950/30 text-purple-300'
                  : 'border-transparent text-purple-500 hover:text-purple-300'
              }`}
            >
              <span className="text-purple-700">{structure.kind === 'colony' ? '⌂' : '⊕'}</span>
              <span className="truncate flex-1">{structure.name}</span>
              <span className="text-purple-900 text-[8px]">{structure.kind === 'colony' ? 'col' : 'stn'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Build tree of ALL bodies — no FSS filter, show everything
function buildBodyTree(bodies) {
  // Find the primary star — first star with parent === null
  const primaryStar = bodies.find(b => b.type === BODY_TYPES.STAR && b.parent === null) ||
                      bodies.find(b => b.type === BODY_TYPES.STAR);
  if (!primaryStar) return [];

  // Build child lookup for all bodies
  const byParent = {};
  for (const body of bodies) {
    if (body.id === primaryStar.id) continue;
    const p = body.parent || '__root__';
    if (!byParent[p]) byParent[p] = [];
    byParent[p].push(body);
  }
  for (const key in byParent) {
    byParent[key].sort((a, b) => (a.orbitRadius || 0) - (b.orbitRadius || 0));
  }
  return [buildNode(primaryStar, byParent)];
}

function buildNode(body, byParent) {
  const children = (byParent[body.id] || []).map(child => buildNode(child, byParent));
  return { body, children };
}

function BodyNode({ node, depth, stations, selectedBody, selectedStation, onSelectBody, onSelectStation, fssDiscoveredBodies, scannedBodies, probeProgress, playerStructures, onSelectPlayerStructure }) {
  const { body, children } = node;
  // Belts default to collapsed (they contain many asteroids)
  const [collapsed, setCollapsed] = useState(body.type === BODY_TYPES.BELT);

  const discovered = fssDiscoveredBodies?.[body.id];
  const isScanned = scannedBodies?.[body.id];
  const probeState = probeProgress?.[body.id];
  const isMapped = probeState?.complete;

  const bodyStations = stations.filter(s => s.parentId === body.id);
  const hasChildren = children.length > 0 || bodyStations.length > 0;
  const isStar = body.type === BODY_TYPES.STAR;
  const isBelt = body.type === BODY_TYPES.BELT;
  const isRing = body.type === BODY_TYPES.RING;
  const symbol = TYPE_SYMBOLS[body.type] || '●';
  const indent = depth * 10;

  const statusIcon = isStar ? '' : isMapped ? ' ✓' : isScanned ? ' ◉' : '';

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: indent }}>
        {hasChildren ? (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-orange-700 hover:text-orange-400 text-[8px] w-3 flex-shrink-0"
          >
            {collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <span className="w-3 flex-shrink-0 text-orange-900 text-[8px]">·</span>
        )}
        <button
          onClick={() => onSelectBody(body)}
          className={`flex-1 flex items-center gap-1 px-1 py-0.5 text-left border transition-all ${
            selectedBody?.id === body.id
              ? 'border-orange-500 bg-orange-950/40 text-orange-300'
              : isStar
                ? 'border-transparent text-yellow-500 hover:border-orange-800'
                : isRing
                  ? 'border-transparent text-amber-600 hover:border-orange-800'
                  : 'border-transparent text-orange-400 hover:border-orange-800'
          }`}
        >
          <span className="flex-shrink-0" style={{ color: isStar ? '#ffcc44' : body.color || '#888' }}>{symbol}</span>
          <span className="truncate flex-1">{body.designation || body.name}</span>
          {statusIcon && <span className="text-cyan-500 text-[8px]">{statusIcon}</span>}
        </button>
      </div>

      {!collapsed && hasChildren && (
        <div>
          {/* Stations orbiting this body */}
          {bodyStations.map(station => (
            <button
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`w-full text-left flex items-center gap-1 py-0.5 text-[10px] border transition-all ${
                selectedStation?.id === station.id
                  ? 'border-green-600 bg-green-950/30 text-green-300'
                  : 'border-transparent text-green-600 hover:text-green-400'
              }`}
              style={{ paddingLeft: indent + 16 }}
            >
              <span className="text-green-800">◦</span>
              <span className="truncate">{station.name}</span>
              <span className="text-green-900 text-[8px]">{station.isOrbital ? 'orb' : 'srf'}</span>
            </button>
          ))}
          {/* Player structures attached to this body */}
          {(playerStructures || []).filter(s => s.parentBodyId === body.id).map(structure => (
            <button
              key={structure.id}
              onClick={() => onSelectPlayerStructure?.(structure)}
              className={`w-full text-left flex items-center gap-1 py-0.5 text-[10px] border transition-all ${
                selectedStation?.id === structure.id
                  ? 'border-purple-500 bg-purple-950/30 text-purple-300'
                  : 'border-transparent text-purple-500 hover:text-purple-300'
              }`}
              style={{ paddingLeft: indent + 16 }}
            >
              <span className="text-purple-700">{structure.kind === 'colony' ? '⌂' : '⊕'}</span>
              <span className="truncate">{structure.name}</span>
              <span className="text-purple-900 text-[8px]">{structure.kind === 'colony' ? 'col' : 'stn'}</span>
            </button>
          ))}
          {/* Child bodies */}
          {children.map(child => (
            <BodyNode
              key={child.body.id}
              node={child}
              depth={depth + 1}
              stations={stations}
              selectedBody={selectedBody}
              selectedStation={selectedStation}
              onSelectBody={onSelectBody}
              onSelectStation={onSelectStation}
              fssDiscoveredBodies={fssDiscoveredBodies}
              scannedBodies={scannedBodies}
              probeProgress={probeProgress}
              playerStructures={playerStructures}
              onSelectPlayerStructure={onSelectPlayerStructure}
            />
          ))}
        </div>
      )}
    </div>
  );
}