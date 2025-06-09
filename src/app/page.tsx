"use client";

import GamePanel from "@/components/GamePanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import SettingsPanel from "@/components/SettingsPanel";
import StatisticsPanel from "@/components/StatisticsPanel";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "game" | "stats" | "settings" | "leaderboard"
  >("game");

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-center mb-8">
        <h1 className="text-4xl font-bold text-center">Clicker Game</h1>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`btn ${
            activeTab === "game" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setActiveTab("game")}
        >
          Game
        </button>
        <button
          className={`btn ${
            activeTab === "stats" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setActiveTab("stats")}
        >
          Statistics
        </button>
        <button
          className={`btn ${
            activeTab === "settings" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
        <button
          className={`btn ${
            activeTab === "leaderboard" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
      </div>

      <div className="panel">
        {activeTab === "game" && <GamePanel />}
        {activeTab === "stats" && <StatisticsPanel />}
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "leaderboard" && <LeaderboardPanel />}
      </div>
    </div>
  );
}
