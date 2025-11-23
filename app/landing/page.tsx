"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Factory } from "lucide-react";
import {
  INITIAL_NODES,
  PLAYER_AVATAR_URL,
  AI_AVATAR_URL,
} from "../../lib/constants";
import type { NodeData } from "../../lib/types";

type PreviewOwner = "player" | "ai";

export default function LandingPage() {
  const [previewOwnership, setPreviewOwnership] = useState<
    Record<number, PreviewOwner>
  >({});
  const [playerPos, setPlayerPos] = useState(0);
  const [aiPos, setAiPos] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [previewWinner, setPreviewWinner] = useState<
    PreviewOwner | "draw" | null
  >(null);

  const turnRef = useRef<PreviewOwner>("player");
  const playerPosRef = useRef(0);
  const aiPosRef = useRef(0);
  const stepsLeftRef = useRef(0);
  const lastRollRef = useRef(0);
   const winnerRef = useRef<PreviewOwner | "draw" | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Pause movement while victory/defeat overlay is shown.
      if (winnerRef.current) return;

      const currentTurn = turnRef.current;
      const totalTiles = INITIAL_NODES.length;

      // If no movement is pending, roll a new dice for the current turn.
      if (stepsLeftRef.current === 0) {
        const roll = Math.floor(Math.random() * 6) + 1; // 1–6
        lastRollRef.current = roll;
        stepsLeftRef.current = roll;
        return; // Wait until next tick to start moving
      }

      // Move one step for the current turn.
      if (currentTurn === "player") {
        let pos = playerPosRef.current;
        pos = (pos + 1) % totalTiles;
        playerPosRef.current = pos;
        setPlayerPos(pos);
        setActiveNodeId(pos);
      } else {
        let pos = aiPosRef.current;
        pos = (pos + 1) % totalTiles;
        aiPosRef.current = pos;
        setAiPos(pos);
        setActiveNodeId(pos);
      }

      stepsLeftRef.current -= 1;

      // If movement just finished, attempt to buy the landed tile and possibly switch turns.
      if (stepsLeftRef.current === 0) {
        const landedPos =
          currentTurn === "player" ? playerPosRef.current : aiPosRef.current;
        const landedNodeId = INITIAL_NODES[landedPos]?.id ?? landedPos;

        if (landedNodeId !== 0) {
          setPreviewOwnership((prev) => {
            const next = { ...prev };
            if (!next[landedNodeId]) {
              next[landedNodeId] = currentTurn;
            }

            // After applying the new ownership, check if all non-start tiles are owned.
            const allOwned = INITIAL_NODES.filter((n) => n.id !== 0).every(
              (n) => next[n.id] === "player" || next[n.id] === "ai",
            );

            if (allOwned) {
              // Decide winner based on who owns more tiles.
              let playerCount = 0;
              let aiCount = 0;
              INITIAL_NODES.filter((n) => n.id !== 0).forEach((n) => {
                const owner = next[n.id];
                if (owner === "player") playerCount += 1;
                if (owner === "ai") aiCount += 1;
              });

              let winner: PreviewOwner | "draw" = "draw";
              if (playerCount > aiCount) winner = "player";
              else if (aiCount > playerCount) winner = "ai";

              setPreviewWinner(winner);
              winnerRef.current = winner;

              // After a short delay, reset the preview board and start a new cycle.
              setTimeout(() => {
                setPreviewOwnership({});
                playerPosRef.current = 0;
                aiPosRef.current = 0;
                setPlayerPos(0);
                setAiPos(0);
                setActiveNodeId(0);
                turnRef.current = "player";
                stepsLeftRef.current = 0;
                lastRollRef.current = 0;
                winnerRef.current = null;
                setPreviewWinner(null);
              }, 1200);
            }

            return next;
          });
        }

        // Extra turn on rolling a 6, otherwise hand over to the other side.
        if (lastRollRef.current !== 6) {
          turnRef.current = currentTurn === "player" ? "ai" : "player";
        }
      }
    }, 350);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-walrus-dark text-slate-100 px-4 py-6 lg:px-10 lg:py-10">
      <div className="max-w-5xl mx-auto space-y-16 lg:space-y-20">
        {/* Hero */}
        <section className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          <div className="flex-1 space-y-6 lg:space-y-7">
            <div className="flex items-center gap-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-walrus-gold font-mono">
                Walrus Estate · Sui Data Game
              </p>
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-walrus-accent to-walrus-secondary">
              Gamified Data Estates
              <br /> on Sui & Walrus
            </h1>
            <p className="text-slate-300 max-w-xl text-sm lg:text-base">
              Walrus Estate visualizes Walrus storage nodes as property tiles on a
              board. Connect your Sui wallet, manage data estates, and experience
              on-chain data economics through a game.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/game"
                className="px-5 py-3 rounded-xl bg-slate-50 text-slate-900 font-semibold text-sm shadow-md hover:shadow-lg hover:bg-white transition-colors"
              >
                Play on Testnet
              </Link>
              <a
                href="https://github.com/deranalabs/walrus-estate"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl border border-slate-600 text-slate-200 font-semibold text-sm hover:bg-slate-800/60 transition-colors"
              >
                View on GitHub
              </a>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 font-mono">
              Runs on <span className="text-slate-300">Sui Testnet</span> · Wallet
              connection required to play.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Need testnet SUI?{" "}
              <a
                href="https://faucet.sui.io/?network=testnet"
                target="_blank"
                rel="noreferrer"
                className="text-walrus-accent hover:underline underline-offset-2"
              >
                Get it from the official Sui faucet.
              </a>
            </p>
          </div>

          <div className="flex-1 w-full">
            <div className="relative rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900/60 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(15,23,42,0.8)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(168,85,247,0.2),_transparent_55%)]" />
              {previewWinner && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <span
                    className={`px-4 py-2 rounded-full text-[11px] font-mono border ${
                      previewWinner === "player"
                        ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                        : previewWinner === "ai"
                        ? "border-red-400 text-red-300 bg-red-500/10"
                        : "border-slate-500 text-slate-200 bg-slate-800/60"
                    }`}
                  >
                    {previewWinner === "player"
                      ? "Preview result: Player leads this cycle"
                      : previewWinner === "ai"
                      ? "Preview result: Walrus AI leads this cycle"
                      : "Preview result: Draw on this cycle"}
                  </span>
                </div>
              )}
              <div className="relative p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Walrus Estate · Board Preview</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] uppercase">
                    Testnet
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  {INITIAL_NODES.map((node: NodeData) => {
                    const owner = previewOwnership[node.id];
                    const isPlayerHere = playerPos === node.id;
                    const isAiHere = aiPos === node.id;
                    const isActive = activeNodeId === node.id;

                    const borderClass = owner
                      ? owner === "player"
                        ? "border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]"
                        : "border-red-400 shadow-[0_0_14px_rgba(248,113,113,0.75)]"
                      : "border-slate-700/80";

                    return (
                      <div
                        key={node.id}
                        className={`relative h-20 rounded-xl bg-slate-900/80 flex flex-col items-center justify-center gap-1 px-1 transition-all duration-500 ${borderClass}`}
                      >
                        {isActive && (
                          <div className="pointer-events-none absolute inset-0 rounded-xl border border-slate-100/40 animate-ping" />
                        )}
                        {owner === "player" && (
                          <span className="absolute bottom-1 left-1 text-emerald-400 drop-shadow-md">
                            <Building2 size={16} />
                          </span>
                        )}
                        {owner === "ai" && (
                          <span className="absolute bottom-1 right-1 text-red-400 drop-shadow-md">
                            <Factory size={16} />
                          </span>
                        )}
                        {isPlayerHere && (
                          <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full overflow-hidden border border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)] bg-slate-900">
                            <img
                              src={PLAYER_AVATAR_URL}
                              alt="Player avatar"
                              className="w-full h-full object-cover"
                            />
                          </span>
                        )}
                        {isAiHere && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full overflow-hidden border border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.9)] bg-slate-900">
                            <img
                              src={AI_AVATAR_URL}
                              alt="AI avatar"
                              className="w-full h-full object-cover"
                            />
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono">
                          #{node.id}
                        </span>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-700/70 bg-slate-950">
                          <Image
                            src={node.imageUrl}
                            alt={node.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[9px] text-slate-300 truncate max-w-[72px]">
                          {node.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-slate-500 font-mono text-right">
                  Preview: simulated turns between player and Walrus AI, following
                  the in-game dice rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-red-300 uppercase tracking-wide">
              Problem
            </h2>
            <p className="text-sm text-slate-300">
              Data ownership is often hidden inside centralized infrastructure. It is
              hard for developers and users to understand incentives and value flows
              around data and storage.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Storage and DA feel abstract, with no intuitive visual form.</li>
              <li>It is difficult to explain data economics to non-technical users.</li>
              <li>Onboarding to Walrus and Sui needs concrete, interactive examples.</li>
            </ul>
          </div>

          <div className="bg-slate-900/70 border border-emerald-500/40 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
              Solution · Walrus Estate
            </h2>
            <p className="text-sm text-slate-300">
              Walrus Estate maps Walrus storage nodes into an interactive game board.
              Each tile represents a data estate that can be owned, traded, and
              analyzed.
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>4×4 board representing data nodes on Walrus.</li>
              <li>Simple game loop: roll, move, acquire nodes, and manage ownership.</li>
              <li>Sui wallet integration for on-chain identity and ownership.</li>
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-walrus-accent rounded-full" />
            How It Works
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">1 · Connect</p>
              <h3 className="text-sm font-semibold text-slate-100">
                Connect Sui Wallet
              </h3>
              <p className="text-xs text-slate-400">
                Use Sui dApp Kit to connect a wallet on testnet. Gamers and builders
                can immediately feel a real dApp flow.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">2 · Acquire</p>
              <h3 className="text-sm font-semibold text-slate-100">
                Acquire Data Nodes
              </h3>
              <p className="text-xs text-slate-400">
                Roll the dice, move across the board, and acquire strategic nodes. Each
                node can be linked to a Walrus blob containing metadata or datasets.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">3 · Manage</p>
              <h3 className="text-sm font-semibold text-slate-100">
                Manage & Analyze
              </h3>
              <p className="text-xs text-slate-400">
                Track net worth, node ownership, and system logs. In the future, buying
                nodes and the full game economy can be moved entirely on-chain.
              </p>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-walrus-secondary rounded-full" />
            Tech Stack
          </h2>
          <div className="grid lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Sui</p>
              <p className="text-xs text-slate-300">
                Layer-1 with Move smart contracts for ownership logic and game
                economics.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Walrus</p>
              <p className="text-xs text-slate-300">
                Programmable storage to persist node images and metadata as durable
                blobs.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Next.js + Tailwind</p>
              <p className="text-xs text-slate-300">
                Modern frontend using the App Router, responsive styling, and smooth
                micro-interactions.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Sui dApp Kit</p>
              <p className="text-xs text-slate-300">
                Wallet connect, RPC hooks, and ready-made components for building Sui
                dApps quickly.
              </p>
            </div>
          </div>
        </section>

        {/* Haulout Hackathon context */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full" />
            Walrus Haulout Hackathon
          </h2>
          <div className="bg-slate-900/70 border border-emerald-500/40 rounded-2xl p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="space-y-2 text-xs text-slate-300 max-w-2xl">
              <p>
                Walrus Estate is built as a prototype for the Walrus Haulout Hackathon,
                focusing on the <span className="font-semibold">Data Economy / Marketplaces</span> track.
                The current version ships with a minimal on-chain demo (dice roll logging and a
                single node purchase) while keeping the rest of the game logic off-chain for simplicity.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Visualizes Walrus storage nodes as tradable data estates.</li>
                <li>Demonstrates Sui wallet integration and game-driven onboarding.</li>
                <li>Designed to extend into fully on-chain ownership and Walrus-backed datasets.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <a
                href="https://www.deepsurge.xyz/create-account?hackathon=haulout"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-emerald-500/60 text-emerald-300 font-semibold hover:bg-emerald-500/10 transition-colors"
              >
                View Hackathon on DeepSurge
              </a>
              <a
                href="https://go.sui.io/intro-walrus"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800/70 transition-colors"
              >
                Learn more about Walrus
              </a>
              <a
                href="https://mystenlabs.notion.site/Walrus-Haulout-Hackathon-Participant-Handbook-2886d9dcb4e980e2adc1d047a95dfef8"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800/70 transition-colors"
              >
                View Participant Handbook
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border border-slate-800 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-50">
              Ready to play with data economics on Sui?
            </h2>
            <p className="text-xs text-slate-300 max-w-md">
              Open the Walrus Estate board, connect your wallet, and see how the idea of
              data estates can become a playful experience for both gamers and
              developers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/game"
              className="px-5 py-3 rounded-xl bg-walrus-accent text-slate-900 font-semibold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Open Game Board
            </Link>
            <a
              href="https://go.sui.io/intro-walrus"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl border border-slate-600 text-slate-200 font-semibold text-sm hover:bg-slate-800/60 transition-colors"
            >
              Learn Walrus
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
