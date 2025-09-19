
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext';

// Define the shape of a bubble
interface Bubble {
  id: number;
  value: number;
  x: number; // percentage for left
  duration: number; // animation duration
  state: 'active' | 'popped-correct' | 'popped-wrong';
}

const GAME_DURATION = 30; // seconds
const MAX_BUBBLES = 5;

const BubbleGameScreen: React.FC = () => {
    const context = useContext(GameContext);
    if (!context) return null;
    
    const { completeMission, gameState } = context;
    const levelId = gameState.currentLevelId;

    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [score, setScore] = useState({ xp: 0, coins: 0 });
    const [taps, setTaps] = useState({ correct: 0, wrong: 0, total: 0 });
    const [gamePhase, setGamePhase] = useState<'playing' | 'finished'>('playing');
    
    const nextBubbleId = useRef(0);
    // FIX: Changed NodeJS.Timeout to number for browser compatibility, as setTimeout in a browser environment returns a number.
    const timeouts = useRef<number[]>([]);

    // Function to generate a new bubble
    const createBubble = useCallback((): Bubble => {
        // Ensure at least one multiple of 5 is likely to appear
        const isMultipleOf5 = Math.random() > 0.4;
        let value: number;

        if (isMultipleOf5) {
            value = (Math.floor(Math.random() * 12) + 1) * 5; // 5, 10, ..., 60
        } else {
            do {
                value = Math.floor(Math.random() * 60) + 1;
            } while (value % 5 === 0);
        }
        
        const newBubble: Bubble = {
            id: nextBubbleId.current++,
            value,
            x: Math.random() * 85, // 0-85% to stay within bounds
            duration: Math.random() * 5 + 6, // 6-11 seconds to cross screen
            state: 'active'
        };
        
        return newBubble;
    }, []);

    // Game Timer Effect
    useEffect(() => {
        if (gamePhase === 'playing' && timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && gamePhase === 'playing') {
            setGamePhase('finished');
        }
    }, [timeLeft, gamePhase]);

    // Bubble Spawning loop
    const spawnBubble = useCallback(() => {
        if (gamePhase !== 'playing') return;

        setBubbles(prevBubbles => {
            if (prevBubbles.filter(b => b.state === 'active').length < MAX_BUBBLES) {
                return [...prevBubbles, createBubble()];
            }
            return prevBubbles;
        });
        
        const timeoutId = setTimeout(spawnBubble, Math.random() * 1000 + 500); // every 0.5-1.5 seconds
        timeouts.current.push(timeoutId);

    }, [gamePhase, createBubble]);

    useEffect(() => {
        if (gamePhase === 'playing') {
            spawnBubble();
        }
        return () => {
            timeouts.current.forEach(clearTimeout);
        }
    }, [gamePhase, spawnBubble]);


    const handleBubbleTap = (bubbleId: number) => {
        const bubble = bubbles.find(b => b.id === bubbleId);
        if (!bubble || bubble.state !== 'active') return;

        const isCorrect = bubble.value % 5 === 0;

        setBubbles(bubs => bubs.map(b => b.id === bubbleId ? {...b, state: isCorrect ? 'popped-correct' : 'popped-wrong'} : b));
        
        setTaps(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
            total: prev.total + 1
        }));
        
        setScore(prev => ({
            xp: prev.xp + (isCorrect ? 10 : -5),
            coins: prev.coins
        }));
    };

    const handleAnimationEnd = (bubbleId: number) => {
        setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    };

    const handleFinish = () => {
        if (!levelId) return;

        const part1Results = gameState.missionPart1Result || { xp: 0, coins: 0, isPerfect: false };
        const accuracy = taps.total > 0 ? taps.correct / taps.total : 0;
        
        const part2IsPerfect = accuracy === 1 && taps.total > 0;
        let finalXP = Math.max(0, score.xp); // Ensure XP is not negative
        if (part2IsPerfect) finalXP += 20; // Precision bonus

        let finalCoins = score.coins;
        if (accuracy >= 0.8) finalCoins += 10; // Coin bonus

        const totalXP = part1Results.xp + finalXP;
        const totalCoins = part1Results.coins + finalCoins;

        const stars = accuracy >= 0.8 ? 3 : accuracy > 0.5 ? 2 : 1;
        
        const overallIsPerfect = part1Results.isPerfect && part2IsPerfect;
        
        completeMission(levelId, stars, totalXP, totalCoins, overallIsPerfect);
    };

    if (gamePhase === 'finished') {
        const accuracy = taps.total > 0 ? (taps.correct / taps.total) * 100 : 100;
        const part2IsPerfect = accuracy === 100 && taps.total > 0;
        let message = "¡Casi! Practica un poco más";
        if (accuracy > 90) message = "¡Excelente! Dominas la tabla del 5";
        else if (accuracy >= 80) message = "¡Muy bien!";

        return (
            <div className="flex flex-col items-center justify-center h-full bg-cyan-100 p-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-fredoka text-cyan-700">¡Juego Terminado!</h2>
                <div className="my-6 space-y-2 text-lg text-gray-700 bg-white/50 p-4 rounded-lg shadow-inner">
                    <p>Aciertos: <span className="font-bold">{taps.correct}</span></p>
                    <p>Precisión: <span className="font-bold">{accuracy.toFixed(0)}%</span></p>
                    <p>XP Ganados: <span className="font-bold text-green-600">+{Math.max(0, score.xp) + (part2IsPerfect ? 20 : 0)}</span></p>
                    <p>Monedas Ganadas: <span className="font-bold text-yellow-600">+{score.coins + (accuracy >= 0.8 ? 10 : 0)}</span></p>
                </div>
                <p className="text-xl font-bold text-orange-500 mb-6">{message}</p>
                 <button
                    onClick={handleFinish}
                    className="mt-2 bg-lime-500 text-white font-bold font-fredoka text-xl sm:text-2xl py-3 px-10 rounded-full border-b-8 border-lime-700 hover:bg-lime-600 transition-transform active:scale-95 active:border-b-4"
                >
                    Continuar
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-b from-sky-400 to-cyan-200">
            <header className="p-4 flex justify-between items-center text-cyan-800 font-bold bg-white/30 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl">Tiempo: {timeLeft}s</div>
                <div className="text-xl sm:text-2xl">XP: {score.xp}</div>
            </header>
            <div className="flex-grow relative overflow-hidden">
                {bubbles.map(bubble => (
                    <button 
                        key={bubble.id} 
                        onClick={() => handleBubbleTap(bubble.id)}
                        onAnimationEnd={() => handleAnimationEnd(bubble.id)}
                        className={`absolute flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white text-2xl sm:text-3xl font-bold border-4 border-white/50 shadow-lg
                            ${bubble.state === 'active' ? 'bg-blue-500/80 animate-rise' : ''}
                            ${bubble.state === 'popped-correct' ? 'bg-green-500 animate-pop' : ''}
                            ${bubble.state === 'popped-wrong' ? 'bg-red-500 animate-pop' : ''}`}
                        style={{ 
                            left: `${bubble.x}%`, 
                            animationDuration: `${bubble.duration}s` 
                        }}
                    >
                        {bubble.value}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BubbleGameScreen;