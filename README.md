# Routine Rocket - Habit Tracker

A modern, full-stack habit tracker application built with the PERN stack (PostgreSQL replaced with Local JSON), Express, React, and Node.js.

## 🚀 Quick Start

The application stores data in a local file (`server/data/db.json`), so no external database setup is required.

### 1. Start the Backend Server
The server runs on port **5000**.
```bash
cd server
npm install
npm start
```
*You will see "Mock Database Connected" when it's ready.*

### 2. Start the Frontend Client
The client runs on port **5173**.
Open a new terminal configuration:
```bash
cd client
npm install
npm run dev
```

### 3. Access the App
Open your browser and visit:  
**[http://localhost:5173](http://localhost:5173)**

## 📂 Project Structure
- **/server**: Node.js/Express backend with local JSON storage (`data/db.json`).
- **/client**: React + Vite frontend.

## ✨ Features
- **Local Data Persistence**: No database setup needed.
- **Authentication**: JWT-based login/register.
- **Habit Tracking**: Create, edit, delete, and log habits.
- **Mood & Health**: Track daily mood and health stats.
- **Visualizations**: Charts using Chart.js.
