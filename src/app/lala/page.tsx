"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

interface Spike {
  id: number;
  x: number;
}

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  hasSpike?: boolean;
}

type GameState = "menu" | "playing" | "gameOver" | "shop" | "platformer";
type CubeSkin = "default" | "gold" | "rainbow" | "neon";
type GravityMode = "normal" | "reversed";

interface ShopItem {
  id: CubeSkin;
  name: string;
  price: number;
  color: string;
  gradient?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    color: "bg-blue-500",
    id: "default",
    name: "Classic Blue",
    price: 0,
  },
  {
    color: "bg-yellow-400",
    gradient: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    id: "gold",
    name: "Golden Cube",
    price: 1000,
  },
  {
    color: "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500",
    id: "rainbow",
    name: "Rainbow Cube",
    price: 2000,
  },
  {
    color: "bg-purple-500",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    id: "neon",
    name: "Neon Cube",
    price: 3000,
  },
];

// Add Geometry Dash style constants
const GRAVITY = 0.4;
const JUMP_FORCE = -12;
const DOUBLE_JUMP_FORCE = -10;
const MAX_JUMPS = 2;
const DEATH_EFFECT_DURATION = 1000;
const LEVEL_PROGRESS_INCREMENT = 0.1;

const CubeRunner: React.FC = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [jumpsRemaining, setJumpsRemaining] = useState(MAX_JUMPS);
  const [gravityMode, setGravityMode] = useState<GravityMode>("normal");
  const [isDead, setIsDead] = useState(false);
  const [levelProgress, setLevelProgress] = useState(0);
  const [spikes, setSpikes] = useState<Spike[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [speed, setSpeed] = useState(5);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState<CubeSkin>("default");
  const [ownedSkins, setOwnedSkins] = useState<CubeSkin[]>(["default"]);
  const [cubePosition, setCubePosition] = useState({ x: 50, y: 0 });
  const [cubeVelocity, setCubeVelocity] = useState({ x: 0, y: 0 });
  const cubeControls = useAnimation();

  const jump = useCallback(() => {
    if (gameState === "playing") {
      if (!isJumping) {
        setIsJumping(true);
        setGravityMode((prev) => (prev === "normal" ? "reversed" : "normal"));
        cubeControls
          .start({
            transition: {
              y: {
                duration: 0.8,
                ease: [0.32, 0.72, 0, 1],
              },
            },
            y: gravityMode === "normal" ? [-150, 0] : [150, 0],
          })
          .then(() => {
            setIsJumping(false);
          });
      }
    } else if (gameState === "platformer") {
      if (jumpsRemaining > 0) {
        setIsJumping(true);
        const jumpForce = gravityMode === "normal" ? JUMP_FORCE : -JUMP_FORCE;
        setCubeVelocity((prev) => ({
          ...prev,
          y: jumpsRemaining === MAX_JUMPS ? jumpForce : jumpForce * 0.8,
        }));
        setJumpsRemaining((prev) => prev - 1);
      }
    }
  }, [isJumping, gameState, cubeControls, jumpsRemaining, gravityMode]);

  const handleDeath = useCallback(() => {
    setIsDead(true);
    setGameState("gameOver");
    if (score > highScore) {
      setHighScore(score);
    }
    setCoins((prev) => prev + Math.floor(score / 10));

    // Death effect animation
    cubeControls.start({
      scale: [1, 1.2, 0],
      rotate: [0, 360],
      transition: {
        duration: DEATH_EFFECT_DURATION / 1000,
        ease: "easeOut",
      },
    });

    setTimeout(() => {
      setIsDead(false);
    }, DEATH_EFFECT_DURATION);
  }, [score, highScore, cubeControls]);

  useEffect(() => {
    if (gameState === "platformer") {
      const gameLoop = setInterval(() => {
        // Apply gravity based on mode
        setCubeVelocity((prev) => ({
          ...prev,
          y: prev.y + (gravityMode === "normal" ? GRAVITY : -GRAVITY),
        }));

        // Update position with smoother movement
        setCubePosition((prev) => {
          const newX = Math.max(
            0,
            Math.min(window.innerWidth - 50, prev.x + cubeVelocity.x)
          );
          const newY = prev.y + cubeVelocity.y;

          // Update level progress
          setLevelProgress((prev) =>
            Math.min(100, prev + LEVEL_PROGRESS_INCREMENT)
          );

          // Check platform collisions
          const onPlatform = platforms.some(
            (platform) =>
              newX + 50 > platform.x &&
              newX < platform.x + platform.width &&
              Math.abs(newY - platform.y) < 10 &&
              (gravityMode === "normal"
                ? cubeVelocity.y > 0
                : cubeVelocity.y < 0)
          );

          // Check spike collisions
          const hitSpike = platforms.some(
            (platform) =>
              platform.hasSpike &&
              newX + 50 > platform.x &&
              newX < platform.x + platform.width &&
              Math.abs(newY - platform.y) < 10
          );

          if (hitSpike) {
            handleDeath();
            return prev;
          }

          // Check floor/ceiling collision
          const onFloor =
            gravityMode === "normal"
              ? newY >= window.innerHeight - 150
              : newY <= 0;

          if (
            (onPlatform || onFloor) &&
            (gravityMode === "normal" ? cubeVelocity.y > 0 : cubeVelocity.y < 0)
          ) {
            setCubeVelocity((prev) => ({ ...prev, y: 0 }));
            setJumpsRemaining(MAX_JUMPS);
            setIsJumping(false);
            return {
              x: newX,
              y: onFloor
                ? gravityMode === "normal"
                  ? window.innerHeight - 150
                  : 0
                : platforms.find((p) => newX + 50 > p.x && newX < p.x + p.width)
                    ?.y || prev.y,
            };
          }

          return { x: newX, y: newY };
        });

        // Check if fallen
        if (
          (gravityMode === "normal" && cubePosition.y > window.innerHeight) ||
          (gravityMode === "reversed" && cubePosition.y < -50)
        ) {
          handleDeath();
        }

        // Update score
        setScore((prev) => prev + 1);
      }, 16);

      return () => clearInterval(gameLoop);
    }
  }, [
    gameState,
    platforms,
    cubePosition,
    cubeVelocity,
    score,
    highScore,
    gravityMode,
    handleDeath,
  ]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump, gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = setInterval(() => {
      setSpikes((prev) => {
        const newSpikes = prev
          .map((spike) => ({ ...spike, x: spike.x - speed }))
          .filter((spike) => spike.x > -50);

        // Check if there's enough space for a new spike
        const lastSpike = newSpikes[newSpikes.length - 1];
        const minDistance = 300; // Minimum distance between spikes
        const canAddSpike =
          !lastSpike || window.innerWidth - lastSpike.x > minDistance;

        if (Math.random() < 0.01 && canAddSpike) {
          newSpikes.push({
            id: Date.now(),
            x: window.innerWidth,
          });
        }

        const collision = newSpikes.some(
          (spike) => spike.x < 100 && spike.x > 50 && !isJumping
        );

        if (collision) {
          setGameState("gameOver");
          if (score > highScore) {
            setHighScore(score);
          }
          setCoins((prev) => prev + Math.floor(score / 10));
          clearInterval(gameLoop);
        }

        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore >= 5000) {
            setGameState("gameOver");
            if (newScore > highScore) {
              setHighScore(newScore);
            }
            setCoins((prev) => prev + Math.floor(newScore / 10) + 100);
            clearInterval(gameLoop);
          }
          return newScore;
        });

        if (score % 100 === 0) {
          setSpeed((prev) => Math.min(prev + 0.5, 15));
        }

        return newSpikes;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, isJumping, score, speed, highScore]);

  const startGame = () => {
    setSpikes([]);
    setScore(0);
    setGameState("playing");
    setSpeed(5);
  };

  const startPlatformer = () => {
    setPlatforms([
      {
        id: Date.now(),
        width: 200,
        x: window.innerWidth / 2,
        y: window.innerHeight - 150,
      },
    ]);
    setCubePosition({ x: 50, y: window.innerHeight - 200 });
    setCubeVelocity({ x: 0, y: 0 });
    setJumpsRemaining(MAX_JUMPS);
    setScore(0);
    setGameState("platformer");
  };

  const buySkin = (item: ShopItem) => {
    if (coins >= item.price && !ownedSkins.includes(item.id)) {
      setCoins((prev) => prev - item.price);
      setOwnedSkins((prev) => [...prev, item.id]);
    }
  };

  const renderShop = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4 text-4xl font-bold text-white">Cube Shop</h1>
        <div className="mb-8 text-xl text-white">Coins: {coins}</div>
        <div className="grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <div
                className={`mx-auto mb-2 size-16 ${item.color} ${
                  item.gradient || ""
                } rounded`}
              />
              <div className="mb-2 font-bold text-white">{item.name}</div>
              <div className="mb-2 text-gray-400">{item.price} coins</div>
              {ownedSkins.includes(item.id) ? (
                <button
                  className={`w-full rounded px-4 py-2 ${
                    selectedSkin === item.id
                      ? "bg-green-500"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                  onClick={() => setSelectedSkin(item.id)}
                >
                  {selectedSkin === item.id ? "Selected" : "Select"}
                </button>
              ) : (
                <button
                  disabled={coins < item.price}
                  className={`w-full rounded px-4 py-2 ${
                    coins >= item.price
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "cursor-not-allowed bg-gray-500"
                  } text-white transition-colors`}
                  onClick={() => buySkin(item)}
                >
                  Buy
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-8 rounded-full bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-600"
          onClick={() => setGameState("menu")}
        >
          Back to Menu
        </button>
      </motion.div>
    </div>
  );

  const renderMenu = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-6xl font-bold text-white">Cube Runner</h1>
        <div className="space-y-4">
          <button
            className="block w-64 rounded-full bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-600"
            onClick={startGame}
          >
            Play Runner
          </button>
          <button
            className="block w-64 rounded-full bg-green-500 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-green-600"
            onClick={startPlatformer}
          >
            Play Platformer
          </button>
          <button
            className="block w-64 rounded-full bg-purple-500 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-purple-600"
            onClick={() => setGameState("shop")}
          >
            Shop
          </button>
          <div className="text-xl text-white">High Score: {highScore}</div>
          <div className="text-xl text-white">Coins: {coins}</div>
          <div className="mt-8 text-sm text-gray-400">
            Press SPACE or click to jump
          </div>
        </div>
      </motion.div>
    </div>
  );

  const getCubeStyle = () => {
    const item = SHOP_ITEMS.find((i) => i.id === selectedSkin);
    return `${item?.color || "bg-blue-500"} ${item?.gradient || ""}`;
  };

  return (
    <div
      className="relative h-full w-full cursor-pointer overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800"
      onClick={jump}
    >
      {gameState === "menu" ? (
        renderMenu()
      ) : gameState === "shop" ? (
        renderShop()
      ) : (
        <>
          <div className="absolute left-4 top-4 text-2xl font-bold text-white">
            Score: {score}
          </div>
          <div className="absolute right-4 top-4 text-2xl font-bold text-white">
            Progress: {Math.floor(levelProgress)}%
          </div>
          {gameState === "platformer" ? (
            <>
              <motion.div
                className={`absolute size-[50px] ${getCubeStyle()} rounded`}
                style={{
                  left: cubePosition.x,
                  top: cubePosition.y,
                  transform: `rotate(${
                    gravityMode === "reversed" ? 180 : 0
                  }deg)`,
                }}
                animate={cubeControls}
              />
              {/* Floor */}
              <div
                className="absolute bottom-0 left-0 h-[100px] w-full bg-gradient-to-t from-gray-700 to-gray-600"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                }}
              />
              {/* Ceiling */}
              <div
                className="absolute left-0 top-0 h-[100px] w-full bg-gradient-to-b from-gray-700 to-gray-600"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                }}
              />
              {platforms.map((platform) => (
                <div key={platform.id}>
                  <div
                    className="absolute rounded bg-gray-600"
                    style={{
                      height: 20,
                      left: platform.x,
                      top: platform.y,
                      width: platform.width,
                    }}
                  />
                  {platform.hasSpike && (
                    <div
                      className="absolute size-[30px] bg-red-500"
                      style={{
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        left: platform.x + platform.width / 2 - 15,
                        top: platform.y - 30,
                        transform: `rotate(${
                          gravityMode === "reversed" ? 180 : 0
                        }deg)`,
                      }}
                    />
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <motion.div
                animate={cubeControls}
                className={`absolute bottom-0 left-[50px] size-[50px] ${getCubeStyle()} rounded`}
                initial={{ x: 0, y: 0 }}
              />
              {spikes.map((spike) => (
                <div
                  key={spike.id}
                  className="absolute bottom-0 h-[50px] w-[30px] bg-red-500"
                  style={{
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    left: spike.x,
                  }}
                />
              ))}
            </>
          )}
          {gameState === "gameOver" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <h2 className="mb-4 text-4xl font-bold text-white">
                  {score >= 5000 ? "Level Complete!" : "Game Over!"}
                </h2>
                <p className="mb-4 text-2xl text-white">Score: {score}</p>
                <p className="mb-4 text-xl text-white">
                  High Score: {highScore}
                </p>
                <p className="mb-4 text-xl text-white">
                  Progress: {Math.floor(levelProgress)}%
                </p>
                <p className="mb-4 text-xl text-white">
                  Coins Earned:{" "}
                  {Math.floor(score / 10) + (score >= 5000 ? 100 : 0)}
                </p>
                <button
                  className="rounded-full bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-600"
                  onClick={() => setGameState("menu")}
                >
                  Main Menu
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CubeRunner;
