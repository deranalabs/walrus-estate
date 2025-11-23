"use client";

import React, { useState, useEffect } from "react";
import {
  NodeData,
  GameState,
  LogEntry,
  OwnerType,
} from "../../lib/types";
import {
  INITIAL_NODES,
  BOARD_SIZE,
  START_BONUS,
  INITIAL_BALANCE,
  PLAYER_AVATAR_URL,
  AI_AVATAR_URL,
} from "../../lib/constants";
import { NodeTile } from "../components/NodeTile";
import { GameLog } from "../components/GameLog";
import {
  Dices,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  WALRUS_PACKAGE_ID,
  GAMESTATE_ID,
  GAMESTATE_INITIAL_VERSION,
} from "../config/onchain";

export default function GamePage() {
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [gameState, setGameState] = useState<GameState>({
    position: 0,
    balance: INITIAL_BALANCE,
    netWorth: INITIAL_BALANCE,
    turn: 1,
    isMoving: false,
    gameOver: false,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  const [isRollPending, setIsRollPending] = useState(false);
  const [aiPosition, setAiPosition] = useState(0);
  const [aiBalance, setAiBalance] = useState(INITIAL_BALANCE);
  const [aiNetWorth, setAiNetWorth] = useState(INITIAL_BALANCE);
  const [aiLastRoll, setAiLastRoll] = useState<number | null>(null);
  const [hasOnChainBoughtNode1, setHasOnChainBoughtNode1] = useState(false);
  const [gameResult, setGameResult] = useState<
    "PLAYER_WIN" | "AI_WIN" | "DRAW" | null
  >(null);

  const account = useCurrentAccount();
  const isWalletConnected = !!account;
  const shortAddress = account?.address
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : null;

  const { mutateAsync: signAndExecuteTx } = useSignAndExecuteTransaction();

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev: LogEntry[]) => [
      ...prev,
      {
        id: Math.random().toString(36),
        message,
        type,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleBuyNodeOnChain = async (): Promise<boolean> => {
    const currentNode = nodes[gameState.position];

    // Only send an on-chain transaction once for the demo node #1.
    if (hasOnChainBoughtNode1) {
      addLog(
        'On-chain buy demo for node #1 "Cache Node Alpha" already completed. Further buys are local-only.',
        "info",
      );
      return false;
    }
    if (!account) {
      addLog("Connect your Sui wallet before buying a node.", "warning");
      return false;
    }
    if (!currentNode || currentNode.id === 0) {
      addLog("Stand on a non-start node to buy.", "warning");
      return false;
    }

    // DEMO: only support on-chain buy for node #1 (Cache Node Alpha).
    if (currentNode.id !== 1) {
      addLog(
        'On-chain buy demo only supports node #1 "Cache Node Alpha". Other nodes are local-only.',
        "warning",
      );
      return true; // allow local-only buy for other nodes
    }

    try {
      addLog(
        'Buying node #1 "Cache Node Alpha" on-chain... waiting for wallet approval.',
        "info",
      );

      const tx = new Transaction();

      // On-chain price must match the Move contract: 10_000_000 MIST.
      const onChainPrice = 10_000_000;

      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(onChainPrice)]);

      tx.moveCall({
        target: `${WALRUS_PACKAGE_ID}::game::buy_node`,
        arguments: [
          tx.sharedObjectRef({
            objectId: GAMESTATE_ID,
            initialSharedVersion: GAMESTATE_INITIAL_VERSION,
            mutable: true,
          }),
          tx.pure.u8(currentNode.id), // in this demo it will always be 1
          paymentCoin,
        ],
      });

      const res = await signAndExecuteTx({
        transaction: tx,
        chain: "sui:testnet",
      });

      addLog(
        `On-chain buy_node(#${currentNode.id}) confirmed. Digest: ${res.digest}`,
        "success",
      );
      setHasOnChainBoughtNode1(true);
      return true;
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? String(e);

      // If we see MoveAbort code 1, node #1 is already owned in the on-chain GameState.
      // Treat this as "demo has already been run" and avoid spamming errors.
      if (msg.includes("MoveAbort") && msg.includes(", 1")) {
        addLog(
          'On-chain buy demo for node #1 "Cache Node Alpha" already completed on-chain (node already owned). Further buys are local-only.',
          "info",
        );
        setHasOnChainBoughtNode1(true);
      } else {
        addLog(`On-chain buy_node failed: ${msg}`, "danger");
      }
      return false;
    }
  };

  useEffect(() => {
    addLog(
      "Welcome to Walrus Estate. Connect to the Decentralized Network.",
      "info",
    );
  }, []);

  useEffect(() => {
    if (account?.address) {
      addLog(`Wallet connected: ${account.address}`, "success");
    }
  }, [account?.address]);

  useEffect(() => {
    if (gameState.gameOver || gameResult) {
      return;
    }

    const playerNodesOwned = nodes.filter(
      (n) => n.owner === OwnerType.PLAYER,
    ).length;
    const aiNodesOwned = nodes.filter((n) => n.owner === OwnerType.AI).length;

    // 1) Bankruptcy rules.
    if (gameState.balance <= 0) {
      setGameState((prev: GameState) => ({ ...prev, gameOver: true }));
      setGameResult("AI_WIN");
      addLog(
        "Game over: You ran out of SUI credits. The Walrus network AI controls the estates.",
        "danger",
      );
      return;
    }

    if (aiBalance <= 0) {
      setGameState((prev: GameState) => ({ ...prev, gameOver: true }));
      setGameResult("PLAYER_WIN");
      addLog(
        "Victory: The Walrus network AI ran out of credits. You survived longer.",
        "success",
      );
      return;
    }

    // 2) Board domination rules (majority of nodes).
    const DOMINATION_THRESHOLD = 8; // Half of the 16 nodes.

    if (playerNodesOwned >= DOMINATION_THRESHOLD) {
      setGameState((prev: GameState) => ({ ...prev, gameOver: true }));
      setGameResult("PLAYER_WIN");
      addLog(
        "Victory: You control the majority of Walrus data estates.",
        "success",
      );
      return;
    }

    if (aiNodesOwned >= DOMINATION_THRESHOLD) {
      setGameState((prev: GameState) => ({ ...prev, gameOver: true }));
      setGameResult("AI_WIN");
      addLog(
        "Game over: The Walrus network AI controls the majority of estates.",
        "danger",
      );
      return;
    }

    // 3) Overtime rule: when both sides control 7 nodes for too long, resolve the game by net worth.
    const OVERTIME_TURN_THRESHOLD = 20;
    if (
      playerNodesOwned === 7 &&
      aiNodesOwned === 7 &&
      gameState.turn >= OVERTIME_TURN_THRESHOLD
    ) {
      setGameState((prev: GameState) => ({ ...prev, gameOver: true }));

      if (gameState.netWorth > aiNetWorth) {
        setGameResult("PLAYER_WIN");
        addLog(
          "Overtime victory: Both sides controlled 7 estates, but your net worth was higher.",
          "success",
        );
      } else if (gameState.netWorth < aiNetWorth) {
        setGameResult("AI_WIN");
        addLog(
          "Overtime game over: Both sides controlled 7 estates, but the Walrus network AI had higher net worth.",
          "danger",
        );
      } else {
        setGameResult("DRAW");
        addLog(
          "Overtime draw: Both sides controlled 7 estates with equal net worth.",
          "info",
        );
      }
    }
  }, [
    aiBalance,
    aiNetWorth,
    gameResult,
    gameState.balance,
    gameState.gameOver,
    gameState.netWorth,
    gameState.turn,
    nodes,
  ]);

  const handleTileInteraction = (position: number) => {
    const node = nodes[position];

    if (node.id === 0) return;

    if (node.owner === OwnerType.AI) {
      const rentCost = node.rent;
      setGameState((prev: GameState) => ({
        ...prev,
        balance: prev.balance - rentCost,
        netWorth: prev.netWorth - rentCost,
      }));
      setAiBalance((prev) => prev + rentCost);
      setAiNetWorth((prev) => prev + rentCost);
      addLog(
        `Landed on AI Node "${node.name}". Paid rent: $${rentCost}.`,
        "danger",
      );
    } else if (node.owner === OwnerType.PLAYER) {
      addLog(
        `Welcome back to "${node.name}". Secure connection established.`,
        "success",
      );
    } else {
      addLog(
        `Discovered unowned node "${node.name}". Available for $${node.price}.`,
        "info",
      );
    }
  };

  const runAiTurn = async (): Promise<number> => {
    if (gameState.gameOver) return 0;

    const roll = Math.floor(Math.random() * 6) + 1;
    addLog(`Walrus network AI rolled a ${roll}...`, "info");
    setAiLastRoll(roll);

    let currentPos = aiPosition;
    let balance = aiBalance;
    let netWorth = aiNetWorth;

    for (let i = 1; i <= roll; i++) {
      await new Promise((resolve) => setTimeout(resolve, 150));

      currentPos = currentPos + 1;

      if (currentPos >= BOARD_SIZE) {
        currentPos = 0;
        balance = balance + START_BONUS;
        addLog(
          `AI passed Start and collected +$${START_BONUS} Credits.`,
          "info",
        );
      }

      // Update AI position step by step so its movement is visible on the board.
      setAiPosition(currentPos);
    }

    const node = nodes[currentPos];

    if (node.id === 0) {
      setAiBalance(balance);
      setAiNetWorth(netWorth);
      return roll;
    }

    if (node.owner === OwnerType.PLAYER) {
      const rent = node.rent;
      balance = balance - rent;
      netWorth = netWorth - rent;
      setGameState((prev: GameState) => ({
        ...prev,
        balance: prev.balance + rent,
        netWorth: prev.netWorth + rent,
      }));
      addLog(
        `AI landed on your node "${node.name}" and paid you $${rent}.`,
        "success",
      );
    } else if (node.owner === OwnerType.AI) {
      addLog(`AI visited its own node "${node.name}".`, "info");
    } else {
      const playerOnThisNode = gameState.position === node.id;

      addLog(
        `AI discovered unowned node "${node.name}". Available for $${node.price}.`,
        "info",
      );

      if (playerOnThisNode) {
        addLog(
          `You were here first on "${node.name}". Walrus AI waits and gives you priority to buy.`,
          "success",
        );
      } else if (balance >= node.price) {
        balance = balance - node.price;
        addLog(`AI acquired "${node.name}".`, "danger");
        setNodes((prevNodes) => {
          const updated = [...prevNodes];
          const index = updated.findIndex((n) => n.id === node.id);
          if (index !== -1 && updated[index].owner === OwnerType.NONE) {
            updated[index] = { ...updated[index], owner: OwnerType.AI };
          }
          return updated;
        });
      }
    }

    setAiBalance(balance);
    setAiNetWorth(netWorth);

    return roll;
  };

  const movePlayer = async (steps: number) => {
    if (gameState.gameOver) return;
    setGameState((prev: GameState) => ({ ...prev, isMoving: true }));
    let currentPos = gameState.position;

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      currentPos = currentPos + 1;

      if (currentPos >= BOARD_SIZE) {
        currentPos = 0;
        setGameState((prev: GameState) => ({
          ...prev,
          balance: prev.balance + START_BONUS,
        }));
        addLog(
          `Passed Start! Collected +$${START_BONUS} Credits.`,
          "success",
        );
      }

      setGameState((prev: GameState) => ({
        ...prev,
        position: currentPos,
      }));
    }

    handleTileInteraction(currentPos);
    const rolledSix = steps === 6;

    if (rolledSix) {
      // Player gets an extra turn; the AI waits.
      const currentNode = nodes[currentPos];
      addLog(
        `You rolled a 6 on "${currentNode.name}". Extra turn granted; Walrus AI will wait.`,
        "success",
      );
    } else {
      // Add a short delay so the player's movement finishes before the AI moves.
      await new Promise((resolve) => setTimeout(resolve, 300));

      // The AI also receives an extra turn whenever it rolls a 6.
      // Repeat until the AI no longer rolls a 6 or the game is over.
      while (!gameState.gameOver) {
        const aiRoll = await runAiTurn();
        if (aiRoll !== 6) break;

        addLog(
          "Walrus network AI rolled a 6 and takes an extra turn.",
          "info",
        );
      }
    }
    setGameState((prev: GameState) => ({ ...prev, isMoving: false }));
  };

  const handleRollDiceOnChain = async (roll: number) => {
    if (!account) {
      addLog("Connect your Sui wallet before rolling.", "warning");
      throw new Error("Wallet not connected");
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${WALRUS_PACKAGE_ID}::game::log_roll`,
        arguments: [
          tx.sharedObjectRef({
            objectId: GAMESTATE_ID,
            initialSharedVersion: GAMESTATE_INITIAL_VERSION,
            mutable: true,
          }),
          tx.pure.u8(roll),
        ],
      });

      const res = await signAndExecuteTx({
        transaction: tx,
        chain: "sui:testnet",
      });

      addLog(
        `On-chain roll(${roll}) confirmed. Digest: ${res.digest}`,
        "success",
      );
    } catch (e: any) {
      console.error(e);
      addLog(
        `On-chain roll failed: ${e?.message ?? String(e)}`,
        "danger",
      );
      throw e;
    }
  };

  const handleRollDice = async () => {
    if (
      gameState.isMoving ||
      !isWalletConnected ||
      isRollPending ||
      gameState.gameOver
    )
      return;

    const roll = Math.floor(Math.random() * 6) + 1;
    // Hide the dice value until the on-chain transaction succeeds.
    setDiceResult(null);
    addLog("Rolling dice... waiting for wallet approval.", "info");

    setIsRollPending(true);
    try {
      await handleRollDiceOnChain(roll);

      setGameState((prev: GameState) => ({
        ...prev,
        turn: prev.turn + 1,
      }));
      setDiceResult(roll);
      addLog(`Roll result: ${roll}.`, "success");
      await movePlayer(roll);
    } catch {
      // If the transaction fails, do not move the player.
      setDiceResult(null);
    } finally {
      setIsRollPending(false);
    }
  };

  const handleBuyNode = () => {
    const currentNode = nodes[gameState.position];

    if (currentNode.owner !== OwnerType.NONE) return;
    if (gameState.balance < currentNode.price) {
      addLog(`Insufficient funds to buy ${currentNode.name}.`, "warning");
      return;
    }

    setGameState((prev: GameState) => ({
      ...prev,
      balance: prev.balance - currentNode.price,
    }));

    const updatedNodes = [...nodes];
    updatedNodes[gameState.position] = {
      ...currentNode,
      owner: OwnerType.PLAYER,
    };
    setNodes(updatedNodes);

    addLog(`Successfully acquired "${currentNode.name}"!`, "success");
  };

  const handleRestart = () => {
    // Reset the full game state back to the initial configuration.
    setNodes(INITIAL_NODES);
    setGameState({
      position: 0,
      balance: INITIAL_BALANCE,
      netWorth: INITIAL_BALANCE,
      turn: 1,
      isMoving: false,
      gameOver: false,
    });
    setAiPosition(0);
    setAiBalance(INITIAL_BALANCE);
    setAiNetWorth(INITIAL_BALANCE);
    setGameResult(null);
    setDiceResult(null);
    setLogs([]);
    addLog("New game started against the Walrus network AI.", "info");
  };

  const handleBuyNodeClick = async () => {
    const currentNode = nodes[gameState.position];

    // For demo: if standing on node #1, wait for on-chain confirmation first.
    if (currentNode.id === 1) {
      const ok = await handleBuyNodeOnChain();
      if (!ok) return;
      handleBuyNode();
      return;
    }

    // Other nodes are local-only.
    handleBuyNode();
  };

  const currentNode = nodes[gameState.position];
  const aiCurrentNode = nodes[aiPosition];
  const canBuy =
    isWalletConnected &&
    currentNode.owner === OwnerType.NONE &&
    currentNode.id !== 0 &&
    !gameState.isMoving &&
    !gameState.gameOver;

  return (
    <main className="min-h-screen bg-walrus-dark text-slate-200 px-4 py-6 lg:px-10 lg:py-10">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* LEFT: BOARD */}
        <div className="flex-1 w-full">
        <div className="mb-4 lg:mb-6 flex items-center justify-between">
          <h1 className="text-xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-walrus-accent to-walrus-secondary tracking-wider">
            WALRUS ESTATE
          </h1>
          <div className="bg-slate-900/70 px-3 py-1 rounded border border-slate-700 text-[11px] text-slate-300 font-mono flex items-center gap-2">
            <span className="text-[10px] uppercase text-slate-500">Turn</span>
            <span>#{gameState.turn}</span>
            <span className="mx-1 text-slate-600">·</span>
            <span className="text-[10px] uppercase text-slate-500">Epoch</span>
            <span>#{Math.floor(gameState.turn / 5) + 1}</span>
          </div>
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 transition-all duration-300 ${
            !isWalletConnected
              ? "opacity-40 filter grayscale pointer-events-none"
              : ""
          }`}
        >
          {nodes.map((node) => (
            <NodeTile
              key={node.id}
              data={node}
              isPlayerHere={gameState.position === node.id}
              isAiHere={aiPosition === node.id}
            />
          ))}
        </div>

        <div className="mt-4 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 flex flex-col gap-3 text-xs text-slate-300 font-mono">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-300/80 shadow-[0_0_12px_rgba(56,189,248,0.7)] bg-slate-900/80">
                <img
                  src={PLAYER_AVATAR_URL}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500">
                  Your Position
                </span>
                <span>
                  #{currentNode.id} · {currentNode.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              {currentNode.id === 0 ? (
                <span className="text-[11px] text-slate-500">
                  Start tile · gain bonus when you pass.
                </span>
              ) : currentNode.owner === OwnerType.PLAYER ? (
                <span className="text-[11px] text-green-400">
                  You own this node.
                </span>
              ) : currentNode.owner === OwnerType.AI ? (
                <span className="text-[11px] text-red-400">
                  AI-owned node · landing here pays rent ${currentNode.rent}.
                </span>
              ) : (
                <span className="text-[11px] text-walrus-accent">
                  Unowned node · price ${currentNode.price}.
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-red-300/80 shadow-[0_0_12px_rgba(248,113,113,0.7)] bg-slate-900/80">
                <img
                  src={AI_AVATAR_URL}
                  alt="Walrus AI"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                  <span>AI Position</span>
                  {aiLastRoll !== null && (
                    <span className="text-[11px]">
                      {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][aiLastRoll]}
                    </span>
                  )}
                </span>
                <span>
                  #{aiCurrentNode.id} · {aiCurrentNode.name}
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              {aiLastRoll !== null ? (
                <span>
                  Last roll: {aiLastRoll} · Walrus AI moves after each of your
                  turns.
                </span>
              ) : (
                <span>Walrus AI will roll after your first turn.</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between gap-4">
          <span>Win: own &gt;= 8 nodes or outlast the Walrus network AI.</span>
          <span>Lose: credits reach 0 or AI owns &gt;= 8 nodes.</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-600 font-mono flex gap-4">
          <span>P = You</span>
          <span>Bot = Walrus network AI</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-mono flex flex-col gap-0.5">
          <span>
            Data Estate: each tile is backed by a Walrus blob on Sui testnet.
          </span>
          <span className="truncate">
            Current estate blob:
            {" "}
            <a
              href={currentNode.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-walrus-accent hover:underline underline-offset-2"
            >
              {currentNode.imageUrl}
            </a>
          </span>
        </div>
      </div>

      {/* RIGHT: PANEL */}
      <div className="w-full lg:w-96 flex flex-col gap-3 lg:gap-4">
        {/* Wallet */}
        <div className="bg-walrus-card p-4 lg:p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
              <Wallet size={16} /> Wallet Status
            </h2>
            <div className="scale-90 lg:scale-100 origin-right">
              <ConnectButton />
            </div>
          </div>

          <div className="space-y-4">
            {/* Connection line */}
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>
                {isWalletConnected
                  ? `Connected: ${shortAddress}`
                  : "Not connected"}
              </span>
              <span className="text-[10px] uppercase text-slate-500">
                Network: Testnet
              </span>
            </div>

            {/* Main balance highlight */}
            <div className="flex justify-between items-end pb-2 border-b border-slate-700">
              <span className="text-xs lg:text-sm text-slate-400">SUI Credits</span>
              <span className="text-xl lg:text-2xl font-mono font-bold text-walrus-accent">
                ${gameState.balance}
              </span>
            </div>

            {/* Secondary stats in a compact grid */}
            <div className="grid grid-cols-2 gap-3 text-[11px] lg:text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-2">
                  <TrendingUp size={14} /> Net Worth
                </span>
                <span className="block text-sm lg:text-base font-mono text-slate-200">
                  ${gameState.netWorth}
                </span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-slate-400">AI Credits</span>
                <span className="block text-sm lg:text-base font-mono text-red-300">
                  ${aiBalance}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Nodes Owned</span>
                <span className="block text-sm lg:text-base font-mono text-green-400">
                  {nodes.filter((n) => n.owner === OwnerType.PLAYER).length}
                </span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-slate-400">AI Nodes Owned</span>
                <span className="block text-sm lg:text-base font-mono text-red-400">
                  {nodes.filter((n) => n.owner === OwnerType.AI).length}
                </span>
              </div>
            </div>

            <div className="mt-1 h-1.5 lg:h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              {(() => {
                const total = BOARD_SIZE;
                const playerCount = nodes.filter(
                  (n) => n.owner === OwnerType.PLAYER,
                ).length;
                const aiCount = nodes.filter(
                  (n) => n.owner === OwnerType.AI,
                ).length;
                const playerPct = (playerCount / total) * 100;
                const aiPct = (aiCount / total) * 100;
                return (
                  <div className="flex h-full w-full">
                    <div
                      className="bg-emerald-400 transition-all duration-300"
                      style={{ width: `${playerPct}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-300"
                      style={{ width: `${aiPct}%` }}
                    />
                  </div>
                );
              })()}
            </div>
            {!isWalletConnected && (
              <p className="pt-2 text-[11px] text-slate-500 font-mono">
                Connect your Sui wallet above to start playing.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-walrus-card p-4 lg:p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-4">
          <div className="flex justify-center py-3 lg:py-4">
            <div
              className={`text-5xl font-bold text-slate-100 drop-shadow-[0_0_20px_rgba(56,189,248,0.8)] ${
                gameState.isMoving || isRollPending ? "animate-spin" : ""
              }`}
            >
              {diceResult
                ? ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][diceResult]
                : "?"}
            </div>
          </div>

          <button
            onClick={handleRollDice}
            disabled={
              gameState.isMoving ||
              !isWalletConnected ||
              isRollPending ||
              gameState.gameOver
            }
            className="w-full max-w-xs lg:max-w-sm mx-auto py-3 lg:py-4 bg-gradient-to-r from-walrus-accent to-blue-600 rounded-xl font-bold text-sm lg:text-base text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Dices size={20} />
            {!isWalletConnected
              ? "CONNECT WALLET TO PLAY"
              : gameState.isMoving || isRollPending
              ? "WAITING TX..."
              : gameState.gameOver
              ? gameResult === "PLAYER_WIN"
                ? "VICTORY"
                : "GAME OVER"
              : "ROLL DICE"}
          </button>

          <div className="h-16">
            {canBuy ? (
              <button
                onClick={handleBuyNodeClick}
                className="w-full h-full bg-gradient-to-r from-emerald-500/90 to-emerald-400/90 border border-emerald-300 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(16,185,129,0.8)] animate-pulse"
              >
                <ShoppingCart size={18} />
                BUY NODE (-${currentNode.price})
              </button>
            ) : currentNode.owner === OwnerType.AI && !gameState.isMoving ? (
              <div className="w-full h-full bg-red-900/40 border border-red-500 rounded-xl flex items-center justify-center gap-2 text-red-300 font-mono text-sm shadow-[0_0_18px_rgba(248,113,113,0.7)] animate-pulse">
                <AlertTriangle size={16} />
                PAYING RENT...
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500 font-mono text-center px-2">
                {!isWalletConnected
                  ? "Connect your wallet to buy nodes."
                  : currentNode.id === 0
                  ? "Move away from START to buy a node."
                  : currentNode.owner === OwnerType.PLAYER
                  ? "You already own this node."
                  : gameState.balance < currentNode.price
                  ? "Not enough SUI credits for this node."
                  : ""}
              </div>
            )}
          </div>
          {gameState.gameOver && (
            <button
              onClick={handleRestart}
              className="w-full mt-3 py-2 border border-slate-600/70 rounded-xl text-[11px] text-slate-300 font-mono hover:bg-slate-800/60 transition-colors"
            >
              RESTART GAME
            </button>
          )}
        </div>

        {gameState.gameOver && gameResult && (
          <div className="bg-walrus-card p-4 rounded-2xl border border-slate-700 shadow-xl space-y-2 text-xs text-slate-200">
            <div className="text-[10px] uppercase text-slate-500 font-mono">
              Game Result
            </div>
            <div className="text-sm font-semibold">
              {gameResult === "PLAYER_WIN"
                ? "You outperformed the Walrus network AI."
                : gameResult === "AI_WIN"
                ? "The Walrus network AI dominates the estates."
                : "Draw: you and the Walrus network AI ended evenly."}
            </div>
            <div className="text-[11px] text-slate-400">
              Final Net Worth · You: ${gameState.netWorth} · AI: ${aiNetWorth}
            </div>
          </div>
        )}

        <GameLog logs={logs} />
      </div>
      </div>
    </main>
  );
}

