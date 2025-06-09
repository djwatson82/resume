import { useGame } from "@/context/GameContext";
import { Achievement } from "@/types/game";
import styles from "./AchievementPanel.module.css";

export const AchievementPanel = () => {
  const { gameState } = useGame();

  const getAchievementProgress = (achievement: Achievement) => {
    switch (achievement.type) {
      case "click":
        return gameState.statistics.totalClicks;
      case "resource":
        return (
          gameState.statistics.totalResources[
            achievement.targetResource || ""
          ] || 0
        );
      case "upgrade":
        return gameState.statistics.upgradesPurchased;
      case "prestige":
        return gameState.statistics.prestigeCount;
      default:
        return 0;
    }
  };

  return (
    <div className={styles.achievementPanel}>
      <h2>Achievements</h2>
      <div className={styles.achievementList}>
        {Object.values(gameState.achievements).map((achievement) => (
          <div
            key={achievement.id}
            className={`${styles.achievementItem} ${
              achievement.unlocked ? styles.unlocked : ""
            }`}
          >
            <div className={styles.achievementInfo}>
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              {!achievement.unlocked && (
                <div className={styles.progress}>
                  Progress: {getAchievementProgress(achievement)}/
                  {achievement.requirement}
                </div>
              )}
              {achievement.unlocked && (
                <div className={styles.reward}>
                  Reward: {achievement.reward.toLocaleString()}
                </div>
              )}
            </div>
            <div className={styles.achievementStatus}>
              {achievement.unlocked ? "✓" : "🔒"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
