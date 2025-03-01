# Mamothon XO Market

## 🚀 Overview
Mamothon XO Market is a social media-powered prediction market that allows users to create, trade, and engage in social-driven betting markets. Unlike traditional prediction markets, XO Market enhances user experience by integrating social interactions and enabling custom market creation.

- **Smart Contracts** (`smartcontracts/`): Blockchain-based logic for market interactions.
- **Data Service** (`data-service/`): Backend service for managing data storage and processing.
- **Frontend** (`frontend/`): The user interface for interacting with XO Market.

This repository is structured to facilitate development and deployment of the full XO Market ecosystem in one place.

---

## 👥 Team
XO Market is built by a globally distributed team of five talents across four countries and four continents:

- **Ali Habbabeh** – Project Manager
- **Walid Al Haboul** – Smart Contract Developer 
- **Devendra Chauhan** – Backend Developer
- **Taha Ben Esmael** – UX Designer
- **Nikku** – Frontend Developer

---

## 🏆 Motivation
We are avid users of Polymarket but noticed significant gaps in existing prediction markets:
- Current platforms **do not support user-created bets**.
- Lack of **social context makes betting feel isolated**.
- Many markets suffer from **low liquidity**, limiting engagement.

Our goal is to take prediction markets further by making them **more social, interactive, and accessible**.

---

## 🔥 Why Social Betting Matters
Current prediction market platforms have major shortcomings:
- No way to see **what your network thinks**.
- Lack of **shared excitement and discussion** around bets.
- Betting is inherently **a social activity**, often discussed in communities.

**Our Approach:**
- Leverage **Farcaster Neynar hubs** to pull real-time social sentiment.
- Enable users to **see friends' predictions and discuss outcomes**.
- Create a **community-driven betting experience** beyond isolated wagers.

---

## ❌ Problems with Existing Prediction Markets
- **Markets are isolated** – No integration with social platforms.
- **No support for social betting** – Betting is usually a solitary experience.
- **Low liquidity** – Except for major events like elections and big sports games.
- **Users can’t create their own markets** – Only centralized market creators can.
- **Cumbersome UX** – Difficult onboarding for non-crypto users.

---

## 💡 XO Market: A Next-Gen Social Prediction Market
XO Market is designed to overcome these limitations by introducing:

✅ **Liquidity-Sensitive LS-LMSR AMM** – A novel automated market maker optimized for any bet, making low-liquidity markets feasible.
✅ **Turn Any Social Media Post into a Bet** – Users can create markets from **Farcaster, Twitter, Telegram, and more**.
✅ **Be Your Own Bookie** – Market creators can **set custom fees (0% - 2%)**.
✅ **Multi-System Resolution** – Combining AI-agent and zkTLS solutions for market verification.

---

## 🌟 Unique Selling Points (USP)
🔹 **One-click betting** using **Privy Wallets** (no complex wallet setup required).  
🔹 **Social-powered markets** utilizing **Farcaster Neynar Hubstack**.  
🔹 **Revenue-sharing model** where **market creators earn transaction fees**.  
🔹 **Built on an advanced blockchain stack:**
   - **Privy** for authentication & key management.
   - **ABC stack from Gelato** for a native rollup.
   - **Celestia** for scalable data availability.

---

## 🏗️ Tech Stack
XO Market leverages cutting-edge Web3 technologies:
- **Privy** – Authentication & key management.
- **Gelato ABC Stack** – Native rollup infrastructure.
- **Celestia** – Modular blockchain data availability layer.
- **Neynar Hubs** – Farcaster integration for social betting.

---

## 📁 Repository Structure
```bash
mamothon_xoMarket/
│── smartcontracts/    # Blockchain smart contracts
│── data-service/      # Backend data service
│── frontend/          # Web interface
│── README.md          # Documentation
```

Each subdirectory contains its own dependencies and project-specific files.

---

## ⚙️ Installation & Setup
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/xo-market/mamothon_xoMarket.git
cd mamothon_xoMarket
```

### 2️⃣ Install Dependencies
Each subproject has its own dependencies. Navigate to each subdirectory and install them:
```bash
cd smartcontracts
npm install # or pnpm install
docker-compose up -d  # If using blockchain locally

cd ../data-service
npm install # or pnpm install

cd ../frontend
npm install # or pnpm install
```

### 3️⃣ Run Each Service
#### Smart Contracts (Hardhat/Foundry)
```bash
cd smartcontracts
npm run compile  # Compile contracts
npm run test     # Run tests
npm run deploy   # Deploy contracts (make sure to configure .env)
```

#### Data Service Backend
```bash
cd data-service
npm start
```

#### Frontend
```bash
cd frontend
npm run dev
```

---

## 🛠️ Development & Contribution
### 1️⃣ Branching Strategy
- **`main`** – Stable production-ready code.
- **`dev`** – Ongoing development.
- **Feature branches** – New features or fixes (`feature/xyz`).

### 2️⃣ Code Guidelines
- Use **TypeScript** where applicable.
- Ensure **Prettier** and **ESLint** are followed.
- Write unit tests for new features.

### 3️⃣ Submitting a Pull Request (PR)
1. Fork the repo & create a branch.
2. Commit changes with clear messages.
3. Open a PR and request a review.

---

## 🌍 Environment Variables
Each service has an `.env` file. Example:
```ini
PRIVATE_KEY=your_private_key
RPC_URL=https://your_rpc_endpoint
DATABASE_URL=postgres://user:password@localhost:5432/dbname
```
Make sure to create `.env` files based on the provided `.env.example` templates in each directory.

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 🤝 Acknowledgments
Special thanks to the Celestia, Encode teams, and hackathon contributors for their efforts in making this Hackathon a success!

---

### 🔗 Links
- 🌐 [XO Market Website](https://xo-frontend-staging.web.app/) *(Live frontend demo)*

