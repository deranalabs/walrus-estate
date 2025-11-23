# Walrus Estate – Sui Data Game

A wallet‑connected, on‑chain data estate game built on **Sui + Walrus**, designed for the **Walrus Haulout Hackathon**.

This README is the main entry point for judges and contributors. It explains what Walrus Estate is, how it is built, and how to run it locally.

---

**Live Demo:** https://walrus-estate-rhernboau-byeumoov.vercel.app  
**GitHub Repository:** https://github.com/deranalabs/walrus-estate  
**Sui Testnet Faucet:** https://faucet.sui.io/?network=testnet  
**Walrus Haulout Handbook:** https://mystenlabs.notion.site/Walrus-Haulout-Hackathon-Participant-Handbook-2886d9dcb4e980e2adc1d047a95dfef8

## Quickstart for Judges

1. **Open the live demo**: https://walrus-estate-rhernboau-byeumoov.vercel.app
2. **Install & unlock a Sui wallet** (e.g. Sui Wallet, Ethos) and switch the network to **testnet**.
3. **Get testnet SUI** from the official faucet: https://faucet.sui.io/?network=testnet.
4. **Go to `/game`** and connect your wallet using the Sui dApp Kit `Connect` button in the header.
5. **Roll the dice** several times:
   - Each roll calls the on‑chain `log_roll` function on Sui testnet.
   - The System Log panel shows transaction digests and AI turns.
6. **Buy node #1 – “Cache Node Alpha”** when you land on it:
   - The dApp sends an on‑chain `buy_node` call for node #1.
   - The local board only updates ownership after on‑chain confirmation.

This flow demonstrates how Walrus Estate ties together Sui wallet flows, Walrus‑backed tiles, and a minimal on‑chain game loop.

---

## Table of Contents

1. [Vision & Positioning](#vision--positioning)
2. [User Personas & Use Cases](#user-personas--use-cases)
3. [Core Features](#core-features)
4. [System Architecture](#system-architecture)
5. [Repository Structure](#repository-structure)
6. [Getting Started](#getting-started)
7. [Landing Page Specification](#landing-page-specification)
8. [Game dApp UX Specification](#game-dapp-ux-specification)
9. [Wallet & On‑Chain Integration](#wallet--on-chain-integration)
10. [Walrus Integration](#walrus-integration)
11. [Development Phases & Timeline](#development-phases--timeline)
12. [Release & Submission Checklist](#release--submission-checklist)
13. [Future Extensions](#future-extensions)

---

## Vision & Positioning

### Problem

Data, storage, and AI infrastructure are often abstract and invisible to most users. Walrus provides programmable storage on Sui, but many developers and users still lack an intuitive mental model for:

- Understanding data ownership.
- Understanding incentives (rent, yield, access to data).
- Experimenting with ideas around data economies in a safe way.

### Solution: Walrus Estate

**Walrus Estate** is a **game‑like marketplace** that visualizes Walrus storage nodes as **property tiles** on a board. Players:

- Connect with a Sui wallet.
- Manage “data estates” (Walrus nodes) by buying and holding nodes.
- See a simplified data economy represented as an interactive board game.

### Hackathon Track Alignment

- **Primary Track: Data Economy / Marketplaces**
  - Each tile represents a storage/data node in Walrus.
  - The player acts as an investor/operator of data estates.
- **Additional angles:**
  - **AI x Data** – future AI agent that can advise on which nodes to acquire.
  - **Data Security & Privacy** – Walrus as immutable storage with on‑chain provenance.

---

## User Personas & Use Cases

### 1. Sui/Walrus Developer

- Wants a simple but complete demo that shows:
  - Walrus + Sui + Move + a modern frontend working together.
  - A concrete example of a data economy.

### 2. Crypto Gamer / DeFi User

- Wants a light, visual game that connects to a wallet.
- Enjoys speculation and on‑chain asset ownership.

### 3. Judges & DevRel

- Need to see:
  - A real use of **Walrus** (for assets and/or metadata).
  - Clean Sui wallet integration.
  - Clear UX, good documentation, and understandable architecture.

---

## Core Features

### MVP (Current State + Minor Additions)

- Walrus Estate board 4×4.
- Wallet connect (Sui dApp Kit `ConnectButton`).
- Off‑chain game logic:
  - Roll dice and move the player.
  - Buy nodes locally (simulation).
  - System log (GameLog) with key game events.
- Dark, cyberpunk‑inspired UI with responsive layout.

### v1 – Professional dApp for Hackathon

- **Wallet‑aware game**:
  - Wallet address is visible in the UI.
  - Connect/disconnect status is reflected in logs and buttons.
  - Game actions (roll/buy) are only enabled when a wallet is connected.
- **On‑chain ownership (Move)**:
  - Smart contract `walrus_estate`:
    - Types `GameNode`, `GameConfig`.
    - Function `buy_node(node_id)` that updates node ownership on‑chain.
- **Walrus integration**:
  - Node images and metadata stored as Walrus blobs (testnet).
  - `blob_id` stored in Move `GameConfig`.
  - Frontend loads board metadata from the Walrus aggregator.
- **Dedicated landing page** `/` (backed by `app/landing/page.tsx`):
  - Explains the concept, technology stack, and demo flow.

### v1.1 – Nice to Have

- Simple leaderboard (off‑chain).
- Light analytics (nodes owned, transaction volume).
- Final copywriting and visual polish for public launch.

---

## System Architecture

### Frontend

- **Framework:** Next.js App Router (16.x), TypeScript.
- **Styling:** Tailwind CSS v4 + custom Walrus theme.
- **State:** React Hooks (no heavy global store).
- **Wallet & Sui:**
  - `@mysten/dapp-kit` – ConnectButton, hooks wallet & Sui client.
  - `@mysten/sui` – Transaction builder & client utilities.
  - `@tanstack/react-query` – data fetching & caching.

### Smart Contract (Move on Sui)

- Package: `walrus_estate`
- Objects:
  - `struct GameNode` – id, price, rent, rarity, owner, walrus_blob_id.
  - `struct GameConfig` – board layout, treasury, global settings.
- Entry functions:
  - `init_board(...)` – initializes nodes and configuration.
  - `buy_node(node_id: u8, payment: Coin<SUI>)` – node purchase logic.

### Walrus

- Stores:
  - Node images (tile art).
  - Per‑node JSON metadata (`name`, descriptions, etc.).
  - (Optional) Full board configuration.

### Backend (Optional)

- Node/TS service (serverless / small API):
  - Indexes events from Sui (e.g. `buy_node` transactions).
  - Stores highscores / basic statistics.

---

## Repository Structure

```txt
walrus-estate/
  app/
    page.tsx              # Landing / marketing page (home route "/")
    game/
      page.tsx            # Game board page ("/game")
    layout.tsx            # Root layout + Sui Providers
    providers.tsx         # Sui dApp Kit + React Query providers
    landing/
      page.tsx            # Landing page component, reused by app/page.tsx
    components/
      NodeTile.tsx
      GameLog.tsx
  lib/
    constants.ts
    types.ts
  move/
    WalrusEstate/
      sources/
        game.move         # GameNode, GameState, buy_node, log_roll
      Move.toml
  public/
    images/
      walrus_estate.png   # Header/logo image
      node-*.png          # Board node artwork
  package.json
  tailwind.config.js
  tsconfig.json
```

---

## Getting Started

This project is a Next.js (App Router) frontend plus a Move package deployed on Sui. The instructions below focus on running the frontend locally for hackathon judging and development.

### Prerequisites

- Node.js **>= 18** (recommended LTS)
- pnpm, npm, or yarn (examples below use `npm`)
- A Sui wallet supported by **@mysten/dapp-kit** (e.g. Sui Wallet, Ethos, etc.)
- Access to **Sui testnet** and Walrus testnet (for the on‑chain demo call)

### 1. Install dependencies

In the project root:

```bash
npm install
```

### 2. Configure on‑chain constants (optional for local UI only)

The game makes demo on‑chain calls from the frontend using Move package IDs defined in `app/config/onchain.ts`:

- `WALRUS_PACKAGE_ID`
- `GAMESTATE_ID`
- `GAMESTATE_INITIAL_VERSION`

For a pure UI demo (no on‑chain calls), the app will still render, but the on‑chain actions will fail. For a full on‑chain demo:

1. Deploy the `walrus_estate` Move package in `move/WalrusEstate` to Sui testnet.
2. Initialize the shared `GameState` object using `init_state`.
3. Update `app/config/onchain.ts` with the deployed package and object IDs.

### 3. Run the development server

```bash
npm run dev
```

Then open:

- `http://localhost:3000/` – Landing / marketing home.
- `http://localhost:3000/game` – Interactive board game.

### 4. Build for production

```bash
npm run build
npm start
```

This will run the optimized production build on the configured port (default 3000).

---

## Wallet & On‑Chain Integration

### Wallet (Frontend)

- Hooks:
  - `useCurrentAccount()` – address & account state.
  - `useSignAndExecuteTransaction()` – execute Move calls.
  - `useSuiClientQuery()` – read board state from chain.

### On‑Chain Game Logic (Move)

- `GameNode`:
  - `id: u8`
  - `price: u64`
  - `rent: u64`
  - `rarity: u8`
  - `owner: address`
  - `walrus_blob_id: vector<u8>`

- `GameConfig`:
  - `admin: address`
  - `treasury: address`
  - `nodes: vector<GameNode>`

- Entrypoint:
  - `public entry fun buy_node(node_id: u8, payment: Coin<SUI>, ...)`

Frontend `handleBuyNode`:

1. Build a `Transaction`.
2. Call `buy_node` on the specific package ID.
3. Show the result in `GameLog`.

---

## Walrus Integration

- **Upload assets**:
  - Tile images (PNG) → Walrus testnet aggregator → obtain `blob_id`.
  - Per‑node JSON metadata → dedicated `blob_id` for each.

- **Store `blob_id` on‑chain**:
  - `walrus_blob_id` inside `GameNode` or `GameConfig`.

- **Frontend:**
  - Build image URLs from the Walrus aggregator:  
    `https://aggregator.walrus-testnet.walrus.space/v1/<BLOB_ID>`  
  - Update `imageUrl` in `constants.ts` to use those URLs.

- **Documentation:**
  - Document the flow: “From Walrus upload → chain reference → frontend rendering”.

### How Walrus, Seal, and Nautilus Are Used in Walrus Estate

Walrus Estate is intentionally structured as a small "data estates" laboratory for the Sui ecosystem. The current prototype already uses **Sui + Walrus** end‑to‑end, and is designed to grow into a full **Walrus + Seal + Nautilus** stack.

- **Walrus – Data Estates as Blobs (live)**  
  Every board tile is backed by a real Walrus blob on testnet. The frontend uses Walrus aggregator URLs as `imageUrl` for each `GameNode`, and the game UI exposes a "Data Estate" section that links the currently occupied estate to its Walrus blob. This makes each node feel like a concrete Walrus‑backed asset instead of an abstract token.

- **Seal – Encrypted Estate Metadata (designed)**  
  Seal is planned as the privacy layer for per‑estate metadata. The design is that each estate can have an **encrypted "Estate Note" or dataset reference**, encrypted client‑side with the Seal TypeScript SDK and stored on Walrus or on‑chain. Decryption keys would be governed by a Seal‑compatible Move policy on Sui, so only the current owner of an estate can decrypt its note. In the UI this surfaces as a gated action like `View Encrypted Estate Note`, tying together Sui ownership, Walrus blobs, and Seal‑based access control.

- **Nautilus – Verifiable Off‑chain Analytics (future work)**  
  Nautilus is the natural extension point for verifiable analytics and AI on top of these data estates. A future version of Walrus Estate can use a Nautilus enclave to ingest Walrus blobs and on‑chain game state, compute **verifiable valuations or risk scores** for each estate, and post the results back to Sui. The board would then display "Verified valuation by Nautilus" badges and dynamic prices/rents driven by those verifiable computations.

This layering lets Walrus Estate tell a coherent story:

- **Sui** manages game logic and estate ownership.
- **Walrus** stores the underlying data assets as durable blobs.
- **Seal** (planned) governs who can decrypt sensitive metadata tied to those estates.
- **Nautilus** (planned) provides verifiable off‑chain analytics that can safely influence gameplay and markets.

---

## Known Limitations (Hackathon Prototype)

- Only node **#1 – "Cache Node Alpha"** is wired to the on‑chain `buy_node` demo. Purchases of other nodes are simulated locally in the frontend.
- Board state is primarily driven by local game logic; a full chain‑synchronized board (state rehydration on reload) is out of scope for this prototype.
- Seal and Nautilus integrations are **designed and documented**, but not yet wired into live Seal key servers or Nautilus enclaves.

---

## Future Extensions

- **AI Advisor**:
  - LLM agent that reads board state and suggests investment strategies.
- **Team Play / Multiplayer**:
  - Multiple wallets playing on the same board.
- **Advanced Data Economy**:
  - Dataset access restricted to specific node owners.
  - Royalties & revenue sharing from data reads.

---

_This README serves as the primary development document and reference for the Walrus Haulout Hackathon submission._
