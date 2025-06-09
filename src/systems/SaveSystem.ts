import { GameState } from '@/types/game';

export class SaveSystem {
  private static readonly SAVE_KEY = 'clickerGame';

  static saveGame(gameState: GameState): void {
    try {
      const saveData = {
        ...gameState,
        lastSave: Date.now(),
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  static loadGame(): GameState | null {
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      if (!saveData) return null;

      const parsedData = JSON.parse(saveData) as GameState;
      
      // Validate save data
      if (!this.isValidSaveData(parsedData)) {
        console.error('Invalid save data');
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  private static isValidSaveData(data: unknown): data is GameState {
    if (!data || typeof data !== 'object') return false;
    
    const gameState = data as Partial<GameState>;
    return (
      'resources' in gameState &&
      'upgrades' in gameState &&
      'achievements' in gameState &&
      'prestige' in gameState &&
      'statistics' in gameState &&
      'settings' in gameState &&
      'gameVersion' in gameState
    );
  }

  static clearSave(): void {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  static exportSave(): string {
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      if (!saveData) return '';
      return btoa(saveData); // Base64 encode the save data
    } catch (error) {
      console.error('Failed to export save:', error);
      return '';
    }
  }

  static importSave(saveString: string): boolean {
    try {
      const saveData = atob(saveString); // Base64 decode the save data
      const parsedData = JSON.parse(saveData) as GameState;
      
      if (!this.isValidSaveData(parsedData)) {
        console.error('Invalid save data');
        return false;
      }

      localStorage.setItem(this.SAVE_KEY, saveData);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
} 