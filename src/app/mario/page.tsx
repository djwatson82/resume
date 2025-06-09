"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./mario.module.css";

interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  direction: "left" | "right";
  speed: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: "mushroom" | "star";
  collected: boolean;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  color: string;
}

const CHAT_MESSAGES = [
  { username: "LuigiFan123", message: "Let's go Mario! 🍄", color: "#00FF00" },
  {
    username: "PeachPrincess",
    message: "Watch out for those enemies! 👑",
    color: "#FF69B4",
  },
  {
    username: "ToadStool",
    message: "Collect all the coins! 🪙",
    color: "#FFD700",
  },
  {
    username: "BowserJr",
    message: "You'll never beat my dad! 🔥",
    color: "#FF4500",
  },
  { username: "YoshiRider", message: "Yoshi! 🦖", color: "#32CD32" },
  {
    username: "StarPower",
    message: "Get the star power! ⭐",
    color: "#FFD700",
  },
  {
    username: "MushroomKing",
    message: "Eat the mushroom! 🍄",
    color: "#FF6347",
  },
  { username: "PipeDreamer", message: "Enter the pipe! 🚪", color: "#4169E1" },
  {
    username: "CoinCollector",
    message: "Nice coin collection! 💰",
    color: "#FFD700",
  },
  { username: "JumpMaster", message: "Perfect jump! 🎯", color: "#FF69B4" },
];

export default function MarioPage() {
  const GRAVITY = 0.6;
  const JUMP_FORCE = -15;
  const MOVE_SPEED = 6;
  const GROUND_Y = 100;
  const MARIO_HEIGHT = 32;
  const MARIO_WIDTH = 32;
  const DAMAGE_INVINCIBILITY_TIME = 2000; // 2 seconds of invincibility after taking damage
  const SCREEN_BOUNDS = {
    left: -window.innerWidth / 2,
    right: window.innerWidth / 2,
  };

  const [position, setPosition] = useState({
    x: 0,
    y: GROUND_Y - MARIO_HEIGHT,
  });
  const [direction, setDirection] = useState("right");
  const [isJumping, setIsJumping] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [coins, setCoins] = useState<Coin[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [lives, setLives] = useState(3);
  const [isInvincible, setIsInvincible] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const chatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const invincibleTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const damageTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ... keep existing initialization code ...

  // Check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const checkCollisions = () => {
      // Check coin collisions
      setCoins((prevCoins) => {
        const newCoins = prevCoins.map((coin) => {
          if (
            !coin.collected &&
            Math.abs(coin.x - position.x) < MARIO_WIDTH * 0.8 &&
            Math.abs(coin.y - position.y) < MARIO_HEIGHT * 0.8
          ) {
            setScore((s) => s + 100);
            const coinSound = new Audio("/coin.mp3");
            coinSound.volume = 0.3;
            coinSound.play().catch(() => {});
            return { ...coin, collected: true };
          }
          return coin;
        });
        return newCoins;
      });

      // Check power-up collisions
      setPowerUps((prevPowerUps) => {
        const newPowerUps = prevPowerUps.map((powerUp) => {
          if (
            !powerUp.collected &&
            Math.abs(powerUp.x - position.x) < MARIO_WIDTH * 0.8 &&
            Math.abs(powerUp.y - position.y) < MARIO_HEIGHT * 0.8
          ) {
            if (powerUp.type === "mushroom") {
              setIsSuper(true);
            } else if (powerUp.type === "star") {
              setIsInvincible(true);
              if (invincibleTimerRef.current) {
                clearTimeout(invincibleTimerRef.current);
              }
              invincibleTimerRef.current = setTimeout(() => {
                setIsInvincible(false);
              }, 10000);
            }
            const powerUpSound = new Audio("/powerup.mp3");
            powerUpSound.volume = 0.3;
            powerUpSound.play().catch(() => {});
            return { ...powerUp, collected: true };
          }
          return powerUp;
        });
        return newPowerUps;
      });

      // Check enemy collisions
      if (!isInvincible && !isDamaged) {
        enemies.forEach((enemy) => {
          // More forgiving collision detection
          const collisionMargin = 8; // Pixels of forgiveness
          if (
            Math.abs(enemy.x - position.x) < MARIO_WIDTH - collisionMargin &&
            Math.abs(enemy.y - position.y) < MARIO_HEIGHT - collisionMargin
          ) {
            if (isSuper) {
              setIsSuper(false);
              setEnemies((prev) => prev.filter((e) => e.id !== enemy.id));
              setScore((s) => s + 200);
            } else {
              setLives((prev) => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                }
                return newLives;
              });
              setIsDamaged(true);
              // Knockback effect
              setVelocity((prev) => ({
                x: enemy.x < position.x ? 10 : -10,
                y: -8,
              }));
              const hitSound = new Audio("/hit.mp3");
              hitSound.volume = 0.3;
              hitSound.play().catch(() => {});

              // Set damage invincibility
              if (damageTimerRef.current) {
                clearTimeout(damageTimerRef.current);
              }
              damageTimerRef.current = setTimeout(() => {
                setIsDamaged(false);
              }, DAMAGE_INVINCIBILITY_TIME);
            }
          }
        });
      }
    };

    checkCollisions();
  }, [
    position,
    gameStarted,
    gameOver,
    enemies,
    isInvincible,
    isSuper,
    isDamaged,
  ]);

  const resetGame = () => {
    setPosition({ x: 0, y: GROUND_Y - MARIO_HEIGHT });
    setVelocity({ x: 0, y: 0 });
    setScore(0);
    setLives(3);
    setIsSuper(false);
    setIsInvincible(false);
    setIsDamaged(false);
    setGameOver(false);
    setGameStarted(false);
    if (invincibleTimerRef.current) {
      clearTimeout(invincibleTimerRef.current);
    }
    if (damageTimerRef.current) {
      clearTimeout(damageTimerRef.current);
    }
  };

  return (
    <div className={styles.container}>
      {!gameStarted ? (
        <div className={styles.startScreen}>
          <h1>Super Mario</h1>
          <p>Press Enter or Space to Start</p>
        </div>
      ) : gameOver ? (
        <div className={styles.gameOver}>
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <>
          <div className={styles.score}>Score: {score}</div>
          <div className={styles.lives}>Lives: {lives}</div>
          <div
            className={`${styles.mario} ${styles[direction]} ${
              isJumping ? styles.jumping : ""
            } ${isMoving ? styles.moving : ""} ${isSuper ? styles.super : ""} ${
              isInvincible ? styles.invincible : ""
            } ${isDamaged ? styles.damaged : ""}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              backgroundPosition: `${frameRef.current * -32}px 0`,
            }}
          />
          {coins.map(
            (coin) =>
              !coin.collected && (
                <div
                  key={coin.id}
                  className={styles.coin}
                  style={{
                    transform: `translate(${coin.x}px, ${coin.y}px)`,
                  }}
                />
              )
          )}
          {powerUps.map(
            (powerUp) =>
              !powerUp.collected && (
                <div
                  key={powerUp.id}
                  className={`${styles.powerUp} ${styles[powerUp.type]}`}
                  style={{
                    transform: `translate(${powerUp.x}px, ${powerUp.y}px)`,
                  }}
                />
              )
          )}
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={styles.platform}
              style={{
                transform: `translate(${platform.x}px, ${platform.y}px)`,
                width: `${platform.width}px`,
              }}
            />
          ))}
          {enemies.map((enemy) => (
            <div
              key={enemy.id}
              className={`${styles.enemy} ${styles[enemy.direction]}`}
              style={{
                transform: `translate(${enemy.x}px, ${enemy.y}px)`,
              }}
            />
          ))}
          <div className={styles.ground} />
          <div className={styles.clouds} />
          <div className={styles.instructions}>
            <p>← → to move</p>
            <p>↑ or Space to jump</p>
          </div>
          <div className={styles.chat}>
            <div className={styles.chatHeader}>
              <h3>Live Chat</h3>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <div key={msg.id} className={styles.chatMessage}>
                  <span
                    className={styles.username}
                    style={{ color: msg.color }}
                  >
                    {msg.username}:
                  </span>
                  <span className={styles.message}>{msg.message}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
