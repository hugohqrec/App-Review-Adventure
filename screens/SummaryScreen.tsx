import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import Header from '../components/Header';
import { Screen } from '../types';

const LoadingSpinner: React.FC<{text: string}> = ({text}) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:h-16 border-t-4 border-b-4 border-cyan-500"></div>
        <p className="mt-4 text-cyan-700 font-bold text-lg">{text}</p>
    </div>
);

const SummaryScreen: React.FC = () => {
  const context = useContext(GameContext);
  
  if (!context) return null;
  const { gameState, proceedToMission } = context;
  const level = gameState.levels.find(l => l.id === gameState.currentLevelId);

  if (!level) {
      return (
          <div className="flex flex-col h-full bg-[#f0f9ff]">
              <Header title="Error" showBackButton={true} backScreen={Screen.Map}/>
              <div className="p-4 flex-grow flex items-center justify-center">
                  <p className="text-red-500 font-bold">Nivel no encontrado.</p>
              </div>
          </div>
      );
  }

  const isLoading = !level.summary;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-sky-200 to-lime-200 p-4">
        <Header title="¡Prepárate!" showBackButton={true} backScreen={Screen.Map}/>
        <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
            {isLoading ? (
                <LoadingSpinner text="Buscando notas..." />
            ) : (
                <div className="w-full max-w-md animate-fade-in">
                    <h1 className="text-3xl sm:text-4xl font-fredoka text-cyan-700 mb-4">{level.name}</h1>
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-white min-h-[150px] flex items-center justify-center">
                        <p className="text-gray-800 text-lg sm:text-xl leading-relaxed">{level.summary}</p>
                    </div>
                    <button
                        onClick={proceedToMission}
                        className="mt-8 w-full bg-lime-500 text-white font-bold font-fredoka text-2xl py-3 px-8 rounded-full border-b-8 border-lime-700 hover:bg-lime-600 transition-transform active:scale-95 active:border-b-4"
                    >
                        ¡Empezar misión!
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default SummaryScreen;