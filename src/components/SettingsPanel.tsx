"use client";

import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";
import styles from "./SettingsPanel.module.css";

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  autoSaveEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

export default function SettingsPanel() {
  const { gameState, updateGameState } = useGame();
  const [settings, setSettings] = useState<GameSettings>(gameState.settings);

  useEffect(() => {
    setSettings(gameState.settings);
  }, [gameState.settings]);

  const handleSettingChange = (
    key: keyof GameSettings,
    value: boolean | number
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateGameState({ settings: newSettings });
  };

  const resetSettings = () => {
    const defaultSettings: GameSettings = {
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
      autoSaveEnabled: true,
      soundVolume: 0.5,
      musicVolume: 0.3,
    };
    setSettings(defaultSettings);
    updateGameState({ settings: defaultSettings });
  };

  return (
    <div className={styles.settingsPanel}>
      <h2 className={styles.heading}>Settings</h2>

      <div className={styles.settingsList}>
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                handleSettingChange("soundEnabled", e.target.checked)
              }
            />
            Sound Effects
          </label>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) =>
                handleSettingChange("musicEnabled", e.target.checked)
              }
            />
            Background Music
          </label>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) =>
                handleSettingChange("notificationsEnabled", e.target.checked)
              }
            />
            Notifications
          </label>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={settings.autoSaveEnabled}
              onChange={(e) =>
                handleSettingChange("autoSaveEnabled", e.target.checked)
              }
            />
            Auto Save
          </label>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            Sound Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.soundVolume}
              onChange={(e) =>
                handleSettingChange("soundVolume", parseFloat(e.target.value))
              }
              className={styles.volumeSlider}
            />
          </label>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            Music Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) =>
                handleSettingChange("musicVolume", parseFloat(e.target.value))
              }
              className={styles.volumeSlider}
            />
          </label>
        </div>
      </div>

      <div className={styles.settingsActions}>
        <button className={styles.resetButton} onClick={resetSettings}>
          Reset Settings
        </button>
      </div>

      <div className={styles.gameInfo}>
        <p>Game Version: 1.0.0</p>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
