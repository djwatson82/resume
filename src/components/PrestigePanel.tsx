import { useGame } from "@/context/GameContext";
import { useCallback } from "react";
import styles from "./PrestigePanel.module.css";

export const PrestigePanel = () => {
  const { gameState, updateGameState } = useGame();

  const handlePrestige = useCallback(() => {
    if (!gameState.prestige.unlocked) return;

    const newResources = { ...gameState.resources };
    const newUpgrades = { ...gameState.upgrades };
    const newAchievements = { ...gameState.achievements };

    // Reset resources but keep some based on prestige level
    Object.values(newResources).forEach((resource) => {
      if (resource.unlocked) {
        resource.amount = Math.floor(resource.amount * 0.1);
        resource.perSecond = 0;
        resource.perClick = resource.baseValue;
      }
    });

    // Reset upgrades
    Object.values(newUpgrades).forEach((upgrade) => {
      if (upgrade.unlocked) {
        upgrade.level = 0;
        upgrade.cost = upgrade.cost / Math.pow(1.5, upgrade.level);
      }
    });

    // Update prestige level
    const newPrestige = {
      ...gameState.prestige,
      level: gameState.prestige.level + 1,
      multiplier: gameState.prestige.multiplier * 1.5,
      cost: gameState.prestige.cost * 2,
    };

    // Update statistics
    const newStatistics = {
      ...gameState.statistics,
      prestigeCount: gameState.statistics.prestigeCount + 1,
    };

    // Check for prestige achievements
    Object.values(newAchievements).forEach((achievement) => {
      if (!achievement.unlocked && achievement.type === "prestige") {
        if (newStatistics.prestigeCount >= achievement.requirement) {
          achievement.unlocked = true;
          newStatistics.achievementsUnlocked++;
          newResources.coins.amount += achievement.reward;
        }
      }
    });

    updateGameState({
      resources: newResources,
      upgrades: newUpgrades,
      achievements: newAchievements,
      prestige: newPrestige,
      statistics: newStatistics,
    });
  }, [gameState, updateGameState]);

  return (
    <div className={styles.prestigePanel}>
      <h2>Prestige</h2>
      <div className={styles.prestigeInfo}>
        <div className={styles.currentLevel}>
          Current Level: {gameState.prestige.level}
        </div>
        <div className={styles.multiplier}>
          Multiplier: {gameState.prestige.multiplier.toFixed(1)}x
        </div>
        {gameState.prestige.unlocked && (
          <button className={styles.prestigeButton} onClick={handlePrestige}>
            Prestige Now
          </button>
        )}
        {!gameState.prestige.unlocked && (
          <div className={styles.requirement}>
            Unlock at {gameState.prestige.cost.toLocaleString()} coins
          </div>
        )}
      </div>
    </div>
  );
};
