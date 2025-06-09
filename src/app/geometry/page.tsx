"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

interface Obstacle {
  id: number;
  x: number;
  type: "spike" | "platform" | "saw";
  height?: number;
  width?: number;
  rotation?: number;
}

type GameState = "menu" | "playing" | "gameOver" | "shop";
type CubeSkin = "default" | "gold" | "rainbow" | "neon";

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

const GeometryDash: React.FC = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [speed, setSpeed] = useState(5);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState<CubeSkin>("default");
  const [ownedSkins, setOwnedSkins] = useState<CubeSkin[]>(["default"]);
  const [cubePosition, setCubePosition] = useState({
    x: 50,
    y: window.innerHeight - 100,
  });
  const [cubeVelocity, setCubeVelocity] = useState({ x: 0, y: 0 });
  const [gravity, setGravity] = useState(0.8);
  const [rotation, setRotation] = useState(0);
  const cubeControls = useAnimation();

  const jump = useCallback(() => {
    if (gameState === "playing") {
      setIsJumping(true);
      setCubeVelocity((prev) => ({ ...prev, y: -15 }));
      setRotation((prev) => (prev + 180) % 360);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === "Space") {
          jump();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [jump, gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      const gameLoop = setInterval(() => {
        // Apply gravity
        setCubeVelocity((prev) => ({ ...prev, y: prev.y + gravity }));

        // Update position
        setCubePosition((prev) => ({
          x: prev.x + speed,
          y: prev.y + cubeVelocity.y,
        }));

        // Check floor collision
        if (cubePosition.y >= window.innerHeight - 100) {
          setCubePosition((prev) => ({ ...prev, y: window.innerHeight - 100 }));
          setCubeVelocity((prev) => ({ ...prev, y: 0 }));
          setIsJumping(false);
        }

        // Check ceiling collision
        if (cubePosition.y <= 0) {
          setCubePosition((prev) => ({ ...prev, y: 0 }));
          setCubeVelocity((prev) => ({ ...prev, y: 0 }));
        }

        // Generate obstacles
        if (Math.random() < 0.02) {
          setObstacles((prev) => {
            const lastObstacle = prev[prev.length - 1];
            const minDistance = 300;
            const maxDistance = 600;
            const distance =
              Math.random() * (maxDistance - minDistance) + minDistance;

            const obstacleTypes: Obstacle["type"][] = [
              "spike",
              "platform",
              "saw",
            ];
            const type =
              obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

            const newObstacle: Obstacle = {
              height:
                type === "platform" ? Math.random() * 100 + 50 : undefined,
              id: Date.now(),
              rotation: type === "saw" ? 0 : undefined,
              type,
              width:
                type === "platform" ? Math.random() * 200 + 100 : undefined,
              x: lastObstacle ? lastObstacle.x + distance : window.innerWidth,
            };

            return [...prev, newObstacle].filter((o) => o.x > -100);
          });
        }

        // Update obstacles
        setObstacles((prev) =>
          prev.map((obstacle) => {
            if (obstacle.type === "saw") {
              return {
                ...obstacle,
                rotation: (obstacle.rotation || 0) + 5,
                x: obstacle.x - speed,
              };
            }
            return {
              ...obstacle,
              x: obstacle.x - speed,
            };
          })
        );

        // Check collisions
        const collision = obstacles.some((obstacle) => {
          const cubeRight = cubePosition.x + 50;
          const cubeLeft = cubePosition.x;
          const cubeTop = cubePosition.y;
          const cubeBottom = cubePosition.y + 50;
          const obstacleRight = obstacle.x + (obstacle.width || 30);
          const obstacleLeft = obstacle.x;
          const obstacleTop =
            obstacle.type === "platform"
              ? window.innerHeight - (obstacle.height || 0)
              : window.innerHeight - 50;
          const obstacleBottom = window.innerHeight;

          return (
            cubeRight > obstacleLeft &&
            cubeLeft < obstacleRight &&
            cubeBottom > obstacleTop &&
            cubeTop < obstacleBottom
          );
        });

        if (collision) {
          setGameState("gameOver");
          if (score > highScore) {
            setHighScore(score);
          }
          setCoins((prev) => prev + Math.floor(score / 10));
          clearInterval(gameLoop);
        }

        // Update score
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore % 100 === 0) {
            setSpeed((prev) => Math.min(prev + 0.5, 15));
          }
          return newScore;
        });
      }, 16);

      return () => clearInterval(gameLoop);
    }
  }, [
    gameState,
    cubePosition,
    cubeVelocity,
    obstacles,
    score,
    highScore,
    speed,
    gravity,
  ]);

  const startGame = () => {
    setObstacles([]);
    setScore(0);
    setGameState("playing");
    setSpeed(5);
    setCubePosition({ x: 50, y: window.innerHeight - 100 });
    setCubeVelocity({ x: 0, y: 0 });
    setRotation(0);
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
        <h1 className="mb-4 text-4xl font-bold text-white">
          Geometry Dash Shop
        </h1>
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
        <h1 className="mb-8 text-6xl font-bold text-white">Geometry Dash</h1>
        <div className="space-y-4">
          <button
            className="block w-64 rounded-full bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-600"
            onClick={startGame}
          >
            Play
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
          <motion.div
            className="absolute inset-0"
            style={{
              x: -cubePosition.x + 50,
            }}
          >
            <motion.div
              className={`absolute size-[50px] ${getCubeStyle()} rounded`}
              style={{
                left: cubePosition.x,
                top: cubePosition.y,
                transform: `rotate(${rotation}deg)`,
              }}
            />
            {/* Floor */}
            <div
              className="absolute bottom-0 left-0 h-[50px] w-full bg-gradient-to-t from-gray-700 to-gray-600"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              }}
            />
            {obstacles.map((obstacle) => (
              <div key={obstacle.id}>
                {obstacle.type === "spike" && (
                  <div
                    className="absolute bottom-0 h-[50px] w-[30px] bg-red-500"
                    style={{
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                      left: obstacle.x,
                    }}
                  />
                )}
                {obstacle.type === "platform" && (
                  <div
                    className="absolute rounded bg-gray-600"
                    style={{
                      bottom: 0,
                      height: obstacle.height,
                      left: obstacle.x,
                      width: obstacle.width,
                    }}
                  />
                )}
                {obstacle.type === "saw" && (
                  <div
                    className="absolute size-[50px] rounded-full bg-yellow-500"
                    style={{
                      bottom: 0,
                      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                      left: obstacle.x,
                      transform: `rotate(${obstacle.rotation}deg)`,
                    }}
                  />
                )}
              </div>
            ))}
          </motion.div>
          {gameState === "gameOver" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <h2 className="mb-4 text-4xl font-bold text-white">
                  Game Over!
                </h2>
                <p className="mb-4 text-2xl text-white">Score: {score}</p>
                <p className="mb-4 text-xl text-white">
                  High Score: {highScore}
                </p>
                <p className="mb-4 text-xl text-white">
                  Coins Earned: {Math.floor(score / 10)}
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

export default GeometryDash;
