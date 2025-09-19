import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import { XP_PER_LEVEL } from '../constants';
import { MissionLevel, Screen } from '../types';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[1, 2, 3].map(star => (
            <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
    </svg>
);

const SwitchUserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


const ProfileScreen: React.FC = () => {
  const context = useContext(GameContext);
  if (!context) return null;

  const { gameState, getCurrentPlayer, switchPlayer } = context;
  const player = getCurrentPlayer();

  const levelsBySubject = gameState.levels.reduce((acc, level) => {
    const subject = level.subject;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(level);
    return acc;
  }, {} as { [key: string]: MissionLevel[] });
  
  return (
    <div className="flex flex-col h-full bg-[#f0f9ff]">
      <Header title="Progreso" showBackButton={true} backScreen={Screen.Home}/>
      <div className="p-4 flex-grow overflow-y-auto space-y-4 pb-24">
        <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                    <img src={player.avatar} alt="avatar" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-orange-300" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-bold rounded-full px-3 py-0.5 border-2 border-white">
                        LVL {player.level}
                    </div>
                    <button 
                        onClick={switchPlayer}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-transform active:scale-95 border-2 border-white"
                        aria-label="Cambiar de usuario"
                    >
                        <SwitchUserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                <div className="flex-grow">
                   <p className="text-xl sm:text-2xl font-bold font-fredoka text-cyan-800 text-center mb-2">{player.name}</p>
                   <ProgressBar value={player.xp} max={XP_PER_LEVEL} label={`XP: ${player.xp} / ${XP_PER_LEVEL}`} colorClass="bg-yellow-400" />
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold font-fredoka text-cyan-700 mb-2">Mis Logros</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {gameState.achievements.map(ach => (
                     <div key={ach.id} className={`p-2 rounded-lg text-center ${player.achievements.includes(ach.id) ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-100 opacity-50'}`}>
                        <span className="text-2xl sm:text-3xl md:text-4xl">{ach.icon}</span>
                        <p className="text-xs font-bold text-gray-600 leading-tight mt-1">{ach.name}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold font-fredoka text-cyan-700 mb-2">Historial de Misiones</h2>
             <div className="space-y-4">
                {Object.entries(levelsBySubject).map(([subject, levels]) => (
                    <div key={subject}>
                        <h3 className="text-lg font-bold text-gray-600 capitalize mb-2 border-b-2 pb-1">{subject === 'math' ? 'Matemáticas' : 'Historia'}</h3>
                        <ul className="space-y-2">
                            {levels.map(level => {
                                const missionRecord = player.missionHistory[level.id];
                                const isCompleted = missionRecord !== undefined;

                                return (
                                    <li key={level.id} className={`flex justify-between items-center p-2 rounded-md ${isCompleted ? 'bg-green-50' : 'bg-gray-100'}`}>
                                        <div>
                                            <p className={`font-bold ${isCompleted ? 'text-green-800' : 'text-gray-500'}`}>{level.name}</p>
                                            {isCompleted && <p className="text-xs text-gray-500">Completado</p>}
                                        </div>
                                        {isCompleted ? <StarRating rating={missionRecord} /> : <LockIcon />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;