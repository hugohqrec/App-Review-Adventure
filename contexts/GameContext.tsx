import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { GameState, Screen, Player, MissionLevel } from '../types';
import { LEVELS, SHOP_ITEMS, ACHIEVEMENTS, INITIAL_PLAYERS, XP_PER_LEVEL } from '../constants';
import { generateSummary } from '../services/geminiService';

const PLAYERS_STORAGE_KEY = 'review-adventures-players';
const LEVELS_STORAGE_KEY = 'review-adventures-levels';

interface GameContextProps {
  gameState: GameState;
  setScreen: (screen: Screen) => void;
  selectPlayer: (playerIndex: number) => void;
  switchPlayer: () => void;
  selectSubject: (subject: 'math' | 'history') => void;
  startMission: (levelId: string) => void;
  proceedToMission: () => void;
  completeMission: (levelId: string, stars: number, xpEarned: number, coinsEarned: number, isPerfect: boolean) => void;
  buyShopItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  getCurrentPlayer: () => Player;
  setMissionPart1Result: (result: { xp: number; coins: number; isPerfect: boolean }) => void;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

const loadPlayers = (): Player[] => {
    try {
        const savedPlayers = localStorage.getItem(PLAYERS_STORAGE_KEY);
        if (savedPlayers) {
            return JSON.parse(savedPlayers);
        }
    } catch (error) {
        console.error("Could not load players from localStorage", error);
    }
    return INITIAL_PLAYERS;
};

const loadLevels = (): MissionLevel[] => {
    try {
        const savedLevelsJSON = localStorage.getItem(LEVELS_STORAGE_KEY);
        if (savedLevelsJSON) {
            const savedLevels: MissionLevel[] = JSON.parse(savedLevelsJSON);
            const savedLevelsMap = new Map(savedLevels.map(l => [l.id, l]));

            // This ensures that the structure and content of levels are always up-to-date with the code's constants,
            // but we preserve the generated summary from localStorage.
            const updatedLevels = LEVELS.map(constantLevel => {
                const savedLevel = savedLevelsMap.get(constantLevel.id);
                if (savedLevel && savedLevel.summary) {
                    return { ...constantLevel, summary: savedLevel.summary };
                }
                return constantLevel;
            });
            return updatedLevels;
        }
    } catch (error) {
        console.error("Could not load levels from localStorage", error);
    }
    return LEVELS;
};


export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: Screen.Home,
    players: loadPlayers(),
    currentPlayerIndex: -1,
    levels: loadLevels(),
    currentLevelId: null,
    achievements: ACHIEVEMENTS,
    shopItems: SHOP_ITEMS,
    missionPart1Result: null,
    currentSubject: null,
  });

  useEffect(() => {
    try {
        localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(gameState.players));
    } catch (error) {
        console.error("Could not save players to localStorage", error);
    }
  }, [gameState.players]);

  useEffect(() => {
    try {
        localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(gameState.levels));
    } catch (error) {
        console.error("Could not save levels to localStorage", error);
    }
  }, [gameState.levels]);

  const getCurrentPlayer = useCallback(() => {
    return gameState.players[gameState.currentPlayerIndex];
  }, [gameState.players, gameState.currentPlayerIndex]);

  const setScreen = (screen: Screen) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  };

  const selectPlayer = (playerIndex: number) => {
    setGameState(prev => ({
        ...prev,
        currentPlayerIndex: playerIndex,
        currentScreen: Screen.Home,
    }));
  };

  const switchPlayer = () => {
    setGameState(prev => ({
        ...prev,
        currentPlayerIndex: -1,
        currentScreen: Screen.Home,
        currentSubject: null,
    }));
  };

  const selectSubject = (subject: 'math' | 'history') => {
    setGameState(prev => ({
        ...prev,
        currentSubject: subject,
        currentScreen: Screen.Map,
    }));
  };

  const startMission = (levelId: string) => {
    const level = gameState.levels.find(l => l.id === levelId);
    const player = getCurrentPlayer();
    if (level && player.level >= level.requiredLevel) {
        setGameState(prev => ({
            ...prev,
            currentScreen: Screen.Summary,
            currentLevelId: levelId
        }));

        // If summary doesn't exist, generate and save it.
        if (!level.summary) {
            (async () => {
                try {
                    const summaryText = await generateSummary(level.name, level.subject);
                    const finalSummary = summaryText || '¡Prepárate para el desafío! Demuestra lo que sabes.';
                    
                    setGameState(prev => {
                        const newLevels = prev.levels.map(l => 
                            l.id === levelId ? { ...l, summary: finalSummary } : l
                        );
                        return { ...prev, levels: newLevels };
                    });

                } catch (error) {
                    console.error("Failed to generate summary:", error);
                    setGameState(prev => {
                        const newLevels = prev.levels.map(l => 
                            l.id === levelId ? { ...l, summary: 'No se pudo cargar el resumen. ¡Mucha suerte en la misión!' } : l
                        );
                        return { ...prev, levels: newLevels };
                    });
                }
            })();
        }
    } else {
        console.log("Level locked or not found");
    }
  };

  const proceedToMission = () => {
    const level = gameState.levels.find(l => l.id === gameState.currentLevelId);
    if (!level) return;

    setGameState(prev => ({
        ...prev,
        currentScreen: level.questions.length > 0 ? Screen.Mission : Screen.GeminiMission,
    }));
  };

  const setMissionPart1Result = (result: { xp: number; coins: number; isPerfect: boolean }) => {
    setGameState(prev => ({ ...prev, missionPart1Result: result }));
  };

  const completeMission = (levelId: string, stars: number, xpEarned: number, coinsEarned: number, isPerfect: boolean) => {
    const level = gameState.levels.find(l => l.id === levelId);
    if (!level) return;

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[prev.currentPlayerIndex] };

      player.xp += xpEarned;
      player.coins += coinsEarned;
      player.missionHistory = { ...player.missionHistory, [levelId]: Math.max(player.missionHistory[levelId] || 0, stars) };
      
      if (levelId === 'boss_mission_1' && stars >= 3 && !player.achievements.includes('basic_tables_master')) {
          player.achievements.push('basic_tables_master');
      }

      if (isPerfect && player.level === level.requiredLevel) {
          player.level += 1;
      }

      while (player.xp >= XP_PER_LEVEL) {
          player.level += 1;
          player.xp -= XP_PER_LEVEL;
      }

      newPlayers[prev.currentPlayerIndex] = player;
      return { ...prev, players: newPlayers, currentScreen: Screen.Map, missionPart1Result: null };
    });
  };
  
  const buyShopItem = (itemId: string) => {
    const item = gameState.shopItems.find(i => i.id === itemId);
    const player = getCurrentPlayer();
    if (item && player.coins >= item.price && !player.ownedItems.includes(itemId)) {
        setGameState(prev => {
            const newPlayers = [...prev.players];
            const updatedPlayer = { ...newPlayers[prev.currentPlayerIndex] };
            updatedPlayer.coins -= item.price;
            updatedPlayer.ownedItems.push(itemId);
            newPlayers[prev.currentPlayerIndex] = updatedPlayer;
            return { ...prev, players: newPlayers };
        });
    }
  };

  const equipItem = (itemId: string) => {
      const item = gameState.shopItems.find(i => i.id === itemId);
      const player = getCurrentPlayer();
      if(item && player.ownedItems.includes(itemId)) {
          setGameState(prev => {
              const newPlayers = [...prev.players];
              const updatedPlayer = { ...newPlayers[prev.currentPlayerIndex] };
              updatedPlayer.equippedItems = {
                  ...updatedPlayer.equippedItems,
                  [item.category]: itemId,
              };
              newPlayers[prev.currentPlayerIndex] = updatedPlayer;
              return {...prev, players: newPlayers};
          });
      }
  };

  return (
    <GameContext.Provider value={{ gameState, setScreen, selectPlayer, switchPlayer, selectSubject, startMission, completeMission, buyShopItem, equipItem, getCurrentPlayer, setMissionPart1Result, proceedToMission }}>
      {children}
    </GameContext.Provider>
  );
};