"use client";

import GamePanel from "@/components/GamePanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import SettingsPanel from "@/components/SettingsPanel";
import StatisticsPanel from "@/components/StatisticsPanel";
import { GameProvider } from "@/context/GameContext";
import { useEffect, useState } from "react";
import styles from "./ClickerGame.module.css";

export default function ClickerGame() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Loading game...</div>;
  }

  return (
    <GameProvider>
      <div className={styles.gameContainer}>
        <GamePanel />
        <StatisticsPanel />
        <SettingsPanel />
        <LeaderboardPanel />
      </div>
    </GameProvider>
  );
}
