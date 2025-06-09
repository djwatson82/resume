import { useGame } from "@/context/GameContext";
import { Upgrade } from "@/types/game";
import { useCallback } from "react";
import styles from "./UpgradePanel.module.css";

export const UpgradePanel = () => {
  const { gameState, updateGameState } = useGame();

  const handlePurchase = useCallback(
    (upgrade: Upgrade) => {
      const resource = gameState.resources[upgrade.targetResource];
      if (!resource || resource.amount < upgrade.cost) return;

      const newResources = { ...gameState.resources };
      const newUpgrades = { ...gameState.upgrades };

      // Deduct cost
      newResources[upgrade.targetResource].amount -= upgrade.cost;

      // Apply upgrade effect
      if (upgrade.type === "click") {
        newResources[upgrade.targetResource].perClick += upgrade.effect;
      } else if (upgrade.type === "auto") {
        newResources[upgrade.targetResource].perSecond += upgrade.effect;
      }

      // Update upgrade level
      newUpgrades[upgrade.id].level += 1;
      newUpgrades[upgrade.id].cost = Math.floor(upgrade.cost * 1.5);

      // Check if max level reached
      if (newUpgrades[upgrade.id].level >= upgrade.maxLevel) {
        newUpgrades[upgrade.id].unlocked = false;
      }

      // Update statistics
      const newStatistics = {
        ...gameState.statistics,
        upgradesPurchased: gameState.statistics.upgradesPurchased + 1,
      };

      // Check for achievements
      if (newStatistics.upgradesPurchased === 1) {
        const firstUpgradeAchievement = gameState.achievements.firstUpgrade;
        if (!firstUpgradeAchievement.unlocked) {
          firstUpgradeAchievement.unlocked = true;
          newStatistics.achievementsUnlocked++;
          newResources.coins.amount += firstUpgradeAchievement.reward;
        }
      }

      updateGameState({
        resources: newResources,
        upgrades: newUpgrades,
        statistics: newStatistics,
      });
    },
    [gameState, updateGameState]
  );

  return (
    <div className={styles.upgradePanel}>
      <h2>Upgrades</h2>
      <div className={styles.upgradeList}>
        {Object.values(gameState.upgrades).map(
          (upgrade) =>
            upgrade.unlocked && (
              <div key={upgrade.id} className={styles.upgradeItem}>
                <div className={styles.upgradeInfo}>
                  <h3>{upgrade.name}</h3>
                  <p>{upgrade.description}</p>
                  <div className={styles.upgradeLevel}>
                    Level: {upgrade.level}/{upgrade.maxLevel}
                  </div>
                </div>
                <button
                  className={styles.purchaseButton}
                  onClick={() => handlePurchase(upgrade)}
                  disabled={
                    gameState.resources[upgrade.targetResource].amount <
                    upgrade.cost
                  }
                >
                  Purchase ({upgrade.cost.toLocaleString()})
                </button>
              </div>
            )
        )}
      </div>
    </div>
  );
};
