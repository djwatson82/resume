"use client";

import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";
import styles from "./StatisticsPanel.module.css";

interface GameStats {
  totalClicks: number;
  timePlayed: number;
  coinsEarned: number;
  gemsEarned: number;
  crystalsEarned: number;
  highestClickPower: number;
  highestAutoClickerLevel: number;
  prestigeLevel: number;
  achievementsUnlocked: number;
}

export default function StatisticsPanel() {
  const { gameState } = useGame();
  const [stats, setStats] = useState<GameStats>({
    totalClicks: 0,
    timePlayed: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    crystalsEarned: 0,
    highestClickPower: 0,
    highestAutoClickerLevel: 0,
    prestigeLevel: 0,
    achievementsUnlocked: 0,
  });

  useEffect(() => {
    const loadStats = () => {
      const savedStats = localStorage.getItem("gameStats");
      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (error) {
          console.error("Failed to load game stats:", error);
        }
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const updateStats = () => {
      setStats((prevStats) => ({
        ...prevStats,
        totalClicks: gameState.totalClicks,
        timePlayed: gameState.timePlayed,
        coinsEarned: gameState.statistics.highestCoins,
        gemsEarned: gameState.statistics.highestGems,
        crystalsEarned: gameState.statistics.highestCrystals,
        highestClickPower: gameState.clickPower,
        highestAutoClickerLevel: gameState.autoClickerLevel,
        prestigeLevel: gameState.prestigeLevel,
        achievementsUnlocked: gameState.achievements.unlocked.length,
      }));
    };

    updateStats();
  }, [gameState]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className={styles.statisticsPanel}>
      <h2 className={styles.heading}>Statistics</h2>

      <div className={styles.statisticsList}>
        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Total Clicks</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.totalClicks)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Time Played</span>
          <span className={styles.statisticValue}>
            {formatTime(stats.timePlayed)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Coins Earned</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.coinsEarned)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Gems Earned</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.gemsEarned)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Crystals Earned</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.crystalsEarned)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Highest Click Power</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.highestClickPower)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>
            Highest Auto Clicker Level
          </span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.highestAutoClickerLevel)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Prestige Level</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.prestigeLevel)}
          </span>
        </div>

        <div className={styles.statisticItem}>
          <span className={styles.statisticLabel}>Achievements Unlocked</span>
          <span className={styles.statisticValue}>
            {formatNumber(stats.achievementsUnlocked)}
          </span>
        </div>
      </div>
    </div>
  );
}
