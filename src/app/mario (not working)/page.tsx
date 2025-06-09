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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const chatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const invincibleTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize game elements
  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Initialize coins
      const newCoins: Coin[] = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x:
          Math.random() * (SCREEN_BOUNDS.right - SCREEN_BOUNDS.left) +
          SCREEN_BOUNDS.left,
        y: Math.random() * 200 + 50,
        collected: false,
      }));
      setCoins(newCoins);

      // Initialize platforms
      const newPlatforms: Platform[] = [
        { id: 0, x: -200, y: 150, width: 100 },
        { id: 1, x: 0, y: 200, width: 100 },
        { id: 2, x: 200, y: 150, width: 100 },
        { id: 3, x: -100, y: 100, width: 100 },
        { id: 4, x: 100, y: 100, width: 100 },
        { id: 5, x: -300, y: 250, width: 150 },
        { id: 6, x: 300, y: 250, width: 150 },
      ];
      setPlatforms(newPlatforms);

      // Initialize enemies
      const newEnemies: Enemy[] = [
        {
          id: 0,
          x: -150,
          y: GROUND_Y - MARIO_HEIGHT,
          direction: "right",
          speed: 2,
        },
        {
          id: 1,
          x: 150,
          y: GROUND_Y - MARIO_HEIGHT,
          direction: "left",
          speed: 2,
        },
        {
          id: 2,
          x: 0,
          y: GROUND_Y - MARIO_HEIGHT,
          direction: "right",
          speed: 3,
        },
      ];
      setEnemies(newEnemies);

      // Initialize power-ups
      const newPowerUps: PowerUp[] = [
        { id: 0, x: -200, y: 100, type: "mushroom", collected: false },
        { id: 1, x: 200, y: 100, type: "star", collected: false },
      ];
      setPowerUps(newPowerUps);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/mario-theme.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted && (e.key === "Enter" || e.key === " ")) {
        setGameStarted(true);
        audioRef.current?.play();
        return;
      }

      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case "ArrowLeft":
          setVelocity((prev) => ({ ...prev, x: -MOVE_SPEED }));
          setDirection("left");
          setIsMoving(true);
          break;
        case "ArrowRight":
          setVelocity((prev) => ({ ...prev, x: MOVE_SPEED }));
          setDirection("right");
          setIsMoving(true);
          break;
        case "ArrowUp":
        case " ":
          if (!isJumping) {
            setIsJumping(true);
            setVelocity((prev) => ({ ...prev, y: JUMP_FORCE }));
            // Play jump sound
            const jumpSound = new Audio("/jump.mp3");
            jumpSound.volume = 0.3;
            jumpSound.play().catch(() => {});
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setVelocity((prev) => ({ ...prev, x: 0 }));
        setIsMoving(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      audioRef.current?.pause();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isJumping, gameStarted, gameOver]);

  // Check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const checkCollisions = () => {
      // Check coin collisions
      setCoins((prevCoins) => {
        const newCoins = prevCoins.map((coin) => {
          if (
            !coin.collected &&
            Math.abs(coin.x - position.x) < MARIO_WIDTH &&
            Math.abs(coin.y - position.y) < MARIO_HEIGHT
          ) {
            setScore((s) => s + 100);
            // Play coin sound
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
            Math.abs(powerUp.x - position.x) < MARIO_WIDTH &&
            Math.abs(powerUp.y - position.y) < MARIO_HEIGHT
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
            // Play power-up sound
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
      if (!isInvincible) {
        enemies.forEach((enemy) => {
          if (
            Math.abs(enemy.x - position.x) < MARIO_WIDTH &&
            Math.abs(enemy.y - position.y) < MARIO_HEIGHT
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
              // Play hit sound
              const hitSound = new Audio("/hit.mp3");
              hitSound.volume = 0.3;
              hitSound.play().catch(() => {});
            }
          }
        });
      }
    };

    checkCollisions();
  }, [position, gameStarted, gameOver, enemies, isInvincible, isSuper]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      // Update position based on velocity
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;

        // Screen bounds check
        newX = Math.max(
          SCREEN_BOUNDS.left,
          Math.min(SCREEN_BOUNDS.right, newX)
        );

        // Apply gravity
        setVelocity((prev) => ({ ...prev, y: prev.y + GRAVITY }));

        // Platform collisions
        let onPlatform = false;
        platforms.forEach((platform) => {
          if (
            newX + MARIO_WIDTH > platform.x &&
            newX < platform.x + platform.width &&
            newY + MARIO_HEIGHT > platform.y &&
            newY + MARIO_HEIGHT < platform.y + 20
          ) {
            newY = platform.y - MARIO_HEIGHT;
            setVelocity((prev) => ({ ...prev, y: 0 }));
            setIsJumping(false);
            onPlatform = true;
          }
        });

        // Ground collision
        if (!onPlatform && newY >= GROUND_Y - MARIO_HEIGHT) {
          newY = GROUND_Y - MARIO_HEIGHT;
          setVelocity((prev) => ({ ...prev, y: 0 }));
          setIsJumping(false);
        }

        return { x: newX, y: newY };
      });

      // Update enemies
      setEnemies((prevEnemies) =>
        prevEnemies.map((enemy) => {
          const newX =
            enemy.x +
            (enemy.direction === "right" ? enemy.speed : -enemy.speed);

          // Change direction if hitting screen bounds
          if (newX <= SCREEN_BOUNDS.left || newX >= SCREEN_BOUNDS.right) {
            return {
              ...enemy,
              x: newX,
              direction: enemy.direction === "right" ? "left" : "right",
            };
          }

          return { ...enemy, x: newX };
        })
      );

      // Update animation frame
      if (Date.now() - lastFrameTimeRef.current > 100) {
        frameRef.current = (frameRef.current + 1) % 4;
        lastFrameTimeRef.current = Date.now();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, velocity, platforms]);

  // Add chat messages
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const addRandomMessage = () => {
      const randomMessage =
        CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
      setChatMessages((prev) => {
        const newMessage = {
          id: Date.now(),
          ...randomMessage,
        };
        return [...prev.slice(-4), newMessage];
      });
    };

    chatIntervalRef.current = setInterval(addRandomMessage, 3000);
    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setPosition({ x: 0, y: GROUND_Y - MARIO_HEIGHT });
    setVelocity({ x: 0, y: 0 });
    setScore(0);
    setLives(3);
    setIsSuper(false);
    setIsInvincible(false);
    setGameOver(false);
    setGameStarted(false);
    if (invincibleTimerRef.current) {
      clearTimeout(invincibleTimerRef.current);
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
            }`}
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
