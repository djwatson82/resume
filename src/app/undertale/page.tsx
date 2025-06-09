"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./undertale.module.css";

const dialogues = [
  "Welcome to the Underground...",
  "How was the fall?",
  "If you want to look around, give us a call.",
  "We don't see many humans around here.",
  "I'm FLOWEY. FLOWEY the FLOWER.",
  "You're new to the UNDERGROUND, aren'tcha?",
  "Golly, you must be so confused.",
  "Someone ought to teach you how things work around here!",
  "I guess little old me will have to do.",
  "Ready? Here we go!",
];

const battleDialogues = {
  start: "* A wild Flowey appears!",
  check:
    "* Flowey - ATK 0 DEF 0\n* The flower that just wants to be your friend.",
  talk: "* You try to talk to Flowey.\n* It doesn't seem to understand.",
  flirt: "* You flirt with Flowey.\n* It blushes and looks away.",
  spare: "* You spared Flowey.",
  flee: "* You got away safely!",
};

type GameState = "intro" | "battle" | "overworld";
type BattleState = "dialogue" | "fight" | "act" | "item" | "mercy";
type BattleAction = "check" | "talk" | "flirt" | "spare" | "flee";

export default function UndertalePage() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [battleState, setBattleState] = useState<BattleState>("dialogue");
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [text, setText] = useState("");
  const [showHeart, setShowHeart] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [playerHP, setPlayerHP] = useState(20);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [showBattleBox, setShowBattleBox] = useState(false);
  const [battleText, setBattleText] = useState(battleDialogues.start);
  const [selectedAction, setSelectedAction] = useState<BattleAction | null>(
    null
  );
  const [isMoving, setIsMoving] = useState(false);
  const [battleTurn, setBattleTurn] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState === "intro") {
        if (event.key.toLowerCase() === "z" && !isTyping) {
          if (currentDialogue < dialogues.length - 1) {
            setCurrentDialogue((prev) => prev + 1);
            setText("");
            setShowHeart(false);
            setIsTyping(true);
          } else {
            setGameState("overworld");
          }
        } else if (event.key.toLowerCase() === "x" && isTyping) {
          setText(dialogues[currentDialogue]);
          setIsTyping(false);
          setShowHeart(true);
        }
      } else if (gameState === "overworld") {
        const speed = 5;
        if (!isMoving) {
          switch (event.key.toLowerCase()) {
            case "arrowup":
              setIsMoving(true);
              setPlayerPosition((prev) => ({
                ...prev,
                y: Math.max(prev.y - speed, 0),
              }));
              break;
            case "arrowdown":
              setIsMoving(true);
              setPlayerPosition((prev) => ({
                ...prev,
                y: Math.min(prev.y + speed, 400),
              }));
              break;
            case "arrowleft":
              setIsMoving(true);
              setPlayerPosition((prev) => ({
                ...prev,
                x: Math.max(prev.x - speed, 0),
              }));
              break;
            case "arrowright":
              setIsMoving(true);
              setPlayerPosition((prev) => ({
                ...prev,
                x: Math.min(prev.x + speed, 400),
              }));
              break;
            case "z":
              if (Math.random() < 0.1) {
                setGameState("battle");
                setBattleState("dialogue");
                setShowBattleBox(true);
                setPlayerHP(20);
                setBattleTurn(0);
                setBattleText(battleDialogues.start);
              }
              break;
          }
        }
      } else if (gameState === "battle") {
        switch (event.key.toLowerCase()) {
          case "z":
            if (battleState === "dialogue") {
              setBattleState("fight");
            } else if (battleState === "fight") {
              setPlayerHP((prev) => Math.max(0, prev - 5));
              setBattleTurn((prev) => prev + 1);
              if (playerHP <= 5) {
                setGameState("overworld");
                setShowBattleBox(false);
              }
            } else if (selectedAction) {
              setBattleText(battleDialogues[selectedAction]);
              if (selectedAction === "spare" || selectedAction === "flee") {
                setTimeout(() => {
                  setGameState("overworld");
                  setShowBattleBox(false);
                }, 1000);
              }
              setSelectedAction(null);
            }
            break;
          case "x":
            if (battleState === "fight") {
              setBattleState("act");
            }
            break;
          case "c":
            if (battleState === "act") {
              setBattleState("item");
            }
            break;
          case "v":
            if (battleState === "item") {
              setBattleState("mercy");
            }
            break;
          case "escape":
            setGameState("overworld");
            setShowBattleBox(false);
            break;
        }
      }
    };

    const handleKeyUp = () => {
      setIsMoving(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    gameState,
    battleState,
    currentDialogue,
    isTyping,
    playerHP,
    selectedAction,
    isMoving,
  ]);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < dialogues[currentDialogue].length) {
        setText(dialogues[currentDialogue].slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setShowHeart(true);
        setIsTyping(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentDialogue, isTyping]);

  const handleBattleAction = (action: BattleAction) => {
    setSelectedAction(action);
    setBattleText(battleDialogues[action]);
  };

  return (
    <div className={styles.container}>
      {gameState === "intro" && (
        <div className={styles.dialogBox}>
          <p className={styles.text}>{text}</p>
          {showHeart && <div className={styles.heart} />}
          {!isTyping && currentDialogue < dialogues.length - 1 && (
            <p className={styles.prompt}>Press Z to continue</p>
          )}
          {isTyping && <p className={styles.prompt}>Press X to skip</p>}
        </div>
      )}

      {gameState === "overworld" && (
        <div className={styles.gameArea} ref={gameAreaRef}>
          <div
            className={styles.player}
            style={{
              transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`,
            }}
          />
          <div className={styles.hpDisplay}>HP: {playerHP}/20</div>
        </div>
      )}

      {gameState === "battle" && showBattleBox && (
        <div className={styles.battleScreen}>
          <div className={styles.battleBox}>
            <div className={styles.battleMenu}>
              <p className={styles.battleText}>{battleText}</p>
              {battleState === "fight" && (
                <div className={styles.battleOptions}>
                  <p>FIGHT</p>
                  <p>ACT</p>
                  <p>ITEM</p>
                  <p>MERCY</p>
                </div>
              )}
              {battleState === "act" && (
                <div className={styles.actOptions}>
                  <p onClick={() => handleBattleAction("check")}>Check</p>
                  <p onClick={() => handleBattleAction("talk")}>Talk</p>
                  <p onClick={() => handleBattleAction("flirt")}>Flirt</p>
                </div>
              )}
              {battleState === "item" && (
                <div className={styles.itemOptions}>
                  <p>Monster Candy</p>
                  <p>Spider Donut</p>
                </div>
              )}
              {battleState === "mercy" && (
                <div className={styles.mercyOptions}>
                  <p onClick={() => handleBattleAction("spare")}>Spare</p>
                  <p onClick={() => handleBattleAction("flee")}>Flee</p>
                </div>
              )}
            </div>
            <div className={styles.battleHeart} />
            <div className={styles.hpDisplay}>HP: {playerHP}/20</div>
            <div className={styles.turnCounter}>Turn: {battleTurn}</div>
          </div>
        </div>
      )}
    </div>
  );
}
