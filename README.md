# mamothon_xoMarket
A social prediction market with Celestia underneath

## 🚀 Overview
Mamothon XO Market is a consolidated repository combining three essential components of the XO Market hackathon project:

- **Smart Contracts** (`smartcontracts/`): Blockchain-based logic for market interactions.
- **Data Service** (`data-service/`): Backend service for managing data storage and processing.
- **Frontend** (`frontend/`): The user interface for interacting with XO Market.

This repository is structured to facilitate development and deployment of the full XO Market ecosystem in one place.

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
Special thanks to the XO Market team and hackathon contributors, Celestia team, Encode team for their efforts in making this Hackathon a success!

---

### 🔗 Links
- 🌐 [XO Market Website]([#](https://xo-frontend-staging.web.app/)) 
- 🚀 [Frontend Demo](#) *(to be added later)*

