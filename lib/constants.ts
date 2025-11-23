// lib/constants.ts
import { NodeData, OwnerType } from "./types";

export const BOARD_SIZE = 16;
export const START_BONUS = 200;
export const INITIAL_BALANCE = 1500;

export const PLAYER_AVATAR_URL =
  "https://aggregator.walrus-testnet.walrus.space/v1/blobs/LPjDsUtsBhIJy3t5dPf5UMEr-ViUw9Dk-p43XpUCb94";

export const AI_AVATAR_URL =
  "https://aggregator.walrus-testnet.walrus.space/v1/blobs/5SHwRneEY2q3SMrlcW0u3yHtwVnwWzfdQbeWzk7scWw";

const getPlaceholderImage = (id: number, type: string) => {
  const color = type === "Common" ? "3b82f6" : type === "Rare" ? "a855f7" : "f59e0b";
  // TODO: Replace with https://aggregator.walrus-testnet.walrus.space/v1/<BLOB_ID>
  return `https://placehold.co/400x400/1e293b/${color}?text=Blob+${id}`;
};

export const INITIAL_NODES: NodeData[] = [
  {
    id: 0,
    name: "Genesis Block",
    price: 0,
    rent: 0,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/mOA6XbeSoOruLJ-vxIg5erVIi_sRHrhvr4Ryj-06rXY",
    rarity: "Legendary",
  },
  {
    id: 1,
    name: "Cache Node Alpha",
    price: 150,
    rent: 15,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/KGErg-D64RA8drs3qNd0Z25pq6zYOyjpqliCk6JoPek",
    rarity: "Common",
  },
  {
    id: 2,
    name: "Deep Store Delta",
    price: 200,
    rent: 20,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/wNQTzYveARRo13IPtcicUuJr68mwAQe-VMdcLf5FmIY",
    rarity: "Common",
  },
  {
    id: 3,
    name: "Sui Bridge End",
    price: 300,
    rent: 35,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/e8FUr2ch8sJVSswsr8gK_Qo7NujRCqp_UVuT9QoZuzg",
    rarity: "Rare",
  },
  {
    id: 4,
    name: "Blob Fragment X",
    price: 150,
    rent: 15,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/tIPm4sAILQ_qKUZLff6D2n2YDcX-E9RDqVk3Jh-_Pmo",
    rarity: "Common",
  },
  {
    id: 5,
    name: "Epoch Archive",
    price: 400,
    rent: 50,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/DHh5T_35kmgeliK2XAHOTIk5mVVnHbC_XmAi3ChrRic",
    rarity: "Legendary",
  },
  {
    id: 6,
    name: "Shadow Validator",
    price: 220,
    rent: 25,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/Dy-JV32Gbac39yC1hdu5A9PbEOtyg6ezxbclThdXqyM",
    rarity: "Rare",
  },
  {
    id: 7,
    name: "Data Lake #07",
    price: 160,
    rent: 18,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/zzXTU08hipy-TqwNwRkjePhf6xYpb7aFsodkDKVdFjQ",
    rarity: "Common",
  },
  {
    id: 8,
    name: "Walrus Hub",
    price: 180,
    rent: 20,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/xwt6T8AC1OC52V1jELXqPNz5qCghUYvb2SxNtvvsXwA",
    rarity: "Common",
  },
  {
    id: 9,
    name: "Encrypted Shard",
    price: 350,
    rent: 45,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/VXsCmp50YrIXYHP07Cb9nEpKWtEHEBem50a121m9p68",
    rarity: "Legendary",
  },
  {
    id: 10,
    name: "Redundant Array",
    price: 140,
    rent: 12,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/hev621sZzH3bOzZ_Q8lQJSxAFLUcuflPm93iOT1gRWM",
    rarity: "Common",
  },
  {
    id: 11,
    name: "Byzantine Blob",
    price: 280,
    rent: 30,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/FoU6FLHBKo_FI9ZfHsvat84SHlG1mWe2z-5zAHZANTM",
    rarity: "Rare",
  },
  {
    id: 12,
    name: "Storage Proof",
    price: 190,
    rent: 22,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/SiRL6i_lMWhgtwNZ9N4Ab7D8bDQmkuLtPWS5XCwejAc",
    rarity: "Common",
  },
  {
    id: 13,
    name: "Frozen Ledger",
    price: 210,
    rent: 24,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/k6p3reTFy7wSyNnV_4Jyrz7kNt28Xcsdyr3DtB6VU-I",
    rarity: "Rare",
  },
  {
    id: 14,
    name: "Metadata Index",
    price: 130,
    rent: 10,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/M_O8OPI7L8bpjkkfdDz_YHvRqVss5kkHzxDbkLdNDn8",
    rarity: "Common",
  },
  {
    id: 15,
    name: "Final Epoch",
    price: 500,
    rent: 60,
    owner: OwnerType.NONE,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/bJl9016n-qx4_O02gD1FiKzYBKOjtb8yCI1wIA0q8J8",
    rarity: "Legendary",
  },
];