"use client";

import { useEffect, useState } from "react";
import styles from "./LeaderboardPanel.module.css";

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  lastUpdated: string;
}

export default function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: LeaderboardEntry[] = [
          {
            rank: 1,
            playerName: "Player1",
            score: 1000000,
            lastUpdated: new Date().toISOString(),
          },
          {
            rank: 2,
            playerName: "Player2",
            score: 750000,
            lastUpdated: new Date().toISOString(),
          },
          {
            rank: 3,
            playerName: "Player3",
            score: 500000,
            lastUpdated: new Date().toISOString(),
          },
        ];
        setEntries(mockData);
        setError(null);
      } catch (err) {
        setError("Failed to load leaderboard data");
        console.error("Error loading leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatScore = (score: number): string => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={styles.leaderboardPanel}>
        <h2 className={styles.heading}>Leaderboard</h2>
        <div className={styles.loading}>Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.leaderboardPanel}>
        <h2 className={styles.heading}>Leaderboard</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardPanel}>
      <h2 className={styles.heading}>Leaderboard</h2>

      <div className={styles.leaderboardList}>
        {entries.map((entry) => (
          <div key={entry.rank} className={styles.leaderboardEntry}>
            <span className={styles.rank}>#{entry.rank}</span>
            <span className={styles.playerName}>{entry.playerName}</span>
            <span className={styles.score}>{formatScore(entry.score)}</span>
            <span className={styles.lastUpdated}>
              Last updated: {formatDate(entry.lastUpdated)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.leaderboardInfo}>
        <p>Leaderboard updates every minute</p>
      </div>
    </div>
  );
}
