import { GameState } from '@/types/game'

export function initializeGameState(): GameState {
  return {
    coins: 0,
    gems: 0,
    crystals: 0,
    clickPower: 1,
    autoClickerLevel: 0,
    prestigeLevel: 0,
    totalClicks: 0,
    timePlayed: 0,
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
      autoSaveEnabled: true,
      soundVolume: 0.5,
      musicVolume: 0.3,
    },
    achievements: {
      unlocked: [],
      progress: {},
    },
    upgrades: {
      clickPower: 0,
      autoClicker: 0,
      multipliers: {},
    },
    statistics: {
      highestCoins: 0,
      highestGems: 0,
      highestCrystals: 0,
      totalPrestiges: 0,
      totalUpgrades: 0,
      totalAchievements: 0,
    },
  }
} 