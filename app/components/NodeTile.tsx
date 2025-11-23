"use client";

import React from "react";
import { NodeData, OwnerType } from "../../lib/types";
import { Database, Building2, Factory, Lock } from "lucide-react";
import { PLAYER_AVATAR_URL, AI_AVATAR_URL } from "../../lib/constants";

interface NodeTileProps {
  data: NodeData;
  isPlayerHere: boolean;
  isAiHere: boolean;
}

export const NodeTile: React.FC<NodeTileProps> = ({
  data,
  isPlayerHere,
  isAiHere,
}) => {
  const isStart = data.id === 0;

  const borderColor = isPlayerHere
    ? "border-walrus-accent ring-2 ring-walrus-accent ring-offset-2 ring-offset-slate-900"
    : isAiHere
    ? "border-red-400 ring-2 ring-red-500/80 ring-offset-2 ring-offset-slate-900"
    : data.owner === OwnerType.PLAYER
    ? "border-green-500/60"
    : data.owner === OwnerType.AI
    ? "border-red-500/60"
    : "border-slate-700/80";

  // Gunakan background netral, gunakan border/badge untuk menunjukkan kepemilikan
  const bgOpacity = isPlayerHere || isAiHere ? "bg-opacity-40" : "bg-opacity-20";
  const bgColor = "bg-slate-900";

  return (
    <div
      className={`
        relative flex flex-col items-center justify-between p-2 rounded-lg border-2 
        transition-all duration-300 h-[140px] sm:h-[160px]
        ${borderColor} ${bgColor} ${bgOpacity}
        ${isPlayerHere || isAiHere ? "shadow-[0_0_24px_rgba(56,189,248,0.45)]" : "shadow-[0_0_12px_rgba(15,23,42,0.9)]"}
        backdrop-blur-md
      `}
    >
      <div className="absolute inset-0 rounded-md overflow-hidden -z-10 opacity-60">
        <img
          src={data.imageUrl}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full flex justify-between items-start text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-slate-300">
        <span>#{data.id}</span>
        {data.rent > 0 && <span className="text-slate-400">${data.rent}/t</span>}
      </div>

      <div className="flex flex-col items-center gap-1">
        {isStart ? (
          <Database className="text-walrus-accent animate-pulse" size={32} />
        ) : data.owner === OwnerType.PLAYER ? (
          <Building2
            className="text-emerald-400 drop-shadow-md"
            size={30}
          />
        ) : data.owner === OwnerType.AI ? (
          <Factory
            className="text-red-400 drop-shadow-md"
            size={30}
          />
        ) : (
          <Lock className="text-slate-500" size={24} />
        )}
        <div className="text-center leading-tight">
          <div className="font-semibold text-xs sm:text-sm text-white truncate w-24">
            {data.name}
          </div>
          {!isStart && (
            <div
              className={`text-[10px] ${
                data.owner === OwnerType.NONE
                  ? "text-walrus-accent"
                  : "text-slate-400"
              }`}
            >
              {data.owner === OwnerType.NONE
                ? `$${data.price}`
                : data.owner === OwnerType.PLAYER
                ? "OWNED"
                : "OCCUPIED"}
            </div>
          )}
        </div>
      </div>

      {isPlayerHere && (
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_#06b6d4] z-20 animate-bounce overflow-hidden border border-cyan-300/80 bg-slate-900/80">
          <img
            src={PLAYER_AVATAR_URL}
            alt="Player"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {isAiHere && (
        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(248,113,113,0.85)] z-20 animate-bounce overflow-hidden border border-red-300/80 bg-slate-900/80">
          <img
            src={AI_AVATAR_URL}
            alt="Walrus AI"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 h-1 
          ${
            data.rarity === "Legendary"
              ? "bg-yellow-500"
              : data.rarity === "Rare"
              ? "bg-purple-500"
              : "bg-slate-600"
          }
        `}
      />
    </div>
  );
};