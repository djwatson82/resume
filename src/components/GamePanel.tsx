"use client";

import { useGame } from "@/context/GameContext";
import { useEffect } from "react";
import styles from "./GamePanel.module.css";

export default function GamePanel() {
  const { gameState, updateGameState, saveGame, loadGame } = useGame();

  // Auto-clicker effect
  useEffect(() => {
    if (gameState.autoClickerLevel > 0) {
      const clickInterval = setInterval(() => {
        updateGameState({
          coins: gameState.coins + gameState.autoClickerLevel,
        });
      }, 1000);

      return () => clearInterval(clickInterval);
    }
  }, [gameState.autoClickerLevel, gameState.coins, updateGameState]);

  const handleClick = () => {
    updateGameState({
      coins: gameState.coins + gameState.clickPower,
      totalClicks: gameState.totalClicks + 1,
    });
  };

  const upgradeClickPower = () => {
    const cost = gameState.clickPower * 10;
    if (gameState.coins >= cost) {
      updateGameState({
        coins: gameState.coins - cost,
        clickPower: gameState.clickPower + 1,
      });
    }
  };

  const upgradeAutoClicker = () => {
    const cost = (gameState.autoClickerLevel + 1) * 50;
    if (gameState.coins >= cost) {
      updateGameState({
        coins: gameState.coins - cost,
        autoClickerLevel: gameState.autoClickerLevel + 1,
      });
    }
  };

  const prestige = () => {
    if (gameState.coins >= 1000) {
      updateGameState({
        coins: Math.floor(gameState.coins * 0.1),
        gems: gameState.gems + 1,
        clickPower: 1,
        autoClickerLevel: 0,
        prestigeLevel: gameState.prestigeLevel + 1,
      });
    }
  };

  return (
    <div className={styles.gamePanel}>
      <div className={styles.resources}>
        <div className={styles.resource}>
          <span className={styles.label}>Coins:</span>
          <span className={styles.value}>{Math.floor(gameState.coins)}</span>
        </div>
        <div className={styles.resource}>
          <span className={styles.label}>Gems:</span>
          <span className={styles.value}>{gameState.gems}</span>
        </div>
        <div className={styles.resource}>
          <span className={styles.label}>Crystals:</span>
          <span className={styles.value}>{gameState.crystals}</span>
        </div>
      </div>

      <div className={styles.clickArea} onClick={handleClick}>
        <div className={styles.clickButton}>Click Me!</div>
        <div className={styles.clickPower}>
          +{gameState.clickPower} coins per click
        </div>
      </div>

      <div className={styles.upgrades}>
        <button
          className={`btn ${styles.upgradeButton}`}
          onClick={upgradeClickPower}
          disabled={gameState.coins < gameState.clickPower * 10}
        >
          Upgrade Click Power ({gameState.clickPower * 10} coins)
        </button>
        <button
          className={`btn ${styles.upgradeButton}`}
          onClick={upgradeAutoClicker}
          disabled={gameState.coins < (gameState.autoClickerLevel + 1) * 50}
        >
          Buy Auto Clicker ({(gameState.autoClickerLevel + 1) * 50} coins)
        </button>
        <button
          className={`btn ${styles.prestigeButton}`}
          onClick={prestige}
          disabled={gameState.coins < 1000}
        >
          Prestige (1000 coins)
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Total Clicks:</span>
          <span className={styles.value}>{gameState.totalClicks}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Time Played:</span>
          <span className={styles.value}>
            {Math.floor(gameState.timePlayed / 60)}m {gameState.timePlayed % 60}
            s
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Prestige Level:</span>
          <span className={styles.value}>{gameState.prestigeLevel}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-secondary" onClick={saveGame}>
          Save Game
        </button>
        <button className="btn btn-secondary" onClick={loadGame}>
          Load Game
        </button>
      </div>
    </div>
  );
}
