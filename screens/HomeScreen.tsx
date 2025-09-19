
import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { Screen } from '../types';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import { XP_PER_LEVEL } from '../constants';

const HomeScreen: React.FC = () => {
  const context = useContext(GameContext);
  if (!context) return null;

  const { gameState, getCurrentPlayer, selectSubject } = context;
  const player = getCurrentPlayer();

  return (
    <div className="flex flex-col h-full w-full bg-[#e7f9ee] text-center p-6 justify-between items-center">
      {/* Title */}
      <div className="flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-fredoka text-cyan-600 drop-shadow-lg">REVIEW</h1>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-fredoka text-orange-500 drop-shadow-lg -mt-4">ADVENTURES</h1>
      </div>
      
      {/* Subject Buttons */}
      <div className="flex flex-col items-center w-full space-y-3 sm:space-y-4">
        <button 
          onClick={() => selectSubject('math')}
          className="w-full max-w-xs bg-lime-500 text-white font-bold font-fredoka text-2xl sm:text-3xl py-3 px-8 rounded-full border-b-8 border-lime-700 hover:bg-lime-600 transition-transform active:scale-95 active:border-b-4">
          Math
        </button>
        <button 
          disabled
          className="w-full max-w-xs bg-gray-400 text-white font-bold font-fredoka text-2xl sm:text-3xl py-3 px-8 rounded-full border-b-8 border-gray-600 cursor-not-allowed opacity-70">
          Inglés
        </button>
        <button 
          disabled
          className="w-full max-w-xs bg-gray-400 text-white font-bold font-fredoka text-2xl sm:text-3xl py-3 px-8 rounded-full border-b-8 border-gray-600 cursor-not-allowed opacity-70">
          Francés
        </button>
        <button 
          onClick={() => selectSubject('history')}
          className="w-full max-w-xs bg-amber-600 text-white font-bold font-fredoka text-2xl sm:text-3xl py-3 px-8 rounded-full border-b-8 border-amber-800 hover:bg-amber-700 transition-transform active:scale-95 active:border-b-4">
          Historia
        </button>
      </div>
      
      {/* Player Info */}
      <div className="flex flex-col items-center">
        <Avatar player={player} shopItems={gameState.shopItems} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" />
        <div className="bg-orange-500 text-white font-bold rounded-full px-4 py-1 border-4 border-white shadow-lg mt-[-1rem] z-10">
            LVL {player.level}
        </div>
        <div className="w-40 sm:w-48 md:w-56 mt-2">
          <ProgressBar value={player.xp} max={XP_PER_LEVEL} label={`XP: ${player.xp} / ${XP_PER_LEVEL}`} colorClass="bg-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;