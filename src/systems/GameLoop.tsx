import { useGame } from "@/context/GameContext";
import { useCallback, useEffect } from "react";
import { SaveSystem } from "./SaveSystem";

export const GameLoop = () => {
  const { gameState, updateGameState } = useGame();

  const updateGame = useCallback(() => {
    const newResources = { ...gameState.resources };
    let hasChanges = false;

    // Update resources based on perSecond values
    Object.values(newResources).forEach((resource) => {
      if (resource.unlocked && resource.perSecond > 0) {
        const oldAmount = resource.amount;
        resource.amount += resource.perSecond * gameState.prestige.multiplier;

        // Update statistics
        gameState.statistics.totalResources[resource.id] =
          (gameState.statistics.totalResources[resource.id] || 0) +
          resource.perSecond;

        // Update highest resource
        if (
          resource.amount >
          (gameState.statistics.highestResource[resource.id] || 0)
        ) {
          gameState.statistics.highestResource[resource.id] = resource.amount;
        }

        if (oldAmount !== resource.amount) {
          hasChanges = true;
        }
      }
    });

    // Update time played
    const newStatistics = {
      ...gameState.statistics,
      timePlayed: gameState.statistics.timePlayed + 1,
    };

    // Check for prestige unlock
    const newPrestige = { ...gameState.prestige };
    if (
      !newPrestige.unlocked &&
      newResources.coins.amount >= newPrestige.cost
    ) {
      newPrestige.unlocked = true;
      hasChanges = true;
    }

    if (hasChanges) {
      updateGameState({
        resources: newResources,
        statistics: newStatistics,
        prestige: newPrestige,
      });
    }

    // Auto-save if enabled
    if (gameState.settings.autoSave) {
      SaveSystem.saveGame(gameState);
    }
  }, [gameState, updateGameState]);

  useEffect(() => {
    // Start game loop
    const gameLoop = setInterval(updateGame, 1000);

    // Cleanup
    return () => {
      clearInterval(gameLoop);
      // Save game state when component unmounts
      if (gameState.settings.autoSave) {
        SaveSystem.saveGame(gameState);
      }
    };
  }, [gameState, updateGame]);

  return null; // This component doesn't render anything
};
