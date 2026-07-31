// Main Game Page — orchestrates all screens with persistent navigation
import React, { useState, useEffect } from 'react';
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

function GameContent() {
  const { state } = useGameState();
  const [screen, setScreen] = useState('system');

  const handleNavigate = (target) => {
    setScreen(target);
  };

  const handleNavigateDirect = (target) => {
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
        return <MiningScreen />;
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
      default:
        return <SystemOrrery />;
    }
  };

  const isFullScreen = screen === 'galaxy' || screen === 'system';

  return (
    <div className={`w-full h-screen bg-black flex flex-col overflow-hidden ${state.settings?.miniScreen ? 'mini-screen' : ''}`}>
      <CRTFrame enabled={state.settings.crtEffect} brightness={state.settings.textBrightness || 100} theme={state.cheats?.unlocked && state.cheats?.active?.golden_theme ? 'sol_gold' : (state.settings.colorTheme || 'elite')}>
        <div className="flex flex-col h-full">
          <StatusHeader />
          <NavBar
            currentScreen={screen}
            onNavigate={handleNavigateDirect}
            location={state.currentLocation}
          />
          <div className={`flex-1 ${isFullScreen ? 'overflow-hidden' : 'overflow-auto'}`}>
            {renderScreen()}
          </div>
          {state.activeEncounter && <EncounterScreen />}
          {/* Footer status bar */}
          <div className="border-t border-orange-900/50 px-3 py-1 flex items-center justify-between text-[10px] text-orange-800 bg-black">
            <span>DOGSTAR INTERSTELLAR v1.0 · {state.ship.name}</span>
            <span className="hidden sm:inline">GALAXY: 4,000,000,000+ SYSTEMS</span>
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
    <GameStateProvider key={saveSlot} saveSlot={saveSlot} onSwitchSave={() => {
      localStorage.removeItem('starfarer_active_save');
      setSaveSlot(null);
    }}>
      <GameContent />
    </GameStateProvider>
  );
}