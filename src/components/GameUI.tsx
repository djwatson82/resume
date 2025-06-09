import { useGame } from "@/context/GameContext";
import { useCallback } from "react";
import { AchievementPanel } from "./AchievementPanel";
import styles from "./GameUI.module.css";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { PrestigePanel } from "./PrestigePanel";
import { ResourceDisplay } from "./ResourceDisplay";
import { SettingsPanel } from "./SettingsPanel";
import { StatisticsPanel } from "./StatisticsPanel";
import { UpgradePanel } from "./UpgradePanel";

export const GameUI = () => {
  const { gameState, updateGameState } = useGame();

  const handleClick = useCallback(() => {
    const newResources = { ...gameState.resources };
    let totalClicks = gameState.statistics.totalClicks + 1;

    // Apply click effects to each resource
    Object.values(newResources).forEach((resource) => {
      if (resource.unlocked) {
        const clickValue = resource.perClick * gameState.prestige.multiplier;
        resource.amount += clickValue;

        // Update statistics
        gameState.statistics.totalResources[resource.id] =
          (gameState.statistics.totalResources[resource.id] || 0) + clickValue;

        // Update highest resource
        if (
          resource.amount >
          (gameState.statistics.highestResource[resource.id] || 0)
        ) {
          gameState.statistics.highestResource[resource.id] = resource.amount;
        }
      }
    });

    // Check for achievements
    if (totalClicks === 1) {
      const firstClickAchievement = gameState.achievements.firstClick;
      if (!firstClickAchievement.unlocked) {
        firstClickAchievement.unlocked = true;
        gameState.statistics.achievementsUnlocked++;
        newResources.coins.amount += firstClickAchievement.reward;
      }
    }

    updateGameState({
      resources: newResources,
      statistics: {
        ...gameState.statistics,
        totalClicks,
      },
    });
  }, [gameState, updateGameState]);

  return (
    <div className={styles.gameUI}>
      <div className={styles.mainContent}>
        <div className={styles.clickArea} onClick={handleClick}>
          <div className={styles.clickButton}>Click Me!</div>
        </div>

        <div className={styles.resourcesPanel}>
          <ResourceDisplay resources={gameState.resources} />
        </div>
      </div>

      <div className={styles.sidePanels}>
        <UpgradePanel />
        <AchievementPanel />
        <PrestigePanel />
        <StatisticsPanel />
        <SettingsPanel />
        <LeaderboardPanel />
      </div>
    </div>
  );
};
