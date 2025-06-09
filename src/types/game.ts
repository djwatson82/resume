export interface Resource {
  id: string;
  name: string;
  amount: number;
  perSecond: number;
  perClick: number;
  baseValue: number;
  unlocked: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: number;
  type: 'click' | 'auto' | 'multiplier';
  targetResource: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward: number;
  type: 'click' | 'resource' | 'upgrade' | 'prestige';
  targetResource?: string;
  unlocked: boolean;
}

export interface PrestigeLevel {
  level: number;
  multiplier: number;
  cost: number;
  unlocked: boolean;
}

export interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  notificationsEnabled: boolean
  autoSaveEnabled: boolean
  soundVolume: number
  musicVolume: number
}

export interface GameStatistics {
  highestCoins: number
  highestGems: number
  highestCrystals: number
  totalPrestiges: number
  totalUpgrades: number
  totalAchievements: number
}

export interface GameState {
  coins: number
  gems: number
  crystals: number
  clickPower: number
  autoClickerLevel: number
  prestigeLevel: number
  totalClicks: number
  timePlayed: number
  settings: GameSettings
  achievements: {
    unlocked: string[]
    progress: Record<string, number>
  }
  upgrades: {
    clickPower: number
    autoClicker: number
    multipliers: Record<string, number>
  }
  statistics: GameStatistics
} 