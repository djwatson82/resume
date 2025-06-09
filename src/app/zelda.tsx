"use client";

import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

type Direction = "up" | "down" | "left" | "right";
type GameState = "menu" | "playing" | "gameOver";

interface Position {
  x: number;
  y: number;
  angle: number;
  pitch: number;
  z: number;
  velocity: number;
}

interface Enemy {
  id: number;
  position: Position;
  health: number;
  type: "slime" | "bat";
  distance: number;
}

const ZeldaGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [playerPosition, setPlayerPosition] = useState<Position>({
    x: 400,
    y: 300,
    angle: 0,
    pitch: 0,
    z: 0,
    velocity: 0,
  });
  const [isAttacking, setIsAttacking] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [swordPosition, setSwordPosition] = useState<Position | null>(null);
  const [isMouseLocked, setIsMouseLocked] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  // Physics constants
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GROUND_LEVEL = 0;
  const MAX_JUMP_HEIGHT = 150;
  const JUMP_DECAY = 0.85;

  // Mouse movement handler with improved sensitivity and vertical look
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isMouseLocked || gameState !== "playing") return;

      const sensitivity = 0.15; // Reduced sensitivity for smoother movement
      const maxPitch = 80; // Maximum up/down look angle

      setPlayerPosition((prev) => {
        // Calculate new pitch with limits
        const newPitch = Math.max(
          -maxPitch,
          Math.min(maxPitch, prev.pitch - e.movementY * sensitivity)
        );

        return {
          ...prev,
          angle: (prev.angle + e.movementX * sensitivity) % 360,
          pitch: newPitch,
        };
      });
    },
    [isMouseLocked, gameState]
  );

  // Mouse lock handlers
  const handlePointerLockChange = useCallback(() => {
    setIsMouseLocked(document.pointerLockElement !== null);
  }, []);

  const requestPointerLock = useCallback(() => {
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
      gameContainer.requestPointerLock();
    }
  }, []);

  // Set up mouse controls
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
    };
  }, [handleMouseMove, handlePointerLockChange]);

  const movePlayer = useCallback(
    (direction: Direction) => {
      if (gameState !== "playing") return;

      const speed = 5;
      setPlayerPosition((prev) => {
        const newPos = { ...prev };
        const angle = prev.angle * (Math.PI / 180);

        switch (direction) {
          case "up":
            // Move forward in the direction the player is facing
            newPos.x += Math.sin(angle) * speed;
            newPos.y -= Math.cos(angle) * speed;
            break;
          case "down":
            // Move backward from the direction the player is facing
            newPos.x -= Math.sin(angle) * speed;
            newPos.y += Math.cos(angle) * speed;
            break;
          case "left":
            // Strafe left
            newPos.x -= Math.cos(angle) * speed;
            newPos.y -= Math.sin(angle) * speed;
            break;
          case "right":
            // Strafe right
            newPos.x += Math.cos(angle) * speed;
            newPos.y += Math.sin(angle) * speed;
            break;
        }
        return newPos;
      });
    },
    [gameState]
  );

  // Handle jumping
  const handleJump = useCallback(() => {
    if (gameState !== "playing" || isJumping) return;

    setIsJumping(true);
    setPlayerPosition((prev) => ({
      ...prev,
      velocity: JUMP_FORCE,
      // Keep x and y position the same when jumping
      x: prev.x,
      y: prev.y,
    }));
  }, [gameState, isJumping]);

  // Update physics
  useEffect(() => {
    if (gameState !== "playing") return;

    const updatePhysics = () => {
      setPlayerPosition((prev) => {
        const newZ = prev.z + prev.velocity;
        const newVelocity = prev.velocity + GRAVITY;

        // Apply jump decay when going up
        const finalVelocity =
          newVelocity < 0 ? newVelocity * JUMP_DECAY : newVelocity;

        // Check if landed
        if (newZ >= GROUND_LEVEL) {
          setIsJumping(false);
          return {
            ...prev,
            z: GROUND_LEVEL,
            velocity: 0,
            // Keep x and y position the same when landing
            x: prev.x,
            y: prev.y,
          };
        }

        // Check if reached max height
        if (newZ <= -MAX_JUMP_HEIGHT) {
          return {
            ...prev,
            z: -MAX_JUMP_HEIGHT,
            velocity: 0,
            // Keep x and y position the same at max height
            x: prev.x,
            y: prev.y,
          };
        }

        return {
          ...prev,
          z: newZ,
          velocity: finalVelocity,
          // Keep x and y position the same during jump
          x: prev.x,
          y: prev.y,
        };
      });
    };

    const physicsInterval = setInterval(updatePhysics, 16); // ~60fps
    return () => clearInterval(physicsInterval);
  }, [gameState]);

  // Update keyboard controls to include jump
  useEffect(() => {
    if (gameState === "playing") {
      const handleKeyPress = (e: KeyboardEvent) => {
        switch (e.key) {
          case "ArrowUp":
            movePlayer("up");
            break;
          case "ArrowDown":
            movePlayer("down");
            break;
          case "ArrowLeft":
            movePlayer("left");
            break;
          case "ArrowRight":
            movePlayer("right");
            break;
          case " ":
            if (!isAttacking) {
              handleJump();
            }
            break;
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [gameState, movePlayer, handleJump, isAttacking]);

  const attack = useCallback(() => {
    if (gameState !== "playing" || isAttacking) return;

    setIsAttacking(true);
    setSwordPosition({ ...playerPosition, angle: playerPosition.angle });

    setTimeout(() => {
      if (swordPosition) {
        setEnemies((prev) => {
          return prev
            .filter((enemy) => {
              const dx = playerPosition.x - enemy.position.x;
              const dy = playerPosition.y - enemy.position.y;
              const dz = enemy.position.y - playerPosition.y; // For vertical distance
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
              const angleDiff = Math.abs(
                ((angle - playerPosition.angle + 180) % 360) - 180
              );

              // Calculate vertical angle difference
              const verticalAngle = Math.atan2(dz, distance) * (180 / Math.PI);
              const verticalDiff = Math.abs(
                verticalAngle - playerPosition.pitch
              );

              // Only hit enemies in front of the player (within 60 degrees horizontally and 30 degrees vertically)
              if (distance <= 60 && angleDiff <= 30 && verticalDiff <= 30) {
                setScore((s) => s + 10);
                return false;
              }
              return true;
            })
            .map((enemy) => ({
              ...enemy,
              position: {
                ...enemy.position,
                angle: enemy.position.angle,
              },
            }));
        });
      }
      setSwordPosition(null);
      setIsAttacking(false);
    }, 400);
  }, [gameState, isAttacking, playerPosition, swordPosition]);

  useEffect(() => {
    if (gameState === "playing") {
      const spawnEnemy = () => {
        if (Math.random() < 0.02) {
          const side = Math.floor(Math.random() * 4);
          let position: Position;

          switch (side) {
            case 0: // top
              position = {
                x: Math.random() * window.innerWidth,
                y: -50,
                angle: 0,
                pitch: 0,
                z: 0,
                velocity: 0,
              };
              break;
            case 1: // right
              position = {
                x: window.innerWidth + 50,
                y: Math.random() * window.innerHeight,
                angle: 0,
                pitch: 0,
                z: 0,
                velocity: 0,
              };
              break;
            case 2: // bottom
              position = {
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                angle: 0,
                pitch: 0,
                z: 0,
                velocity: 0,
              };
              break;
            default: // left
              position = {
                x: -50,
                y: Math.random() * window.innerHeight,
                angle: 0,
                pitch: 0,
                z: 0,
                velocity: 0,
              };
          }

          setEnemies((prev) => [
            ...prev,
            {
              id: Date.now(),
              position,
              health: 1,
              type: Math.random() < 0.5 ? "slime" : "bat",
              distance: 0,
            },
          ]);
        }
      };

      const moveEnemies = () => {
        setEnemies((prev) =>
          prev.map((enemy) => {
            const dx = playerPosition.x - enemy.position.x;
            const dy = playerPosition.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = 2;

            // Calculate angle relative to player
            const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
            const angleDiff =
              ((angle - playerPosition.angle + 180) % 360) - 180;

            // Calculate vertical angle
            const verticalAngle =
              Math.atan2(enemy.position.y - playerPosition.y, distance) *
              (180 / Math.PI);
            const verticalDiff = verticalAngle - playerPosition.pitch;

            return {
              ...enemy,
              position: {
                x: enemy.position.x + (dx / distance) * speed,
                y: enemy.position.y + (dy / distance) * speed,
                angle: angleDiff,
                pitch: verticalDiff,
                z: enemy.position.z,
                velocity: enemy.position.velocity,
              },
              distance,
            };
          })
        );
      };

      const checkCollisions = () => {
        setEnemies((prev) => {
          const newEnemies = prev.filter((enemy) => {
            // Calculate the center points of both the player and enemy
            const playerCenter = {
              x: playerPosition.x + 25, // Half of player width (50px)
              y: playerPosition.y + 25, // Half of player height (50px)
              angle: playerPosition.angle,
            };
            const enemyCenter = {
              x: enemy.position.x + 15, // Half of enemy width (30px)
              y: enemy.position.y + 15, // Half of enemy height (30px)
              angle: enemy.position.angle,
            };

            // Calculate the distance between centers
            const distance = Math.sqrt(
              Math.pow(enemyCenter.x - playerCenter.x, 2) +
                Math.pow(enemyCenter.y - playerCenter.y, 2)
            );

            // Collision occurs if the distance is less than the sum of the radii
            // Using 20px for player radius (40px diameter) and 15px for enemy radius (30px diameter)
            if (distance < 35) {
              setPlayerHealth((h) => {
                const newHealth = h - 1;
                if (newHealth <= 0) {
                  setGameState("gameOver");
                }
                return newHealth;
              });
              return false;
            }
            return true;
          });
          return newEnemies;
        });
      };

      const gameLoop = setInterval(() => {
        spawnEnemy();
        moveEnemies();
        checkCollisions();
      }, 16);

      return () => clearInterval(gameLoop);
    }
  }, [gameState, playerPosition]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setPlayerPosition({
      x: 400,
      y: 300,
      angle: 0,
      pitch: 0,
      z: 0,
      velocity: 0,
    });
    setEnemies([]);
    setScore(0);
    setPlayerHealth(100);
    setIsJumping(false);
    requestPointerLock();
  }, []);

  const renderMenu = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-900 to-green-800">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-6xl font-bold text-white drop-shadow-lg">
          Legend of Zelda
        </h1>

        {/* Play Button Container */}
        <div className="relative mb-8">
          <motion.button
            className="group relative block w-64 cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-xl font-bold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700"
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ pointerEvents: "auto" }}
          >
            {/* Button shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
              }}
            />

            {/* Button content */}
            <div className="relative flex items-center justify-center">
              <span className="mr-2 text-lg">▶</span>
              <span>Play Game</span>
            </div>
          </motion.button>
        </div>

        {/* Instructions */}
        <motion.div
          className="space-y-2 text-sm text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p>Use mouse to look around</p>
          <p>Arrow keys to move</p>
          <p>Space to attack</p>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Decorative circles */}
        <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full border-2 border-green-500/20" />
        <div className="absolute right-1/4 top-1/3 h-24 w-24 rounded-full border-2 border-green-500/20" />
        <div className="absolute left-1/3 bottom-1/4 h-40 w-40 rounded-full border-2 border-green-500/20" />
      </motion.div>
    </div>
  );

  return (
    <div className="relative h-screen w-full overflow-hidden game-container">
      {/* First Person View */}
      <div className="absolute inset-0">
        {/* Sky with clouds */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600">
          {/* Clouds */}
          <div className="absolute left-1/4 top-1/4 h-[100px] w-[200px] animate-float rounded-full bg-white/30 blur-xl" />
          <div className="absolute right-1/4 top-1/3 h-[80px] w-[160px] animate-float-delayed rounded-full bg-white/30 blur-xl" />
          <div className="absolute left-1/3 top-1/2 h-[120px] w-[240px] animate-float-slow rounded-full bg-white/30 blur-xl" />
        </div>

        {/* Sun */}
        <div className="absolute right-[20%] top-[15%] h-[80px] w-[80px] rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 blur-sm" />

        {/* Ground with texture */}
        <div className="absolute bottom-0 h-1/2 w-full">
          {/* Ground base */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-600 to-green-800" />

          {/* Grass texture overlay */}
          <div className="absolute inset-0 bg-[url('/grass-texture.png')] opacity-30" />

          {/* Ground details */}
          <div className="absolute bottom-0 h-[100px] w-full bg-gradient-to-t from-green-700 to-transparent" />

          {/* Ground shadows */}
          <div className="absolute bottom-0 h-[50px] w-full bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Crosshair */}
        <div className="absolute left-1/2 top-1/2 h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute left-1/2 top-0 h-[2px] w-[2px] -translate-x-1/2 bg-white/80 blur-[0.5px]" />
          <div className="absolute left-1/2 bottom-0 h-[2px] w-[2px] -translate-x-1/2 bg-white/80 blur-[0.5px]" />
          <div className="absolute left-0 top-1/2 h-[2px] w-[2px] -translate-y-1/2 bg-white/80 blur-[0.5px]" />
          <div className="absolute right-0 top-1/2 h-[2px] w-[2px] -translate-y-1/2 bg-white/80 blur-[0.5px]" />
        </div>

        {/* Enemies in first person */}
        {enemies.map((enemy) => {
          // Only render enemies in front of the player (angle between -60 and 60 degrees)
          if (enemy.position.angle > 300 || enemy.position.angle < 60) {
            const size = Math.min(100, 1000 / enemy.distance); // Size based on distance
            const x = (enemy.position.angle - 30) * (window.innerWidth / 60); // Position based on angle
            const y = (enemy.position.pitch - 30) * (window.innerHeight / 60); // Position based on pitch

            return (
              <motion.div
                key={enemy.id}
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg ${
                  enemy.type === "slime"
                    ? "bg-gradient-to-b from-purple-600/90 to-purple-800/90"
                    : "bg-gradient-to-b from-red-600/90 to-red-800/90"
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
                  transform: `perspective(1000px) rotateX(${
                    Math.sin(enemy.distance * 0.1) * 10
                  }deg)`,
                }}
              >
                {/* Monster body texture */}
                <div className="absolute inset-0 bg-[url('/enemy-texture.png')] opacity-50" />

                {/* Monster highlights */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

                {/* Monster shadow */}
                <div className="absolute bottom-[-4px] left-1/2 h-[4px] w-[20px] -translate-x-1/2 rounded-full bg-black/30 blur-sm" />

                {/* Monster details */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Monster eyes */}
                <div className="absolute left-[25%] top-[30%] h-[15%] w-[15%] rounded-full bg-yellow-400">
                  <div className="absolute inset-1 rounded-full bg-black" />
                </div>
                <div className="absolute right-[25%] top-[30%] h-[15%] w-[15%] rounded-full bg-yellow-400">
                  <div className="absolute inset-1 rounded-full bg-black" />
                </div>

                {/* Monster mouth */}
                <div className="absolute bottom-[25%] left-1/2 h-[20%] w-[40%] -translate-x-1/2 rounded-b-lg border-2 border-black/50">
                  {/* Teeth */}
                  <div className="absolute inset-x-0 top-0 flex justify-between px-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[8px] w-[4px] bg-white"
                        style={{
                          transform: `rotate(${
                            i % 2 === 0 ? "45deg" : "-45deg"
                          })`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Monster spikes/horns */}
                {enemy.type === "bat" && (
                  <>
                    <div className="absolute left-[20%] top-0 h-[15%] w-[10%] -translate-x-1/2 rotate-[-30deg] transform bg-red-800" />
                    <div className="absolute right-[20%] top-0 h-[15%] w-[10%] translate-x-1/2 rotate-[30deg] transform bg-red-800" />
                  </>
                )}

                {/* Slime tentacles */}
                {enemy.type === "slime" && (
                  <>
                    <div className="absolute bottom-0 left-[20%] h-[20%] w-[10%] animate-pulse rounded-b-full bg-purple-400/50" />
                    <div className="absolute bottom-0 right-[20%] h-[20%] w-[10%] animate-pulse rounded-b-full bg-purple-400/50" />
                  </>
                )}
              </motion.div>
            );
          }
          return null;
        })}

        {/* Sword Attack Effect */}
        {isAttacking && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-[100px] w-[4px] -translate-x-1/2 -translate-y-1/2"
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 45, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-full w-full bg-gradient-to-r from-gray-200 to-gray-400">
              {/* Sword glow */}
              <div className="absolute inset-0 bg-white/30 blur-sm" />
              {/* Sword details */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* HUD */}
        <div className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
          Score: {score}
        </div>
        <div className="absolute bottom-4 right-4 text-2xl font-bold text-white drop-shadow-lg">
          Health: {playerHealth}/100
        </div>

        {/* Health Bar */}
        <div className="absolute bottom-8 left-1/2 h-[4px] w-[200px] -translate-x-1/2 overflow-hidden rounded-full bg-gray-800/50 backdrop-blur-sm">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
            initial={{ width: "100%" }}
            animate={{ width: `${playerHealth}%` }}
            transition={{ duration: 0.2 }}
          >
            {/* Health bar glow */}
            <div className="absolute inset-0 bg-white/20 blur-sm" />
          </motion.div>
        </div>

        {/* Ambient particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white/30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Mouse control instructions */}
        {gameState === "playing" && !isMouseLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4 text-xl">Click to enable mouse controls</p>
              <p className="text-sm">
                Use arrow keys to move, mouse to look around, and space to
                attack
              </p>
            </motion.div>
          </div>
        )}

        {/* Player position indicator */}
        <div
          className="absolute bottom-4 left-1/2 h-[2px] w-[100px] -translate-x-1/2 bg-white/50"
          style={{
            transform: `translateX(-50%) translateY(${playerPosition.z}px)`,
            transition: "transform 0.1s linear",
          }}
        />
      </div>

      {gameState === "menu" && renderMenu()}
      {gameState === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
              Game Over!
            </h2>
            <p className="mb-4 text-2xl text-white drop-shadow-lg">
              Score: {score}
            </p>
            <motion.button
              className="rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-xl font-bold text-white transition-all hover:from-green-600 hover:to-green-700 hover:shadow-lg"
              onClick={() => setGameState("menu")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Main Menu
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ZeldaGame;
