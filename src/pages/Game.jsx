// Main Game Page — orchestrates all screens with persistent navigation
import React, { useState, useEffect, useRef } from 'react';
import { GameStateProvider, useGameState } from '@/lib/gameState';
import CRTFrame from '@/components/game/CRTFrame';
import SaveSelect from '@/components/game/SaveSelect';
import NavBar from '@/components/game/NavBar';
import StatusHeader from '@/components/game/StatusHeader';
import GalaxyMap from '@/components/game/GalaxyMap';
import SystemOrrery from '@/components/game/SystemOrrery';
import StationScreen from '@/components/game/StationScreen';
import MarketScreen from '@/components/game/MarketScreen';
import ShipPanel from '@/components/game/ShipPanel';
import MissionsScreen from '@/components/game/MissionsScreen';
import MiningScreen from '@/components/game/MiningScreen';
import ExplorationScreen from '@/components/game/ExplorationScreen';
import ColonizationScreen from '@/components/game/ColonizationScreen';
import FleetScreen from '@/components/game/FleetScreen';
import CarrierScreen from '@/components/game/CarrierScreen';
import AchievementsScreen from '@/components/game/AchievementsScreen';
import SettingsScreen from '@/components/game/SettingsScreen';
import OutfittingScreen from '@/components/game/OutfittingScreen';
import SurfaceSurvey from '@/components/game/SurfaceSurvey';
import TradeTools from '@/components/game/TradeTools';
import CommanderProfile from '@/components/game/CommanderProfile';
import ShipCreator from '@/components/game/ShipCreator';
import Codex from '@/components/game/Codex';
import CompanyScreen from '@/components/game/CompanyScreen';
import CheatsScreen from '@/components/game/CheatsScreen';
import LeaderboardScreen from '@/components/game/LeaderboardScreen';
import BadgeMaker from '@/components/game/BadgeMaker';
import CarrierCreator from '@/components/game/CarrierCreator';
import CarrierInterior from '@/components/game/CarrierInterior';
import CrewScreen from '@/components/game/CrewScreen';
import PowerPlayScreen from '@/components/game/PowerPlayScreen';
import MaterialTraderScreen from '@/components/game/MaterialTraderScreen';
import CommunityGoalsScreen from '@/components/game/CommunityGoalsScreen';
import SynthesisScreen from '@/components/game/SynthesisScreen';
import GalnetScreen from '@/components/game/GalnetScreen';
import PublicHolidaysScreen from '@/components/game/PublicHolidaysScreen';
import BlackMarketScreen from '@/components/game/BlackMarketScreen';
import EngineeringScreen from '@/components/game/EngineeringScreen';
import SRVRover from '@/components/game/SRVRover';
import EncounterScreen from '@/components/game/EncounterScreen';
import BountyBoard from '@/components/game/BountyBoard';
import CrimeScreen from '@/components/game/CrimeScreen';
import ConflictZoneScreen from '@/components/game/ConflictZoneScreen';
import RESScreen from '@/components/game/RESScreen';
import WingmateScreen from '@/components/game/WingmateScreen';
import PassengerScreen from '@/components/game/PassengerScreen';
import MultiCrewScreen from '@/components/game/MultiCrewScreen';
import StationBuilderScreen from '@/components/game/StationBuilderScreen';
import CartographyScreen from '@/components/game/CartographyScreen';
import FighterScreen from '@/components/game/FighterScreen';
import BGSScreen from '@/components/game/BGSScreen';
import ExobiologyScreen from '@/components/game/ExobiologyScreen';
import CarrierLogisticsScreen from '@/components/game/CarrierLogisticsScreen';
import MaintenanceScreen from '@/components/game/MaintenanceScreen';
import PiracyScreen from '@/components/game/PiracyScreen';
import DiscoveryDatabase from '@/components/game/DiscoveryDatabase';
import FSSScannerScreen from '@/components/game/FSSScannerScreen';
import MissionChainScreen from '@/components/game/MissionChainScreen';
import PlayerRepScreen from '@/components/game/PlayerRepScreen';
import LoadoutPresetScreen from '@/components/game/LoadoutPresetScreen';
import MarketAnalysisScreen from '@/components/game/MarketAnalysisScreen';
import CarrierCommandScreen from '@/components/game/CarrierCommandScreen';
import TimeEventScreen from '@/components/game/TimeEventScreen';
import PlayerTitlesScreen from '@/components/game/PlayerTitlesScreen';
import WarpGateScreen from '@/components/game/WarpGateScreen';
import CabinScreen from '@/components/game/CabinScreen';
import RoomManagerScreen from '@/components/game/RoomManagerScreen';
import AquariumScreen from '@/components/game/AquariumScreen';
import GardenScreen from '@/components/game/GardenScreen';
import GeneticsLabScreen from '@/components/game/GeneticsLabScreen';
import StationCreator from '@/components/game/StationCreator';
import GameErrorBoundary from '@/components/game/GameErrorBoundary';
import ControllerConfigScreen from '@/components/game/ControllerConfigScreen';
import CanisStellaScreen from '@/components/game/CanisStellaScreen';
import RebuyScreen from '@/components/game/RebuyScreen';
import SelfDestructScreen from '@/components/game/SelfDestructScreen';
import { inputSystem } from '@/lib/inputSystem';
import { soundEngine } from '@/lib/soundEngine';
import { SCREEN_CONTEXTS } from '@/lib/soundPresets';

function GameContent() {
  const { state, manualSave } = useGameState();
  const [screen, setScreen] = useState('system');
  const [showSelfDestruct, setShowSelfDestruct] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Refs for input system — avoids stale closures in the useEffect[] subscription
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const locationRef = useRef(state.currentLocation);
  locationRef.current = state.currentLocation;
  const carriersRef = useRef(state.fleetCarriers || []);
  carriersRef.current = state.fleetCarriers || [];
  const cheatsRef = useRef(state.cheats);
  cheatsRef.current = state.cheats;
  const screenHistoryRef = useRef([]);

  // Sync sound settings to the audio engine
  useEffect(() => {
    soundEngine.setSettings(state.settings?.sound || {});
  }, [state.settings?.sound]);

  // Switch background music when the active screen changes
  useEffect(() => {
    const ctx = SCREEN_CONTEXTS[screen] || 'menu';
    soundEngine.startMusic(ctx);
  }, [screen]);

  // Initialize audio context on first user interaction (browser autoplay policy)
  useEffect(() => {
    const initAudio = () => {
      soundEngine.init();
      soundEngine.resume();
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Play alert sound when a random encounter triggers
  useEffect(() => {
    if (state.activeEncounter) {
      soundEngine.play('alert');
    }
  }, [state.activeEncounter]);

  // Physical input system — keyboard + gamepad navigation and screen hotkeys
  useEffect(() => {
    const STATION_ONLY = ['station', 'market', 'outfitting', 'materialtrader', 'synthesis', 'crew', 'blackmarket', 'engineering', 'bountyboard', 'passengers', 'multicrew', 'cartography', 'maintenance'];
    const CARRIER_REQUIRED = ['carriercreator'];

    const focusElement = (direction) => {
      const content = document.querySelector('[data-game-content]');
      if (!content) return;
      const focusable = content.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const elements = Array.from(focusable).filter(el => !el.disabled && el.offsetParent !== null);
      if (elements.length === 0) return;
      const active = document.activeElement;
      const currentIndex = elements.indexOf(active);
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + elements.length) % elements.length;
      elements[nextIndex].focus();
      elements[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    const clickFocused = () => {
      const active = document.activeElement;
      if (active && (active.tagName === 'BUTTON' || active.tagName === 'A' || active.tagName === 'INPUT')) {
        active.click();
      }
    };

    const navigateToScreen = (screenId) => {
      const loc = locationRef.current;
      if (STATION_ONLY.includes(screenId) && loc !== 'station') { soundEngine.play('error'); return; }
      if (CARRIER_REQUIRED.includes(screenId) && (carriersRef.current || []).length === 0) { soundEngine.play('error'); return; }
      if (screenId === 'cheats' && !cheatsRef.current?.unlocked) return;
      soundEngine.play('click');
      screenHistoryRef.current.push(screenRef.current);
      setScreen(screenId);
    };

    const unsubscribe = inputSystem.subscribe((action, eventType) => {
      if (eventType !== 'down') return;
      if (screenRef.current === 'controllerconfig') return; // don't process hotkeys while rebinding

      if (action === 'nav_up' || action === 'nav_left') {
        focusElement(-1);
      } else if (action === 'nav_down' || action === 'nav_right') {
        focusElement(1);
      } else if (action === 'nav_select') {
        clickFocused();
      } else if (action === 'nav_back') {
        const history = screenHistoryRef.current;
        if (history.length > 0) setScreen(history.pop());
        else setScreen('system');
      } else if (action.startsWith('screen_')) {
        navigateToScreen(action.replace('screen_', ''));
      }
    });

    return unsubscribe;
  }, []);

  const handleNavigate = (target) => {
    screenHistoryRef.current.push(screen);
    setScreen(target);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'galaxy':
        return <GalaxyMap onJumpToSystem={() => setScreen('system')} />;
      case 'system':
        return <SystemOrrery onNavigate={handleNavigate} />;
      case 'exploration':
        return <ExplorationScreen />;
      case 'station':
        return <StationScreen onNavigate={handleNavigate} />;
      case 'market':
        return <MarketScreen />;
      case 'ship':
        return <ShipPanel onNavigate={handleNavigate} />;
      case 'missions':
        return <MissionsScreen />;
      case 'mining':
        return <MiningScreen onNavigate={handleNavigate} />;
      case 'colonization':
        return <ColonizationScreen />;
      case 'fleet':
        return <FleetScreen />;
      case 'carriers':
        return <CarrierScreen onNavigate={handleNavigate} />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'badgemaker':
        return <BadgeMaker />;
      case 'carriercreator':
        return <CarrierCreator />;
      case 'carrierinterior':
        return <CarrierInterior onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsScreen />;
      case 'outfitting':
        return <OutfittingScreen />;
      case 'survey':
        return <SurfaceSurvey onNavigate={handleNavigate} />;
      case 'trade':
        return <TradeTools />;
      case 'profile':
        return <CommanderProfile />;
      case 'shipcreator':
        return <ShipCreator />;
      case 'codex':
        return <Codex />;
      case 'company':
        return <CompanyScreen />;
      case 'cheats':
        return <CheatsScreen />;
      case 'crew':
        return <CrewScreen />;
      case 'powerplay':
        return <PowerPlayScreen />;
      case 'materialtrader':
        return <MaterialTraderScreen />;
      case 'goals':
        return <CommunityGoalsScreen />;
      case 'synthesis':
        return <SynthesisScreen />;
      case 'galnet':
        return <GalnetScreen />;
      case 'holidays':
        return <PublicHolidaysScreen />;
      case 'blackmarket':
        return <BlackMarketScreen />;
      case 'engineering':
        return <EngineeringScreen />;
      case 'srv':
        return <SRVRover onNavigate={handleNavigate} />;
      case 'bountyboard':
        return <BountyBoard />;
      case 'crime':
        return <CrimeScreen />;
      case 'conflictzone':
        return <ConflictZoneScreen />;
      case 'res':
        return <RESScreen />;
      case 'wingmates':
        return <WingmateScreen />;
      case 'passengers':
        return <PassengerScreen />;
      case 'multicrew':
        return <MultiCrewScreen />;
      case 'stationbuilder':
        return <StationBuilderScreen />;
      case 'cartography':
        return <CartographyScreen />;
      case 'fighters':
        return <FighterScreen />;
      case 'bgs':
        return <BGSScreen />;
      case 'exobiology':
        return <ExobiologyScreen />;
      case 'carrierlogistics':
        return <CarrierLogisticsScreen />;
      case 'maintenance':
        return <MaintenanceScreen />;
      case 'piracy':
        return <PiracyScreen />;
      case 'discoveries':
        return <DiscoveryDatabase />;
      case 'fss':
        return <FSSScannerScreen />;
      case 'chains':
        return <MissionChainScreen />;
      case 'rep':
        return <PlayerRepScreen />;
      case 'presets':
        return <LoadoutPresetScreen />;
      case 'marketai':
        return <MarketAnalysisScreen />;
      case 'carriercommand':
        return <CarrierCommandScreen />;
      case 'events':
        return <TimeEventScreen />;
      case 'titles':
        return <PlayerTitlesScreen />;
      case 'warpgates':
        return <WarpGateScreen />;
      case 'cabin':
        return <CabinScreen onNavigate={handleNavigate} />;
      case 'roommanager':
        return <RoomManagerScreen onNavigate={handleNavigate} />;
      case 'aquarium':
        return <AquariumScreen />;
      case 'garden':
        return <GardenScreen />;
      case 'geneticslab':
        return <GeneticsLabScreen />;
      case 'stationcreator':
        return <StationCreator />;
      case 'controllerconfig':
        return <ControllerConfigScreen />;
      case 'canisstella':
        return <CanisStellaScreen />;
      default:
        return <SystemOrrery />;
    }
  };

  const isFullScreen = screen === 'galaxy' || screen === 'system';

  const displayGlobal = state.settings?.display?.global || {};
  const displayScreen = state.settings?.display?.screens?.[screen] || {};
  const display = { ...displayGlobal, ...displayScreen };

  return (
    <div className={`w-full h-screen bg-black flex flex-col overflow-hidden ${state.settings?.miniScreen ? 'mini-screen' : ''} ${state.settings?.orientationLocked ? (state.settings?.screenOrientation === 'portrait' ? 'force-portrait' : 'force-landscape') : ''}`} style={state.settings?.displayScale && state.settings.displayScale !== 100 ? { zoom: state.settings.displayScale / 100 } : undefined}>
      <CRTFrame enabled={state.settings.crtEffect} brightness={state.settings.textBrightness || 100} theme={state.cheats?.unlocked && state.cheats?.active?.golden_theme ? 'sol_gold' : (state.settings.colorTheme || 'elite')} customColor={state.settings.customColor} textRGB={state.settings.textRGB} fontFamily={state.settings.fontFamily} fontScale={state.settings.fontScale} display={display}>
        <div className="flex flex-col h-full">
          <StatusHeader />
          <NavBar
            currentScreen={screen}
            onNavigate={handleNavigate}
            location={state.currentLocation}
          />
          <div data-game-content className={`flex-1 relative z-0 ${isFullScreen ? 'overflow-hidden' : 'overflow-auto'}`}>
            {renderScreen()}
          </div>
          {state.activeEncounter && <EncounterScreen />}
          {/* Self-destruct overlay */}
          {showSelfDestruct && <SelfDestructScreen onCancel={() => setShowSelfDestruct(false)} />}
          {/* Rebuy screen overlay (ship destroyed) */}
          {state.rebuyPending && <RebuyScreen />}
          {/* Footer status bar */}
          <div className="border-t border-orange-900/50 px-3 py-1 flex items-center justify-between text-[10px] text-orange-800 bg-black">
            <span>o7 v1.0 · {state.ship?.name || '---'}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { const ok = manualSave(); if (ok) { setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1500); } }}
                className={`hover:text-orange-400 ${saveFlash ? 'text-green-500' : ''}`}
              >
                {saveFlash ? '✓ SAVED' : '💾 SAVE'}
              </button>
              <button
                onClick={() => setShowSelfDestruct(true)}
                className="text-red-700 hover:text-red-500"
              >
                ⚠ SELF-DESTRUCT
              </button>
            </div>
            <span>JUMPS: {state.totalJumps}</span>
          </div>
        </div>
      </CRTFrame>
    </div>
  );
}

export default function Game() {
  const [saveSlot, setSaveSlot] = useState(null);

  useEffect(() => {
    const active = localStorage.getItem('starfarer_active_save');
    if (active === 'normal' || active === 'sandbox') setSaveSlot(active);
  }, []);

  if (!saveSlot) {
    return <SaveSelect onSelect={(slot) => {
      localStorage.setItem('starfarer_active_save', slot);
      setSaveSlot(slot);
    }} />;
  }

  return (
    <GameErrorBoundary>
      <GameStateProvider key={saveSlot} saveSlot={saveSlot} onSwitchSave={() => {
        localStorage.removeItem('starfarer_active_save');
        setSaveSlot(null);
      }}>
        <GameContent />
      </GameStateProvider>
    </GameErrorBoundary>
  );
}