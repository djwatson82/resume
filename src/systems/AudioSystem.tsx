import { useGame } from "@/context/GameContext";
import { useEffect, useRef } from "react";

const CLICK_SOUND = "/sounds/click.mp3";
const ACHIEVEMENT_SOUND = "/sounds/achievement.mp3";
const UPGRADE_SOUND = "/sounds/upgrade.mp3";
const PRESTIGE_SOUND = "/sounds/prestige.mp3";
const BACKGROUND_MUSIC = "/sounds/background.mp3";

declare global {
  interface Window {
    playGameSound?: (soundName: string) => void;
  }
}

export const AudioSystem = () => {
  const { gameState } = useGame();
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    const sounds = {
      click: new Audio(CLICK_SOUND),
      achievement: new Audio(ACHIEVEMENT_SOUND),
      upgrade: new Audio(UPGRADE_SOUND),
      prestige: new Audio(PRESTIGE_SOUND),
      background: new Audio(BACKGROUND_MUSIC),
    };

    // Configure background music
    sounds.background.loop = true;
    sounds.background.volume = 0.3;

    // Store references
    audioRefs.current = sounds;

    // Cleanup
    return () => {
      Object.values(sounds).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    // Handle background music
    const backgroundMusic = audioRefs.current.background;
    if (gameState.settings.musicEnabled) {
      backgroundMusic.play().catch((error) => {
        console.error("Failed to play background music:", error);
      });
    } else {
      backgroundMusic.pause();
    }
  }, [gameState.settings.musicEnabled]);

  const playSound = (soundName: keyof typeof audioRefs.current) => {
    if (!gameState.settings.soundEnabled) return;

    const sound = audioRefs.current[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.error(`Failed to play ${soundName} sound:`, error);
      });
    }
  };

  // Expose playSound function to window for other components to use
  useEffect(() => {
    window.playGameSound = playSound;
    return () => {
      delete window.playGameSound;
    };
  }, [gameState.settings.soundEnabled]);

  return null; // This component doesn't render anything
};
