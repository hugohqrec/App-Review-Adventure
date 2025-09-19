
import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

const UserSelectionScreen: React.FC = () => {
  const context = useContext(GameContext);
  if (!context) return null;

  const { gameState, selectPlayer } = context;

  return (
    <div className="flex flex-col h-full w-full bg-[#e7f9ee] text-center p-6 justify-center items-center space-y-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-fredoka text-cyan-600 drop-shadow-lg">¿Quién va a jugar?</h1>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
        {gameState.players.map((player, index) => (
          <div key={player.name} className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 p-2 bg-white rounded-full shadow-lg border-4 border-orange-300">
               <img src={player.avatar} alt={player.name} className="w-full h-full object-contain rounded-full" />
            </div>
            <button 
              onClick={() => selectPlayer(index)}
              className="bg-lime-500 text-white font-bold font-fredoka text-2xl py-3 px-8 rounded-full border-b-8 border-lime-700 hover:bg-lime-600 transition-transform active:scale-95 active:border-b-4"
            >
              {player.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSelectionScreen;