# Walrus Estate – Sui Data Game

A wallet‑connected, on‑chain data estate game built on **Sui + Walrus**, designed for the **Walrus Haulout Hackathon**.

This README is the main entry point for judges and contributors. It explains what Walrus Estate is, how it is built, and how to run it locally.

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

## Landing Page Specification

**Routes:**
- `/` – Landing / marketing home (renders the landing page component).
- `/game` – Interactive Walrus Estate board game.

### 1. Hero Section

**Goal:** Immediately communicate what Walrus Estate is and why it is interesting.

Elements:

- Title:  
  > Walrus Estate – Gamified Data Estates on Sui

- Subtitle:  
  > Own, trade, and manage data nodes backed by Walrus decentralized storage.

- Calls to action:
  - `Play on Testnet` → link to `/game` (or deployed URL).
  - `View on GitHub` → link to this repository.
  - (Optional) `Watch Demo` → link to hackathon demo video.

- Visual:
  - Screenshot of the board (as in the app) as the main mockup.

### 2. Problem & Solution

Two columns:

- **Problem:**
  - Ownership of data is invisible and centralized.
  - Hard to onboard users into DA & programmable storage.

- **Solution (Walrus Estate):**
  - Visual board representing data nodes.
  - Game loop that simulates incentives & ownership.

### 3. How It Works

Three steps:

1. **Connect Wallet**
   - Connect Sui wallet via Sui dApp Kit.
2. **Acquire Data Nodes**
   - Buy nodes on board, each linked to Walrus blobs.
3. **Earn & Manage**
   - Collect rent or strategize holdings (future on‑chain logic).

Optionally include a simple diagram (grid + wallet + Walrus + Sui) in the landing page.

### 4. Tech Stack Section

Grid cards:

- **Sui** – L1 with Move smart contracts for ownership & logic.
- **Walrus** – Decentralized, durable data blobs (images/metadata).
- **Next.js + Tailwind** – Modern frontend.
- **Sui dApp Kit** – Wallet, RPC, and transaction signing.

### 5. Track Alignment & Hackathon Context

Cards for:

- Track: **Data Economy / Marketplaces**.
- Alignment:
  - Data nodes as tradable assets.
  - Walrus storage ensures durability & provenance.

Optionally include links to the Haulout landing page and DeepSurge project page.

### 6. Screenshots & Demo

- Screenshot 1: Board view (START + nodes).
- Screenshot 2: Wallet connected, node purchased (highlight tile).
- Link: Demo video (YouTube/Drive).

### 7. Call To Action

Closing CTAs:

- `Play now on testnet`
- `Read the docs`
- `View the code on GitHub`

---

## Game dApp UX Specification

**Route:** `/game` (game board).

Key UX elements:

- **Wallet Panel:**
  - Shows:
    - Connected address (shortened).
    - Network (testnet).
  - States:
    - If **not connected**:
      - Show a message “Connect wallet to start playing”.
      - Disable `ROLL DICE` & `BUY NODE`.
- **GameLog:**
  - Logs important events:
    - Wallet connected / disconnected.
    - Successful buys (on‑chain / off‑chain demo).
    - Transaction digests when Sui transactions are executed.
- **Board:**
  - Player‑owned nodes are highlighted differently.
  - (Optional) Small owner label: “YOU” / “AI / OTHER”.

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

## Development Phases & Timeline

_Dates can be adjusted, but the overall development flow is as follows._

### Phase 0 – Current State (Done)

- Game board & UI implemented.
- Wallet connect via Sui dApp Kit (`ConnectButton`).
- Hydration issues mitigated.

### Phase 1 – Professional UX & Wallet Awareness (1–2 days)

**Goal:** Demo‑ready, wallet‑aware dApp.

Tasks:

- Add `useCurrentAccount` usage where needed.
- Wallet panel:
  - Show address.
  - Disable actions when not connected.
- GameLog:
  - Log connect/disconnect.
- Landing page `/`:
  - Implement Hero, How It Works, Tech Stack, CTA based on the spec above.

Output:

- Clean dApp and landing page.
- Suitable for early demos and feedback.

### Phase 2 – Move Contract & Basic On‑chain Ownership (3–5 days)

**Goal:** Nodes are truly owned on Sui.

Tasks:

- Develop Move package `walrus_estate`.
- Implement `init_board`, `buy_node`.
- Add Move unit tests.
- Deploy to Sui testnet.
- Frontend integration:
  - `handleBuyNode` calls `buy_node`.
  - GameLog displays transaction digest and status.

Output:

- Proof of node ownership fully on‑chain.
- Public contract deployed to testnet.

### Phase 3 – Walrus Data Integration (2–3 days)

**Goal:** Each node truly represents Walrus‑backed data.

Tasks:

- Upload node images & metadata to Walrus.
- Switch `imageUrl` to Walrus aggregator URLs.
- (Optional) Store board config in Walrus and reference it from chain.

Output:

- Every node has Walrus‑backed data.
- Documented Walrus integration flow.

### Phase 4 – Polish, Docs, & Submission (2–3 days)

**Goal:** Ready for Haulout submission.

Tasks:

- Polish UX (loading, error states, mobile responsiveness).
- Write:
  - `README.md` (main).
  - `ARCHITECTURE.md`.
  - `ROADMAP.md` (this document can serve as a base).
- Prepare:
  - Demo video ≤ 5 minutes.
  - (Optional) short pitch deck.

Output:

- Clean repo that is easy for judges to read.
- Strong landing page + demo flow for evaluation.

---

## Release & Submission Checklist

**Code & Product**

- [ ] `npm run build` passes without errors.
- [ ] Game runs on testnet with wallet connection.
- [ ] At least one on‑chain node purchase cycle can be demonstrated.
- [ ] Landing page `/` clearly explains the product.

**Contract & Network**

- [ ] Move package `walrus_estate` deployed to Sui testnet.
- [ ] Package ID and important objects documented.
- [ ] Walrus blobs (images & metadata) live and URLs updated.

**Docs**

- [ ] `README.md` explains:
  - What Walrus Estate is.
  - How to run it locally.
  - How to connect to testnet.
- [ ] `ARCHITECTURE.md` describes:
  - Frontend, Move, Walrus, (optional backend).
- [ ] `ROADMAP.md` (or this document) outlines future development and vision.

**Hackathon Submission**

- [ ] Project created on DeepSurge with:
  - Name, description, logo.
  - Website link (`https://...`).
  - GitHub repository link.
- [ ] Demo video (≤ 5 minutes) uploaded:
  - Flow: Landing → connect → play → buy node → view on chain.
- [ ] (Optional) Pitch deck PDF:
  - Problem, Solution, Architecture, Track fit, Roadmap.

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
