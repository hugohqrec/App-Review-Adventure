
import React, { useContext } from 'react';
import { GameContext } from './contexts/GameContext';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import MissionScreen from './screens/MissionScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShopScreen from './screens/ShopScreen';
import GeminiMissionScreen from './screens/GeminiMissionScreen';
import BubbleGameScreen from './screens/BubbleGameScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';
import SummaryScreen from './screens/SummaryScreen'; // Import new screen
import { Screen } from './types';

const HomeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const CoinIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "h-6 w-6"} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#FBBF24"/>
        <circle cx="10" cy="10" r="7" stroke="#F59E0B" strokeWidth="2" fill="#FCD34D"/>
    </svg>
);

const BottomNavBar: React.FC = () => {
  const context = useContext(GameContext);
  if (!context) return null;

  const { gameState, setScreen, getCurrentPlayer } = context;
  const player = getCurrentPlayer();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm mx-auto z-50">
      <div className="h-16 bg-sky-200/90 backdrop-blur-sm rounded-full border-4 border-gray-800 flex items-center justify-between px-2 shadow-lg">
        {/* Home Button with layered effect */}
        <div className="relative h-12 w-14 flex items-center">
            <div className="absolute w-12 h-12 bg-yellow-400 rounded-full left-0 z-0"></div>
            <button
                onClick={() => setScreen(Screen.Home)}
                className="absolute bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 border-purple-800 active:scale-95 transition-transform left-2 z-10"
                aria-label="Volver al inicio"
            >
                <HomeIcon />
            </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Coin Display */}
          <div className="flex items-center space-x-2 bg-yellow-400 border-2 border-yellow-600 rounded-full px-3 py-1 shadow-inner h-10">
            <CoinIcon className="h-6 w-6" />
            <span className="font-bold text-yellow-900 text-lg">{player.coins}</span>
          </div>
          
          {/* Profile Button with layered effect */}
          <div className="relative h-12 w-14 flex items-center">
            <div className="absolute w-12 h-12 bg-orange-500 rounded-full right-2 z-0"></div>
            <button 
                onClick={() => setScreen(Screen.Profile)} 
                className="absolute w-12 h-12 rounded-full shadow-md hover:scale-105 transition p-0 border-4 border-purple-500 active:scale-95 right-0 z-10"
                aria-label="Ver perfil"
            >
                <img src={player.avatar} alt="profile" className="w-full h-full rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const context = useContext(GameContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { gameState } = context;
  const isUserSelected = gameState.currentPlayerIndex > -1;

  const renderScreen = () => {
    switch (gameState.currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'map':
        return <MapScreen />;
      case 'summary':
        return <SummaryScreen />;
      case 'mission':
        return <MissionScreen />;
      case 'gemini_mission':
        return <GeminiMissionScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'bubble_game':
        return <BubbleGameScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showNavBar = isUserSelected && 
    gameState.currentScreen !== Screen.Home && 
    gameState.currentScreen !== Screen.BubbleGame &&
    gameState.currentScreen !== Screen.Summary;

  return (
    <div className="bg-[#a3e635] h-screen w-full flex items-center justify-center p-2 sm:p-4 bg-cover bg-center" style={{backgroundImage: "url('https://i.postimg.cc/HjvKs0vV/fondo.jpg')"}}>
      <div className="w-full h-full max-w-md md:max-w-lg lg:max-w-xl sm:max-h-[95vh] bg-[#f0fff0] rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden flex flex-col relative">
        {isUserSelected ? renderScreen() : <UserSelectionScreen />}
        
        {showNavBar && <BottomNavBar />}
      </div>
    </div>
  );
};

export default App;
