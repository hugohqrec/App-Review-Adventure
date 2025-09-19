export enum Screen {
  Home = 'home',
  Map = 'map',
  Summary = 'summary',
  Mission = 'mission',
  GeminiMission = 'gemini_mission',
  Profile = 'profile',
  Shop = 'shop',
  BubbleGame = 'bubble_game',
}

export enum ItemCategory {
  Hat = 'Hats',
  Accessory = 'Accessories',
  Background = 'Backgrounds',
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: ItemCategory;
  imageUrl: string;
}

export interface Player {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  ownedItems: string[];
  equippedItems: { [key in ItemCategory]?: string };
  achievements: string[];
  missionHistory: { [levelId: string]: number }; // levelId: stars
}

export interface Question {
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface MissionLevel {
  id: string;
  name: string;
  levelNumber: number;
  requiredLevel: number;
  questions: Question[];
  xpReward: number;
  coinReward: number;
  timeLimit?: number; // Time limit in seconds for each question
  hasBubbleGame?: boolean;
  subject: 'math' | 'history';
  summary?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GameState {
  currentScreen: Screen;
  players: Player[];
  currentPlayerIndex: number;
  levels: MissionLevel[];
  currentLevelId: string | null;
  achievements: Achievement[];
  shopItems: ShopItem[];
  missionPart1Result: { xp: number, coins: number, isPerfect: boolean } | null;
  currentSubject: 'math' | 'history' | null;
}