# 🎒 Campus Lost & Found System

A full-stack web application for managing lost and found items within a campus. Users can report lost or found items, and the system intelligently matches them. It also includes a secure claim process using hidden identifier verification to prevent fraudulent claims.

---

## 🚀 Features

- 🔐 User Authentication (JWT based)
- 📦 Report Lost Items
- 📍 Report Found Items
- 🤖 Smart Matching System
- 🔒 Hidden Identifier Verification
- 📊 Admin Dashboard for management

---

## 🛠️ Tech Stack

- Frontend: React.js, Tailwind CSS  
- Backend: Node.js, Express.js  
- Database: MongoDB  
- Authentication: JWT, bcrypt  

---

## ⚙️ How It Works

1. User reports a lost item  
2. Another user reports a found item  
3. System matches items based on details  
4. User claims item by providing hidden detail  
5. Admin verifies and approves claim  

---

## ▶️ Run Locally

```bash
git clone https://github.com/shiv930/Campus-Lost-and-Found-System/tree/main
cd lost-found
npm install
npm run dev
