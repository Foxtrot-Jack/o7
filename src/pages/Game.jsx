// Main Game Page — orchestrates all screens with persistent navigation
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameStateProvider, useGameState } from '@/lib/gameState';
import CRTFrame from '@/components/game/CRTFrame';
import SaveSelect from '@/components/game/SaveSelect';
import CharacterCreator from '@/components/game/CharacterCreator';
import StatusHeader from '@/components/game/StatusHeader';
import BezelButtons from '@/components/game/BezelButtons';
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
import DockCameraScreen from '@/components/game/DockCameraScreen';
import JourneyScreen from '@/components/game/JourneyScreen';
import WreckageScreen from '@/components/game/WreckageScreen';
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
import TutorialOverlay from '@/components/game/TutorialOverlay';
import DevStub from '@/components/game/DevStub';
import HomeDashboard from '@/components/game/HomeDashboard';
import RanksScreen from '@/components/game/RanksScreen';
import ModulesManager from '@/components/game/ModulesManager';
import FireGroups from '@/components/game/FireGroups';
import ShipFunctions from '@/components/game/ShipFunctions';
import FlightAssistant from '@/components/game/FlightAssistant';
import PilotPreferences from '@/components/game/PilotPreferences';
import ShipStatistics from '@/components/game/ShipStatistics';
import ContactsScreen from '@/components/game/ContactsScreen';
import CommsLog from '@/components/game/CommsLog';
import FeaturesInProgress from '@/components/game/FeaturesInProgress';
import PlannedFeatures from '@/components/game/PlannedFeatures';
import Livery from '@/components/game/Livery';
import AdvancedMaintenance from '@/components/game/AdvancedMaintenance';
import MissionBoard from '@/components/game/MissionBoard';
import StationContacts from '@/components/game/StationContacts';
import CargoScreen from '@/components/game/CargoScreen';
import MaterialsLocker from '@/components/game/MaterialsLocker';
import { TUTORIAL_CATEGORIES, TUTORIAL_CATEGORY_LIST } from '@/lib/tutorialSteps';
import { inputSystem } from '@/lib/inputSystem';
import { soundEngine } from '@/lib/soundEngine';
import { SCREEN_CONTEXTS } from '@/lib/soundPresets';
import { getScreenTextStyle } from '@/lib/uiTextCategories';
import { useCardSystem } from '@/lib/useCardSystem';
import { isMfrDeckComplete, DECK_REWARD_CREDITS, DECK_REWARD_BY_KEY, DECK_TITLE_BY_MFR, earnedAchievementIds, makeCardGrant } from '@/lib/cardDeck';

const STATION_ONLY_SCREENS = ['station', 'market', 'outfitting', 'materialtrader', 'crew', 'blackmarket', 'engineering', 'bountyboard', 'passengers', 'multicrew', 'cartography', 'maintenance', 'dockcam', 'missionboard', 'stationcontacts', 'livery', 'advmaintenance', 'colonization'];

function GameContent() {
  const { state, update, manualSave, leaveStation } = useGameState();
  const { grantStationCard } = useCardSystem();
  const [screen, setScreen] = useState('system');
  const [showSelfDestruct, setShowSelfDestruct] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [tutorialCategory, setTutorialCategory] = useState(null);
  const [tutorialTarget, setTutorialTarget] = useState(null);
  const prevStateRef = useRef(state);

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
    const STATION_ONLY = ['station', 'market', 'outfitting', 'materialtrader', 'crew', 'blackmarket', 'engineering', 'bountyboard', 'passengers', 'multicrew', 'cartography', 'maintenance', 'dockcam', 'missionboard', 'stationcontacts', 'livery', 'advmaintenance', 'colonization'];
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

  // Station screens are only reachable while docked — if the player undocks
  // or jumps away while viewing one, return to the system orrery.
  useEffect(() => {
    if (STATION_ONLY_SCREENS.includes(screen) && state.currentLocation !== 'station') {
      setScreen('system');
    }
  }, [screen, state.currentLocation]);

  // Card collection — grant one themed card the first time a station is visited.
  const [cardFlash, setCardFlash] = useState(null);
  useEffect(() => {
    if (state.currentLocation !== 'station' || !state.lastVisitedStation) return;
    const card = grantStationCard(state.lastVisitedStation);
    if (card) {
      soundEngine.play('select');
      setCardFlash(card);
      const t = setTimeout(() => setCardFlash(null), 4000);
      return () => clearTimeout(t);
    }
  }, [state.currentLocation, state.lastVisitedStation?.systemSeed, state.lastVisitedStation?.stationId]);

  // Card deck completion — grant title + credit reward when a full manufacturer deck is collected.
  useEffect(() => {
    const owned = state.cards?.owned || {};
    const rewarded = state.cards?.deckRewards || {};
    const completions = Object.keys(DECK_TITLE_BY_MFR).filter(k => !rewarded[k] && isMfrDeckComplete(owned, k));
    if (!completions.length) return;
    update(prev => {
      const cards = prev.cards || { owned: {}, drawnStations: {}, deckRewards: {} };
      const deckRewards = { ...(cards.deckRewards || {}) };
      let credits = prev.credits, lifetime = prev.lifetimeEarnings || 0;
      const milestones = { ...(prev.achievements?.milestones || {}) };
      let title = prev.playerTitle;
      for (const key of completions) {
        if (deckRewards[key]) continue;
        deckRewards[key] = true;
        const reward = DECK_REWARD_BY_KEY[key] || DECK_REWARD_CREDITS;
        credits += reward; lifetime += reward;
        milestones[`deck_${key}`] = { date: Date.now() };
        title = DECK_TITLE_BY_MFR[key];
      }
      return { credits, lifetimeEarnings: lifetime, playerTitle: title, achievements: { ...prev.achievements, milestones }, cards: { ...cards, deckRewards } };
    });
  }, [state.cards]);

  // Special Class cards — award one card per achievement as it is earned.
  // The earned-id list is memoized on the achievement-relevant slices so the
  // ~130-def scan only re-runs when those change, not on every state tick.
  const earnedIds = useMemo(() => earnedAchievementIds(state), [
    state.achievements?.milestones, state.achievements?.firstDiscoveries,
    state.totalJumps, state.totalKills, state.credits, state.lifetimeEarnings,
    state.shipsPurchased, state.lightYearsTraveled, state.discoveredSystems,
    state.scannedBodies, state.mappedBodies, state.fssScannedSystems,
    state.bookmarkedSystems, state.surfaceDiscoveries, state.customShips,
    state.colonies, state.fleetCarriers, state.ownedStations, state.warpGates,
    state.cards?.owned, state.company, state.cheats?.unlocked,
  ]);
  useEffect(() => {
    const awarded = state.cards?.specialAwarded || {};
    const fresh = earnedIds.filter(id => !awarded[id]);
    if (!fresh.length) return;
    update(prev => {
      const cards = prev.cards || { owned: {}, drawnStations: {}, deckRewards: {}, specialAwarded: {} };
      const aw = { ...(cards.specialAwarded || {}) };
      for (const id of fresh) aw[id] = true;
      const grant = makeCardGrant(prev, fresh.map(id => `special_${id}`));
      return { cards: { ...grant.cards, specialAwarded: aw } };
    });
  }, [earnedIds, state.cards?.specialAwarded, update]);

  // Tutorial queue — checks each category's trigger against the previous state.
  // Fires the first un-seen category whose milestone was just reached.
  useEffect(() => {
    const prev = prevStateRef.current;
    for (const cat of TUTORIAL_CATEGORY_LIST) {
      if (state.settings?.tutorialsSeen?.[cat.id]) continue;
      if (cat.trigger && cat.trigger(state, prev)) {
        setTutorialCategory(cat);
        break;
      }
    }
    prevStateRef.current = state;
  }, [state]);

  const startTutorial = (categoryId) => {
    const cat = TUTORIAL_CATEGORIES[categoryId];
    if (cat) setTutorialCategory(cat);
  };

  const closeTutorial = () => {
    if (tutorialCategory) {
      const seen = state.settings?.tutorialsSeen || {};
      update({ settings: { ...(state.settings || {}), tutorialsSeen: { ...seen, [tutorialCategory.id]: true } } });
    }
    setTutorialCategory(null);
    setTutorialTarget(null);
  };

  const handleNavigate = useCallback((target) => {
    screenHistoryRef.current.push(screenRef.current);
    setScreen(target);
  }, []);

  const handleBezelAction = useCallback((action) => {
    switch (action) {
      case 'launch':
        soundEngine.play('dock');
        leaveStation();
        setScreen('system');
        break;
      case 'save':
        { const ok = manualSave(); if (ok) { setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1500); } }
        break;
      case 'selfdestruct':
        setShowSelfDestruct(true);
        break;
      case 'back':
        { const history = screenHistoryRef.current; if (history.length > 0) setScreen(history.pop()); else setScreen('system'); }
        break;
    }
  }, [leaveStation, manualSave]);

  const renderScreen = () => {
    switch (screen) {
      case 'galaxy':
        return <GalaxyMap onJumpToSystem={() => setScreen('system')} onNavigate={handleNavigate} />;
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
        return <Codex onStartTutorial={startTutorial} />;
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
      case 'dockcam':
        return <DockCameraScreen />;
      case 'journey':
        return <JourneyScreen />;
      case 'wreckage':
        return <WreckageScreen />;
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
      // ---- New nav screens ----
      case 'home':
        return <HomeDashboard onNavigate={handleNavigate} />;
      case 'ranks':
        return <RanksScreen />;
      case 'modules':
        return <ModulesManager />;
      case 'firegroups':
        return <FireGroups />;
      case 'shipfunctions':
        return <ShipFunctions />;
      case 'flightassist':
        return <FlightAssistant />;
      case 'pilotprefs':
        return <PilotPreferences />;
      case 'shipstats':
        return <ShipStatistics />;
      case 'contacts':
        return <ContactsScreen onNavigate={handleNavigate} />;
      case 'comms':
        return <CommsLog />;
      case 'devfeatures':
        return <FeaturesInProgress />;
      case 'plannedfeatures':
        return <PlannedFeatures />;
      case 'livery':
        return <Livery />;
      case 'advmaintenance':
        return <AdvancedMaintenance />;
      case 'missionboard':
        return <MissionBoard onNavigate={handleNavigate} />;
      case 'stationcontacts':
        return <StationContacts onNavigate={handleNavigate} />;
      case 'cargo':
        return <CargoScreen />;
      case 'materialslocker':
        return <MaterialsLocker />;
      // ---- In-development stubs ----
      case 'factionassignments':
        return <DevStub title="Faction Assignments" description="Faction-specific assignment contracts are being developed. Check back in a future update." />;
      case 'refinery':
        return <DevStub title="Refinery" description="Mined material refinery processing view is in development." />;
      case 'sessionlog':
        return <DevStub title="Session Log" description="Per-session activity history is in development." />;
      case 'disembark':
        return <DevStub title="Commander Disembarkment" description="On-foot commander exploration is in development." />;
      case 'administration':
        return <DevStub title="Administration" description="Station administration services are in development." />;
      case 'combatbonds':
        return <DevStub title="Combat Bonds" description="Combat bond redemption is in development. Use the Bounty Board for now." />;
      case 'searchrescue':
        return <DevStub title="Search & Rescue" description="Search and rescue transactions are in development." />;
      default:
        return <SystemOrrery />;
    }
  };

  const isFullScreen = screen === 'galaxy' || screen === 'system';

  const effectiveTheme = state.cheats?.unlocked && state.cheats?.active?.golden_theme ? 'sol_gold' : (state.settings.colorTheme || 'elite');
  const monoUI = effectiveTheme === 'mono' && !(state.settings?.monoOverrides?.uiAccent);

  const displayGlobal = state.settings?.display?.global || {};
  const displayScreen = state.settings?.display?.screens?.[screen] || {};
  const display = { ...displayGlobal, ...displayScreen };

  return (
    <div className={`w-full h-screen bg-black flex flex-col overflow-auto ${state.settings?.miniScreen ? 'mini-screen' : ''} ${state.settings?.orientationLocked ? (state.settings?.screenOrientation === 'portrait' ? 'force-portrait' : 'force-landscape') : ''}`}>
      <div className="w-full h-screen" style={state.settings?.displayScale && state.settings.displayScale !== 100 ? { zoom: state.settings.displayScale / 100 } : undefined}>
      <CRTFrame enabled={state.settings.crtEffect} brightness={state.settings.textBrightness || 100} theme={effectiveTheme} customColor={state.settings.customColor} textRGB={state.settings.textRGB} fontFamily={state.settings.fontFamily} fontScale={state.settings.fontScale} display={display}>
        <div className="flex flex-col h-full">
          {state.settings?.statusHeaderVisible !== false && (
            <div className={`relative z-[300] ${monoUI ? 'crt-mono-ui' : ''}`}>
              <StatusHeader />
            </div>
          )}
          <BezelButtons
            screen={screen}
            currentLocation={state.currentLocation}
            bezelLayout={state.settings?.bezelLayout}
            bezelVisible={state.settings?.bezelVisible}
            fleetCarriersCount={(state.fleetCarriers || []).length}
            cheatsUnlocked={state.cheats?.unlocked}
            onNavigate={handleNavigate}
            onAction={handleBezelAction}
            tutorialTarget={tutorialTarget}
            monoUI={monoUI}
          >
            <div data-game-content className={`flex-1 relative z-0 ${isFullScreen ? 'overflow-hidden' : 'overflow-auto'} ${!isFullScreen && monoUI ? 'crt-mono-ui' : ''}`}>
              <div style={getScreenTextStyle(state.settings?.uiTextStyles, screen) || undefined} className="w-full h-full">
                {renderScreen()}
              </div>
            </div>
          </BezelButtons>
          {state.activeEncounter && <EncounterScreen />}
          {cardFlash && (
            <div className="fixed top-20 right-4 z-[400] border border-cyan-600 bg-black/95 p-3 max-w-[15rem]">
              <div className="text-cyan-400 text-[10px] uppercase font-bold">Card Acquired</div>
              <div className="text-orange-300 text-sm font-bold">{cardFlash.name}</div>
              <div className="text-orange-700 text-[9px]">{cardFlash.manufacturer} · {cardFlash.rarity}</div>
            </div>
          )}
          {/* Self-destruct overlay */}
          {showSelfDestruct && <SelfDestructScreen onCancel={() => setShowSelfDestruct(false)} />}
          {/* Rebuy screen overlay (ship destroyed) */}
          {state.rebuyPending && <RebuyScreen />}
          {/* Tutorial overlay */}
          {tutorialCategory && (
            <TutorialOverlay
              steps={tutorialCategory.steps}
              categoryName={tutorialCategory.name}
              onClose={closeTutorial}
              onTargetChange={setTutorialTarget}
            />
          )}
          {/* Footer status bar */}
          <div className={`border-t border-orange-900/50 px-3 py-1 flex items-center justify-between text-[10px] text-orange-800 bg-black ${monoUI ? 'crt-mono-ui' : ''}`}>
            <span>o7 v1.0 · {state.ship?.name || '---'}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { const ok = manualSave(); if (ok) { setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1500); } }}
                className={`hover:text-orange-400 ${saveFlash ? 'text-green-500' : ''}`}
              >
                {saveFlash ? '✓ SAVED' : '💾 SAVE'}
              </button>
              <button
                onClick={() => startTutorial('starter')}
                className="text-cyan-700 hover:text-cyan-500"
              >
                ⚑ TUTORIAL
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
    </div>
  );
}

function GameBootstrap() {
  const { state } = useGameState();
  if (!state.commanderName) return <CharacterCreator />;
  return <GameContent />;
}

export default function Game() {
  const [saveSlot, setSaveSlot] = useState(null);

  if (!saveSlot) {
    return <SaveSelect onSelect={(slot) => {
      setSaveSlot(slot);
    }} />;
  }

  return (
    <GameErrorBoundary>
      <GameStateProvider key={saveSlot} saveSlot={saveSlot} onSwitchSave={() => {
        localStorage.removeItem('starfarer_active_save');
        setSaveSlot(null);
      }}>
        <GameBootstrap />
      </GameStateProvider>
    </GameErrorBoundary>
  );
}