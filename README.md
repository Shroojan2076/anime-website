# MyAnimeSite - Full Stack Anime Discovery & Watchlist Tracker

```text
  ___  ___       ___         _                  _____ _ _       
  |  \/  |      / _ \       (_)                /  ___(_) |      
  | .  . |_   _/ /_\ \ _ __  _ _ __ ___   ___  \ `--. _| |_ ___ 
  | |\/| | | | |  _  || '_ \| | '_ ` _ \ / _ \  `--. \ | __/ _ \
  | |  | | |_| | | | || | | | | | | | | |  __/ /\__/ / | ||  __/
  \_|  |_/\__, \_| |_/|_| |_|_|_| |_| |_|\___| \____/|_|\__\___|
           __/ |                                                
          |___/                                                 
```

> **Live Deployment Links:**
> * **Frontend (Vercel):** [https://anime-website-client-alpha.vercel.app/](https://anime-website-client-alpha.vercel.app/)
> * **Backend API (Render):** [https://anime-website-server-kji1.onrender.com](https://anime-website-server-kji1.onrender.com)
> * **Database:** Serverless PostgreSQL on Neon.tech

---

## Overview

Hey! This is a full-stack web application I built to discover anime, explore detailed metadata, and maintain a personalized tracking watchlist with real-time episode counts and scores.

Instead of hardcoding dummy data or over-complicating things with massive enterprise frameworks, I wanted to build a clean, textbook decoupled application from scratch:
* A modern **React Single Page Application (SPA)** on the frontend with custom Vanilla CSS.
* A lightweight, stateless **Node.js + Express REST API** in the middle.
* A live **PostgreSQL** database on the backend storing user watchlist records.
* Integration with the public **MyAnimeList (MAL) API v2** for live search and metadata.

---

## Key Features

### [1] Discovery & Search
* **Unified Navbar Search:** Clean search input right in the top navigation bar with instant query parameter routing (`/search?q=...`). No duplicate search bars cluttering the pages.
* **Explore Page with Dynamic Sorting:** Search results can be sorted on the fly by:
  * `Relevance` (default MAL algorithm)
  * `Title (A - Z)` (alphabetical order)
  * `Rating (High to Low)` (MAL community score)
  * `Episodes (Most)` (total episode count)
* **Genre Pills & Trending Highlights:** One-click shortcuts for popular genres (Action, Shounen, Supernatural, Sci-Fi, Fantasy, Romance) and quick trending searches.
* **Infinite/Paging Support:** Next-page fetching straight from the MAL API stream.

### [2] Personal Library & Watchlist
* **Full CRUD Operations:** Add anime, update viewing status, adjust personal ratings, increment watched episodes, and delete entries.
* **Status Tab Filtering:** Easily switch between `All`, `Watching`, `Completed`, `Plan to Watch`, `On Hold`, and `Dropped`.
* **Quick Progress Tracker:** One-click `+1 ep` increment button right on each watchlist card without having to open edit modals.
* **Watchlist Sorting:** Sort your saved library by `Recently Updated`, `Rating`, `Title (A - Z)`, or `Episodes Watched`.
* **Database Fallback:** If the external MAL API ever has downtime or rate-limits, details pages fall back to metadata already saved in PostgreSQL.

---

## Architecture & Data Flow

```text
+-------------------------------------------------------------+
|                     Client (React 19 + Vite)                |
|  - React Router 7 (SPA navigation & rewrites via vercel.json) |
|  - Vanilla CSS theme system (dark mode, glassmorphism)      |
|  - State management via useState, useEffect, useMemo        |
+------------------------------+------------------------------+
                               |
                   HTTP / JSON | (REST API via fetch)
                               v
+-------------------------------------------------------------+
|                  Server (Express 5 on Node.js)              |
|  - Stateless REST endpoints (/search, /anime/:id, /watchlist)|
|  - Permissive CORS handling for production domains          |
|  - Native node fetch client for external MAL requests       |
+----------------+-----------------------------+--------------+
                 |                             |
     SQL Queries | (node-pg pool)   REST Calls | (X-MAL-CLIENT-ID)
                 v                             v
+--------------------------------+  +-------------------------+
|     PostgreSQL (Neon Cloud)    |  |     MyAnimeList API     |
|  - anime (cached metadata)     |  |  - api.myanimelist.net  |
|  - watchlist (user tracking)   |  |  - Real-time catalog    |
+--------------------------------+  +-------------------------+
```

---

##  Tech Stack

### Frontend (`/client`)
* **Core:** React 19, JavaScript (ESModules)
* **Tooling & Bundler:** Vite 8
* **Routing:** React Router DOM v7
* **Styling:** 100% Vanilla CSS (`theme.css` + `style.css`)
  * Custom dark palette with HSL-tailored accents
  * Responsive layout using CSS Grid & Flexbox
  * Zero bulky CSS frameworks (no Tailwind or Bootstrap bloat)
* **Hosting:** Vercel

### Backend (`/server`)
* **Runtime:** Node.js (v20+)
* **Framework:** Express 5
* **Database Driver:** `pg` (node-postgres connection pool)
* **Cross-Origin Handling:** `cors`
* **Configuration:** `dotenv`
* **Hosting:** Render

### Database
* **Engine:** PostgreSQL 16
* **Provider:** Neon.tech (Serverless Cloud Postgres)
* **Schema Initialization:** Automated boot check (`CREATE TABLE IF NOT EXISTS`)

---

##  Database Schema

The database consists of two straightforward relational tables linked by a foreign key constraint:

```sql
-- Cached anime metadata
CREATE TABLE IF NOT EXISTS anime (
    id SERIAL PRIMARY KEY,
    mal_id INT NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    poster TEXT,
    media_type VARCHAR(50),
    synopsis TEXT,
    episodes INT,
    status VARCHAR(100),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User tracking details
CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    anime_id INT NOT NULL UNIQUE REFERENCES anime(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'plan_to_watch',
    episodes_watched INT DEFAULT 0,
    score DECIMAL(3, 1),
    started_at DATE,
    completed_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Reference

### Anime & Search
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `?q=<term>` | Search anime catalog via query string |
| `POST` | `/` | `{ "query": "<term>" }` | Search anime catalog via request body |
| `GET` | `/next` | `?url=<mal_paging_url>` | Fetches next pagination batch from MAL |
| `GET` | `/anime/:mal_id` | Path param `:mal_id` | Returns full anime details + watchlist status |

### Watchlist Management
| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/watchlist` | None | Returns all anime saved in user's watchlist |
| `POST` | `/watchlist/add` | `{ mal_id, title, poster, media_type, ... }` | Inserts anime and adds entry to watchlist |
| `PUT` | `/watchlist/:mal_id` | `{ status, episodes_watched, score }` | Updates progress, rating, or watch status |
| `DELETE` | `/watchlist/:mal_id` | None | Removes the specified anime from watchlist |

---

## Local Setup & Installation

If you want to run this project on your own machine, follow these steps:

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **PostgreSQL** (running locally on port 5432, or a free [Neon](https://neon.tech) connection string)
* **Git**

### 1. Clone the repository
```bash
git clone https://github.com/Shroojan2076/anime-website.git
cd anime-website
```

### 2. Configure & Run Backend (`/server`)
1. Move into the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server/` directory:
   ```env
   PORT=3000
   
   # Option A: Cloud database URL (Neon, Supabase, etc.)
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require

   # Option B: Local Postgres fallback
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=your_postgres_password
   PG_DATABASE=myanimesite

   # MAL API Public Client ID
   MAL_CLIENT_ID=6dc871f8d1aa947c33800a696f65fc52
   MAL_CLIENT_SECRET=38962dcc76ffe79069519ec0b89765be0d7485daaa5155d953010e4604ada980

   # Client origin allowed by CORS
   CLIENT_URL=http://localhost:5173
   ```

3. Start the server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend will start at `http://localhost:3000` and automatically create the required database tables.

### 3. Configure & Run Frontend (`/client`)
1. Open a new terminal, navigate into `client/`, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. (Optional) Create a `.env` file in `client/` if your backend is running on a port other than 3000:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## What I Learned While Building This

* **Client vs. Server Separation:** Early on, the backend was handling UI rendering and session redirects with EJS. Decoupling the server into a clean JSON REST API and letting React manage the client state made the architecture much more flexible and easy to deploy.
* **Why Bundling Matters:** Seeing how Vite processes JSX into a single minified JavaScript bundle and uses content hashing (cache busting) in `/dist` made production builds much clearer.
* **Handling Cloud Postgres SSL:** Learning that managed cloud providers like Neon require SSL configurations (`ssl: { rejectUnauthorized: false }`) while local setups do not.
* **SPA Routing on Vercel:** Discovering why client-side React routes 404 on refresh in production without a `vercel.json` rewrite rule to redirect incoming traffic back to `/index.html`.
* **Zero Bloat Aesthetics:** You do not need massive 50MB CSS frameworks to make a website look modern. Plain CSS variables, clean flex layouts, and thoughtful typography can achieve a great look while keeping load times under 150ms.

---

##  Author

* **Created by:** Shroojan Dhok
* **GitHub:** [@Shroojan2076](https://github.com/Shroojan2076)
* **LinkedIn:** [@shroojan-dhok-679a73377](https://www.linkedin.com/in/shroojan-dhok-679a73377/)
* **Repository:** [https://github.com/Shroojan2076/anime-website](https://github.com/Shroojan2076/anime-website)
