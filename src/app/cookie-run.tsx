"use client";

import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

interface Position {
  x: number;
  y: number;
  velocity: number;
}

interface Obstacle {
  id: number;
  type: "jelly" | "barrier";
  position: Position;
}

const CookieRun: React.FC = () => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">(
    "menu"
  );
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState<Position>({
    x: 100,
    y: 0,
    velocity: 0,
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isJumping, setIsJumping] = useState(false);

  // Physics constants
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GROUND_LEVEL = 0;
  const GAME_SPEED = 5;

  // Handle jumping
  const handleJump = useCallback(() => {
    if (gameState !== "playing" || isJumping) return;

    setIsJumping(true);
    setPlayerPosition((prev) => ({
      ...prev,
      velocity: JUMP_FORCE,
    }));
  }, [gameState, isJumping]);

  // Update physics
  useEffect(() => {
    if (gameState !== "playing") return;

    const updatePhysics = () => {
      setPlayerPosition((prev) => {
        const newY = prev.y + prev.velocity;
        const newVelocity = prev.velocity + GRAVITY;

        // Check if landed
        if (newY >= GROUND_LEVEL) {
          setIsJumping(false);
          return {
            ...prev,
            y: GROUND_LEVEL,
            velocity: 0,
          };
        }

        return {
          ...prev,
          y: newY,
          velocity: newVelocity,
        };
      });
    };

    const physicsInterval = setInterval(updatePhysics, 16);
    return () => clearInterval(physicsInterval);
  }, [gameState]);

  // Spawn obstacles
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnObstacle = () => {
      if (Math.random() < 0.02) {
        const type = Math.random() < 0.7 ? "jelly" : "barrier";
        setObstacles((prev) => [
          ...prev,
          {
            id: Date.now(),
            type,
            position: {
              x: window.innerWidth,
              y: type === "jelly" ? Math.random() * 100 : GROUND_LEVEL,
              velocity: 0,
            },
          },
        ]);
      }
    };

    const moveObstacles = () => {
      setObstacles((prev) => {
        const newObstacles = prev
          .map((obstacle) => ({
            ...obstacle,
            position: {
              ...obstacle.position,
              x: obstacle.position.x - GAME_SPEED,
            },
          }))
          .filter((obstacle) => obstacle.position.x > -100);

        // Check collisions
        newObstacles.forEach((obstacle) => {
          const dx = playerPosition.x - obstacle.position.x;
          const dy = playerPosition.y - obstacle.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 40) {
            if (obstacle.type === "jelly") {
              setScore((s) => s + 10);
              obstacle.position.x = -200; // Remove collected jelly
            } else {
              setGameState("gameOver");
            }
          }
        });

        return newObstacles;
      });
    };

    const gameLoop = setInterval(() => {
      spawnObstacle();
      moveObstacles();
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, playerPosition]);

  // Handle keyboard controls
  useEffect(() => {
    if (gameState === "playing") {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === "Space") {
          handleJump();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [gameState, handleJump]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setPlayerPosition({ x: 100, y: 0, velocity: 0 });
    setObstacles([]);
    setIsJumping(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-sky-400 to-sky-600">
      {/* Game elements */}
      {gameState === "playing" && (
        <>
          {/* Player (Cookie) */}
          <motion.div
            className="absolute bottom-0 left-[100px] h-[60px] w-[60px]"
            style={{
              y: playerPosition.y,
              transition: "y 0.1s linear",
            }}
          >
            <div className="relative h-full w-full">
              {/* Cookie body */}
              <div className="absolute inset-0 rounded-full bg-amber-400 shadow-lg">
                {/* Cookie details */}
                <div className="absolute inset-2 rounded-full bg-amber-300" />
                <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-amber-600" />
                <div className="absolute right-1/4 top-1/4 h-2 w-2 rounded-full bg-amber-600" />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600" />
              </div>
            </div>
          </motion.div>

          {/* Obstacles */}
          {obstacles.map((obstacle) => (
            <motion.div
              key={obstacle.id}
              className={`absolute bottom-0 h-[40px] w-[40px] ${
                obstacle.type === "jelly" ? "bg-purple-400" : "bg-red-500"
              }`}
              style={{
                x: obstacle.position.x,
                y: obstacle.position.y,
                transition: "x 0.1s linear",
              }}
            >
              {obstacle.type === "jelly" ? (
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 rounded-full bg-purple-300" />
                  <div className="absolute inset-2 rounded-full bg-purple-200" />
                </div>
              ) : (
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 rounded-lg bg-red-600" />
                  <div className="absolute inset-1 rounded-lg bg-red-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Ground */}
          <div className="absolute bottom-0 h-[100px] w-full bg-gradient-to-t from-green-600 to-green-500">
            <div className="absolute inset-0 bg-[url('/grass-texture.png')] opacity-30" />
          </div>

          {/* Score */}
          <div className="absolute right-4 top-4 text-4xl font-bold text-white drop-shadow-lg">
            {score}
          </div>
        </>
      )}

      {/* Menu */}
      {gameState === "menu" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-8 text-6xl font-bold text-white drop-shadow-lg">
              Cookie Run
            </h1>
            <motion.button
              className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:from-amber-500 hover:to-amber-600"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Game
            </motion.button>
            <p className="mt-4 text-white">Press Space to Jump</p>
          </motion.div>
        </div>
      )}

      {/* Game Over */}
      {gameState === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-4xl font-bold text-white">Game Over!</h2>
            <p className="mb-8 text-2xl text-white">Score: {score}</p>
            <motion.button
              className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xl font-bold text-white shadow-lg transition-all hover:from-amber-500 hover:to-amber-600"
              onClick={() => setGameState("menu")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CookieRun;
