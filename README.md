# Blockchain-Based Certificate Verification & File Integrity System

## 📌 Description

This project is a secure, decentralized certificate verification system that ensures **data integrity and authenticity** using **Blockchain and IPFS**.

It allows institutes to issue certificates, users to manage them, and verifiers to validate authenticity without relying on centralized systems.

---

## 🎯 Features

* 🔐 Role-based authentication (Admin, Institute, User, Verifier)
* 🏫 Institute approval system (Admin controlled)
* 📄 Certificate issuance by approved institutes
* 🌐 File storage using IPFS (Pinata)
* ⛓ Blockchain-based certificate integrity verification
* 👤 User-controlled access requests for verification
* 🔍 Verifier can validate certificate authenticity
* 🌗 Light/Dark mode UI
* 📊 Professional dashboards for each role

---

## 🛠 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer

### Blockchain

* Solidity
* Hardhat
* Ethers.js
* Sepolia Testnet
* Alchemy RPC

### Storage

* IPFS (Pinata)

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── config/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   └── api/
│
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   └── config/
│
├── .env.example
└── README.md
```

---

## ⚙️ Installation & Execution Steps

### 1️⃣ Clone Repository

```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

---

### 2️⃣ Setup Backend

```
cd backend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the **backend** and **blockchain** folders and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Admin Credentials
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# IPFS (Pinata)
PINATA_JWT=your_pinata_jwt_token

# Blockchain
RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
ETHERSCAN_API_KEY=your_etherscan_api_key
```
---

Run backend:

```
node server.js
```

---

### 3️⃣ Setup Frontend

```
cd frontend
npm install
npm start
```

---

### 4️⃣ Setup Blockchain

```
cd blockchain
npm install
```

Compile contract:

```
npx hardhat compile
```

Deploy contract:

```
npx hardhat run scripts/deploy.js --network sepolia
```

---

### 5️⃣ Run the Project

* Backend → http://localhost:5000
* Frontend → http://localhost:3000



## 🔄 System Workflow

1. Institute registers and raises approval request
2. Admin approves institute
3. Institute issues certificate → uploaded to IPFS
4. CID stored on Blockchain
5. User receives certificate
6. Verifier requests access
7. User approves request
8. Verifier uploads file → compared with blockchain CID
9. Output: **Authentic / Tampered**

---

## 📸 Screenshots (Optional)

*Add screenshots of dashboards here*

---

## 🚀 Future Scope

* QR-based certificate verification
* Mobile application
* Multi-chain support
* AI-based fraud detection
* Public verification portal

---

## 👨‍💻 Author

**C T Ullas**
MCA, RV College of Engineering

---

## 📌 Note

This project was developed as part of the **Major Project (MCA491P)** and **Project Management (MCA293E4)** coursework.
