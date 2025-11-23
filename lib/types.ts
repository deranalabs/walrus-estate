// lib/types.ts
export enum OwnerType {
  PLAYER = "PLAYER",
  AI = "AI",
  NONE = "NONE",
}

export interface NodeData {
  id: number;
  name: string;
  price: number;
  rent: number;
  owner: OwnerType;
  imageUrl: string;
  rarity: "Common" | "Rare" | "Legendary";
}

export interface GameState {
  position: number;
  balance: number;
  netWorth: number;
  turn: number;
  isMoving: boolean;
  gameOver: boolean;
}

export interface LogEntry {
  id: string;
  message: string;
  type: "info" | "success" | "danger" | "warning";
  timestamp: number;
}