
import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { Screen } from '../types';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backScreen?: Screen;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, backScreen = Screen.Home }) => {
  const context = useContext(GameContext);
  if (!context) return null;

  const { setScreen } = context;

  return (
    <header className="w-full p-2 flex items-center justify-between flex-shrink-0 bg-white/50 backdrop-blur-sm z-10">
      {showBackButton ? (
        <button onClick={() => setScreen(backScreen)} className="bg-yellow-400 border-2 border-yellow-600 text-yellow-800 font-bold p-2 rounded-full shadow-md hover:bg-yellow-300 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : <div className="w-10 h-10" />}
      
      {title && <h1 className="text-xl sm:text-2xl font-bold font-fredoka text-cyan-700 text-center flex-grow mx-2">{title}</h1>}

      <div className="w-10 h-10" />
    </header>
  );
};

export default Header;
