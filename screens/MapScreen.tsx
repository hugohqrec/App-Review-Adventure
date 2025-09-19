
import React, { useContext, useRef, useEffect } from 'react';
import { GameContext } from '../contexts/GameContext';
import Header from '../components/Header';
import { MissionLevel, Screen } from '../types';

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
    </svg>
);

const IconMap: { [key: string]: React.FC } = {
    math: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-yellow-800" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 3a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 13a1 1 0 011-1h6a1 1 0 110 2H3a1 1 0 01-1-1zm12-4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
    ),
    history: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 12h.01"/>
        </svg>
    ),
};


const LevelNode: React.FC<{level: MissionLevel, isCompleted: boolean, isLocked: boolean, isCurrent: boolean, onClick: () => void}> = ({ level, isCompleted, isLocked, isCurrent, onClick }) => {
    let bgColor = 'bg-gray-400';
    let icon = <LockIcon />;
    
    const SubjectIcon = IconMap[level.subject] || IconMap.math;

    if (isCompleted) {
        bgColor = 'bg-green-500';
        icon = <CheckmarkIcon />;
    } else if (!isLocked) {
        bgColor = level.subject === 'history' ? 'bg-amber-500' : 'bg-yellow-400';
        icon = <SubjectIcon />;
    }
    
    return (
        <div className={`relative flex flex-col items-center ${isCurrent ? 'animate-bounce-slow' : ''}`}>
            <button 
                disabled={isLocked}
                onClick={onClick}
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${isLocked ? 'opacity-70' : 'hover:scale-110 transition-transform cursor-pointer'}`}
                style={{ backgroundColor: bgColor.split('[')[1]?.replace(']', '') || '#9ca3af' }}
            >
                {icon}
            </button>
            <span className="absolute top-16 sm:top-20 md:top-24 bg-amber-100/80 rounded-md px-2 py-0.5 text-xs sm:text-sm font-bold text-gray-700 shadow">{level.name}</span>
        </div>
    );
}

const levelPositions = [
    { top: '92%', left: '50%' },
    { top: '83%', left: '25%' },
    { top: '74%', left: '75%' },
    { top: '65%', left: '40%' },
    { top: '56%', left: '80%' },
    { top: '47%', left: '50%' },
    { top: '38%', left: '20%' },
    { top: '29%', left: '65%' },
    { top: '20%', left: '35%' },
    { top: '11%', left: '55%' },
];

const MapScreen: React.FC = () => {
    const context = useContext(GameContext);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to the bottom so the player starts at the first level
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, []);

    if (!context) return null;

    const { gameState, startMission, getCurrentPlayer } = context;
    const player = getCurrentPlayer();

    const subjectLevels = gameState.levels.filter(level => level.subject === gameState.currentSubject);
    
    const isLevelCompleted = (level: MissionLevel) => !!player.missionHistory[level.id];
    const isLevelLocked = (level: MissionLevel) => player.level < level.requiredLevel;
    const currentLevel = subjectLevels.find(level => !isLevelCompleted(level) && !isLevelLocked(level));

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-sky-300 to-sky-100">
            <Header showBackButton={true} backScreen={Screen.Home} />
             <div className="relative flex-grow overflow-hidden">
                {/* Scrollable container for the path and nodes */}
                <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto pb-24">
                    <div className="relative w-full h-[150vh]">
                        {/* The Path */}
                        <div className="absolute w-full h-full top-0 left-0 z-0">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 600">
                                <path d="M 50 590 C 0 540, 100 490, 50 440 C 0 390, 100 340, 50 290 C 0 240, 100 190, 50 140 C 0 90, 100 40, 50 0" stroke="#a16207" strokeWidth="24" fill="none" strokeLinecap="round"/>
                                <path d="M 50 590 C 0 540, 100 490, 50 440 C 0 390, 100 340, 50 290 C 0 240, 100 190, 50 140 C 0 90, 100 40, 50 0" stroke="#facc15" strokeWidth="18" fill="none" strokeLinecap="round"/>
                            </svg>
                        </div>
                        
                        {/* Level Nodes */}
                        {subjectLevels.map((level, index) => {
                            const position = levelPositions[index % levelPositions.length];
                            return(
                                <div 
                                    key={level.id} 
                                    className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ top: position.top, left: position.left }}
                                >
                                    <LevelNode 
                                        level={level} 
                                        isCompleted={isLevelCompleted(level)}
                                        isLocked={isLevelLocked(level)}
                                        isCurrent={currentLevel?.id === level.id}
                                        onClick={() => startMission(level.id)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                 {/* Background Scenery */}
                 <div className="absolute bottom-0 left-0 w-full h-1/4 z-0 pointer-events-none">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
                        <path d="M-10,150 L-10,90 C150,10 350,10 510,90 L510,150 Z" style={{stroke: 'none', fill: '#65a30d'}} />
                        <path d="M-10,150 L-10,110 C200,40 400,40 510,110 L510,150 Z" style={{stroke: 'none', fill: '#84cc16'}} />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default MapScreen;
