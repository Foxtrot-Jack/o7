// BezelButtons — 24 persistent function buttons arranged around 4 screen bezels.
// Replaces NavBar + DockedBar. Buttons auto-populate based on game context.
// Supports F1-F24 physical keys, sub-button expansion, long-press customization,
// and cyberdeck mode (bezel hidden, keys still active).
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { inputSystem } from '@/lib/inputSystem';
import { soundEngine } from '@/lib/soundEngine';
import { BEZEL_ACTIONS, resolveContext, getBezelLayout, fKeyToPosition } from '@/lib/bezelContexts';
import BezelCustomizer from './BezelCustomizer';

function isButtonDisabled(action, currentLocation, fleetCarriersCount, cheatsUnlocked) {
  if (!action) return true;
  if (action.stationOnly && currentLocation !== 'station') return true;
  if (action.carrierRequired && fleetCarriersCount === 0) return true;
  if (action.dev && !cheatsUnlocked) return true;
  return false;
}

function BezelButton({ action, side, index, active, disabled, tutorialHighlight, expanded, hasSubButtons, onClick, onToggleExpand, onLongPress }) {
  const Icon = action.icon;
  const longPressRef = useRef(null);

  const handlePressStart = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      longPressRef.current = null;
      soundEngine.play('select');
      onLongPress();
    }, 500);
  }, [onLongPress]);

  const handlePressEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const handleClick = () => {
    if (disabled) { soundEngine.play('error'); return; }
    if (hasSubButtons) {
      onToggleExpand();
    } else {
      soundEngine.play('click');
      onClick(action);
    }
  };

  return (
    <button
      data-bezel-btn={action.id}
      data-bezel-side={side}
      data-bezel-index={index}
      onClick={handleClick}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      disabled={disabled}
      className={`relative flex items-center justify-center gap-1 w-full h-full text-xs transition-colors border ${
        active ? 'bg-orange-950/40 text-orange-300 border-orange-500'
          : action.isMain ? 'text-orange-500 border-orange-900/50 hover:bg-orange-950/30 hover:text-orange-400'
          : 'text-gray-500 border-gray-900/50 hover:bg-gray-950/30 hover:text-gray-400'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${
        tutorialHighlight ? 'ring-2 ring-cyan-400 animate-pulse' : ''
      }`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="hidden sm:inline truncate max-w-[60px]">{action.label}</span>
      {hasSubButtons && <ChevronRight className={`w-2.5 h-2.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />}
      {disabled && <Lock className="w-2 h-2 absolute top-0 right-0 text-red-700" />}
    </button>
  );
}

export default function BezelButtons({ children, screen, currentLocation, bezelLayout, bezelVisible, fleetCarriersCount, cheatsUnlocked, onNavigate, onAction, tutorialTarget, monoUI }) {
  const context = resolveContext(screen, currentLocation);
  const layout = useMemo(() => getBezelLayout(context, bezelLayout), [context, bezelLayout]);
  const [expandedButton, setExpandedButton] = useState(null);
  const [customizeSlot, setCustomizeSlot] = useState(null);
  const containerRef = useRef(null);

  // Stable refs for callbacks (prevents re-subscribing to input on every render)
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const handleButtonClick = useCallback((action) => {
    if (action.screen) {
      onNavigateRef.current(action.screen);
    } else if (action.action) {
      onActionRef.current(action.action);
    }
  }, []);

  const handleToggleExpand = useCallback((side, index) => {
    soundEngine.play('select');
    setExpandedButton(prev => {
      if (prev && prev.side === side && prev.index === index) return null;
      return { side, index };
    });
  }, []);

  // Close expansion on outside click
  useEffect(() => {
    if (!expandedButton) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpandedButton(null);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [expandedButton]);

  // F1-F24 physical key handling — works even when bezel is hidden (cyberdeck mode)
  useEffect(() => {
    const unsubscribe = inputSystem.subscribe((actionId, eventType) => {
      if (eventType !== 'down') return;
      const match = actionId.match(/^bezel_f(\d+)$/);
      if (!match) return;
      const fKey = parseInt(match[1]);
      const pos = fKeyToPosition(fKey);
      if (!pos) return;
      const actionKey = layout[pos.side]?.[pos.index];
      if (!actionKey) return;
      const btnAction = BEZEL_ACTIONS[actionKey];
      if (!btnAction) return;
      if (isButtonDisabled(btnAction, currentLocation, fleetCarriersCount, cheatsUnlocked)) {
        soundEngine.play('error');
        return;
      }
      const hasSubs = btnAction.subButtons && Object.keys(btnAction.subButtons).length > 0;
      if (hasSubs) {
        handleToggleExpand(pos.side, pos.index);
      } else {
        soundEngine.play('click');
        handleButtonClick(btnAction);
      }
    });
    return unsubscribe;
  }, [layout, currentLocation, fleetCarriersCount, cheatsUnlocked, handleToggleExpand, handleButtonClick]);

  const renderSubButtons = (action, side, index) => {
    if (!action.subButtons) return null;
    const isExpanded = expandedButton && expandedButton.side === side && expandedButton.index === index;
    if (!isExpanded) return null;

    const subEntries = Object.entries(action.subButtons);
    const positionClass = {
      top: 'absolute top-full left-0 mt-0.5',
      right: 'absolute right-full top-0 mr-0.5',
      bottom: 'absolute bottom-full left-0 mb-0.5',
      left: 'absolute left-full top-0 ml-0.5',
    }[side];

    return (
      <div className={`absolute z-[200] ${positionClass} bg-black border border-gray-800 shadow-lg min-w-[120px]`}>
        {subEntries.map(([subId, subAction]) => {
          const SubIcon = subAction.icon;
          const subDisabled = isButtonDisabled(subAction, currentLocation, fleetCarriersCount, cheatsUnlocked);
          return (
            <button
              key={subId}
              data-bezel-btn={subId}
              onClick={() => {
                if (subDisabled) { soundEngine.play('error'); return; }
                soundEngine.play('click');
                if (subAction.screen) onNavigateRef.current(subAction.screen);
                else if (subAction.action) onActionRef.current(subAction.action);
                setExpandedButton(null);
              }}
              disabled={subDisabled}
              className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs whitespace-nowrap text-left border-b border-gray-900 last:border-b-0 ${
                subDisabled ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-950/50 hover:text-gray-300'
              }`}
            >
              <SubIcon className="w-3 h-3 flex-shrink-0" />
              <span>{subAction.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderSlot = (actionId, side, index) => {
    if (!actionId) return <div key={`empty-${side}-${index}`} className="flex-1 h-full" />;
    const action = BEZEL_ACTIONS[actionId];
    if (!action) return <div key={`empty-${side}-${index}`} className="flex-1 h-full" />;
    if (action.dev && !cheatsUnlocked) return <div key={`empty-${side}-${index}`} className="flex-1 h-full" />;

    const disabled = isButtonDisabled(action, currentLocation, fleetCarriersCount, cheatsUnlocked);
    const active = screen === action.screen;
    const isExpanded = expandedButton && expandedButton.side === side && expandedButton.index === index;
    const hasSubs = action.subButtons && Object.keys(action.subButtons).length > 0;
    const tutorialHighlight = tutorialTarget?.buttonId === actionId;

    return (
      <div key={`${side}-${index}`} className="relative flex-1 h-full">
        <BezelButton
          action={action}
          side={side}
          index={index}
          active={active}
          disabled={disabled}
          tutorialHighlight={tutorialHighlight}
          expanded={isExpanded}
          hasSubButtons={hasSubs}
          onClick={handleButtonClick}
          onToggleExpand={() => handleToggleExpand(side, index)}
          onLongPress={() => setCustomizeSlot({ side, index, context })}
        />
        {renderSubButtons(action, side, index)}
      </div>
    );
  };

  // Cyberdeck mode — bezel hidden, F1-F24 keys still active
  const visible = bezelVisible !== false;
  if (!visible) {
    return <div className="flex-1 min-h-0 relative flex">{children}</div>;
  }

  return (
    <>
      <div ref={containerRef} className={`flex flex-col flex-1 min-h-0 ${monoUI ? 'crt-mono-ui' : ''}`}>
        {/* Top bezel — F1-F6 */}
        <div className="flex h-9 sm:h-10 border-b border-orange-900/50 bg-black flex-shrink-0">
          {layout.top.map((id, i) => renderSlot(id, 'top', i))}
        </div>

        {/* Middle row */}
        <div className="flex flex-1 min-h-0">
          {/* Left bezel — F19-F24 */}
          <div className="flex flex-col w-9 sm:w-20 border-r border-orange-900/50 bg-black flex-shrink-0">
            {layout.left.map((id, i) => renderSlot(id, 'left', i))}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 relative flex">
            {children}
          </div>

          {/* Right bezel — F7-F12 */}
          <div className="flex flex-col w-9 sm:w-20 border-l border-orange-900/50 bg-black flex-shrink-0">
            {layout.right.map((id, i) => renderSlot(id, 'right', i))}
          </div>
        </div>

        {/* Bottom bezel — F13-F18 */}
        <div className="flex h-9 sm:h-10 border-t border-orange-900/50 bg-black flex-shrink-0">
          {layout.bottom.map((id, i) => renderSlot(id, 'bottom', i))}
        </div>
      </div>

      {customizeSlot && (
        <BezelCustomizer
          context={customizeSlot.context}
          side={customizeSlot.side}
          index={customizeSlot.index}
          onClose={() => setCustomizeSlot(null)}
        />
      )}
    </>
  );
}