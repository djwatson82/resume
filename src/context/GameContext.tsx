"use client";

import { GameState } from "@/types/game";
import { initializeGameState } from "@/utils/gameInitialization";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface GameContextType {
  gameState: GameState;
  updateGameState: (newState: Partial<GameState>) => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameState>(initializeGameState);

  useEffect(() => {
    // Load saved game state
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      try {
        setGameState(JSON.parse(savedState));
      } catch (error) {
        console.error("Failed to load saved game state:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-save game state every minute
    const autoSaveInterval = setInterval(() => {
      if (gameState.settings.autoSaveEnabled) {
        saveGame();
      }
    }, 60000);

    return () => clearInterval(autoSaveInterval);
  }, [gameState]);

  const updateGameState = (newState: Partial<GameState>) => {
    setGameState((prevState) => {
      const updatedState = { ...prevState, ...newState };

      // Update statistics
      if (newState.coins !== undefined) {
        updatedState.statistics.highestCoins = Math.max(
          updatedState.statistics.highestCoins,
          newState.coins
        );
      }
      if (newState.gems !== undefined) {
        updatedState.statistics.highestGems = Math.max(
          updatedState.statistics.highestGems,
          newState.gems
        );
      }
      if (newState.crystals !== undefined) {
        updatedState.statistics.highestCrystals = Math.max(
          updatedState.statistics.highestCrystals,
          newState.crystals
        );
      }

      return updatedState;
    });
  };

  const saveGame = () => {
    try {
      localStorage.setItem("gameState", JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  };

  const loadGame = () => {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      try {
        setGameState(JSON.parse(savedState));
      } catch (error) {
        console.error("Failed to load saved game state:", error);
      }
    }
  };

  const resetGame = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your game progress? This cannot be undone."
      )
    ) {
      setGameState(initializeGameState());
      localStorage.removeItem("gameState");
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        updateGameState,
        saveGame,
        loadGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
