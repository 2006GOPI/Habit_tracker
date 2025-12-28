# Hosting Guide: Render vs Netlify

## Short Answer
**Use Render.**

Since your application has a **Node.js Backend** and a **React Frontend** combined, **Render** is the best choice. It can run the backend server that you need.

**Netlify** is designed mainly for static websites (just the frontend). To host this app on Netlify, you would have to split the code or simple rewrite the backend, which is complicated.

---

## 🚀 How to Host on Render (Free)

### ⚠️ Critical Warning regarding your Local Database
On the **Render Free Tier**, the file system is **Ephemeral** (Temporary).
*   **What this means:** Every time you deploy new code, or if the server "sleeps" and wakes up (which happens daily on free plans), **server/data/db.json will reset** to the initial state.
*   **Result:** Users will lose their registered accounts/habits upon server restart.
*   **Fix:** For a serious app, you need a real cloud database (Render PostgreSQL or MongoDB Atlas). For a portfolio demo, this is acceptable, but you should mention it in your README.

### Step-by-Step Instructions

1.  **Push to GitHub**
    *   Make sure your code is pushed to a GitHub repository.

2.  **Create Web Service on Render**
    *   Go to [dashboard.render.com](https://dashboard.render.com/)
    *   Click **New +** -> **Web Service**
    *   Connect your GitHub repository.

3.  **Configure Settings**
    *   **Name**: `routine-rocket` (or whatever you want)
    *   **Region**: Closest to you
    *   **Branch**: `main` (or master)
    *   **Root Directory**: `.` (Leave explicitly blank/default)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm run deploy`
        *   *This runs the script we made: install all deps, build client, start server.*
    *   **Start Command**: `npm start`
    *   **Environment Variables**:
        *   Add `NODE_VERSION` = `20` (Recommended)

4.  **Deploy**
    *   Click **Create Web Service**.
    *   Wait for the build to finish. It will take a few minutes to install and build everything.

5.  **Done!**
    *   Render will give you a URL (e.g., `https://routine-rocket.onrender.com`).
