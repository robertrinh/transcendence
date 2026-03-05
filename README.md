# Transcendence (ft_transcendence)

A single-page web-based **Pong** platform where you can create an account, play locally or against friends online, join tournaments, chat in real time, and manage your profile and privacy. This project was built for the ft_transcendence assignment at Codam. Made by [@robertrinh](https://github.com/robertrinh), [@rutgermeuzelaar](https://github.com/rutgermeuzelaar), [@joaovieira](https://github.com/joaovieira) and [@ekeln](https://github.com/ekeln)

---

## Table of contents

- [About](#about)
- [Instructions](#instructions)
- [Technical stack](#technical-stack)
- [Database schema](#database-schema)
- [Modules we chose](#modules-we-chose)
- [Contributors](#contributors)
- [Resources](#resources)
- [Extra](#extra)

---

## About

The idea is simple: you get a single-page app to play Pong with a proper backend. You can sign up, log in (or play as a guest), and then:


- **Play Pong** : locally with a friend on the same keyboard, against an AI, or remotely against someone else on the same site.
- **Join tournaments** : 4-player brackets with matchmaking and persistent results.
- **Use live chat** : see who's online, send direct messages, invite people to a game, get notified when your next tournament match is up.
- **Manage your profile** : display name, nickname, avatar, friends list, friend requests, block list. View your stats, match history, and leaderboard.
- **Stay in control of your data** : privacy policy, view/edit your data in Settings, anonymize your account, or delete it (GDPR-style options).
- **Guest accounts** can play and use chat but do not have access to profile, settings, or friends.

Authentication is JWT-based, with optional **Two-Factor Authentication (2FA)** via an authenticator app. Passwords are hashed, and the site runs over HTTPS.

---

## Instructions

To run Transcendence on your machine:

```bash
git clone <your-repository-url>
cd transcendence
make
```

Transcendence will run on **https://&lt;your-hostname&gt;:8443**. The first time you open it, your browser will warn about the self-signed certificate : accept it to continue.

- **Prerequisites:** Docker, Docker Compose, Git, OpenSSL (used by `make` to generate secrets and SSL certs).
- **What `make` does:** Runs `./setup.sh` (creates `.env` files and nginx SSL/htpasswd if they don't exist), then starts the full stack with Docker Compose in detached mode (backend, frontend, game server).
- **API docs:** https://&lt;your-hostname&gt;:8443/api/docs

### Make targets

| Command | Description |
|--------|-------------|
| `make` or `make all` | Setup + run production stack (detached). App on port 8443. |
| `make real` | Setup + run production stack in the foreground. |
| `make dev` | Setup + run dev stack with hot reload (foreground). App on port 8080. |
| `make dev-d` | Same as `make dev` but detached. |
| `make down` | Stop all containers. |
| `make clean` | Stop containers, remove volumes and images, delete `.env` and nginx certs. |
| `make re` | `make clean` then `make all`. |
| `make logs` | Follow container logs. |

**Note:** Remote (online) Pong does **not** work on the dev build (`make dev` / `make dev-d`). WebSockets for the game server are only set up in the production stack. Use `make` or `make real` to play against someone else online.

### Tests

Run these from the repo root. Make sure you've run `npm install` in `backend` (and `frontend` if needed) first.

- **Backend unit:** `cd backend && npm run test:unit`
- **Backend integration:** `cd backend && npm run test:integration`

---

## Technical stack

| Layer | Technologies | Notes |
|-------|--------------|--------|
| **Frontend** | TypeScript, React, Vite, Tailwind CSS, React Router, Recharts | Single-page app. Tailwind for styling (frontend module). Recharts for stats and graphs. |
| **Backend** | Node.js, Fastify, TypeScript, better-sqlite3, bcrypt, JWT, otplib, qrcode | REST API, SSE for chat, DynamicSwagger at `/api/docs`. |
| **Database** | SQLite (better-sqlite3) | Single file, no separate DB server; WAL mode. Keeps things simple and matches the subject requirement. |
| **Game server** | Python (asyncio), WebSockets | Server-authoritative Pong: it runs the game, receives moves, syncs state, and tells the backend when a game ends. |
| **Run / DevOps** | Docker, Docker Compose, nginx (in frontend container), GitHub Actions | One-command run; HTTPS and reverse proxy in the frontend container. CI runs on every pull request. |

We use **Fastify** for the backend (as required by the subject), **React + Tailwind** for the frontend, and **SQLite** so we don't need a separate database process. Chat is done with **Server-Sent Events (SSE)** so we can stream messages over the same origin and auth; the Python game server handles only WebSocket game traffic.

---

## Database schema

We use **SQLite** with the following main tables.

**Overview**

- **users** : Accounts: username, hashed password, email, avatar, 2FA fields, guest/anonymous flags.
- **avatars** : Stored avatar file paths.
- **friends** / **friend_request** : Friend links and pending requests.
- **blocked** : Block list.
- **games** : Individual Pong matches (player1_id, player2_id, scores, winner_id, tournament_id, round, status).
- **tournaments** : Tournament metadata (name, status, winner_id, max 4 participants).
- **tournament_participants** : Which users are in which tournament.
- **game_queue** : Matchmaking queue (player_id, lobby_id, private flag).
- **chat_messages** : Chat log (user_id, message, timestamp).

**Relationships (conceptual)**

```
avatars (id)
    ↑
users (id, username, nickname, display_name, password, email, avatar_id, status,
       two_factor_secret, two_factor_enabled, is_anonymous, anonymized_at, is_guest)
    │
    ├── friends (user_id, friend_id)
    ├── friend_request (requester_id, requested_id)
    ├── blocked (user_id, blocked_id)
    ├── game_queue (player_id, lobby_id, private)
    ├── games (player1_id, player2_id, winner_id, tournament_id, round, status, ...)
    ├── tournament_participants (tournament_id, user_id)
    └── chat_messages (user_id, message, timestamp)

tournaments (id, name, status, winner_id, created_by, max_participants=4)
    ├── games (tournament_id, round)
    └── tournament_participants (tournament_id, user_id)
```

**Key fields**

| Table | Key fields | Types |
|-------|------------|--------|
| **users** | id, username, password, email, avatar_id, two_factor_*, is_anonymous, anonymized_at, status | INTEGER PK, TEXT, BOOLEAN, DATETIME |
| **games** | id, player1_id, player2_id, score_*, winner_id, tournament_id, round, lobby_id, status | status: pending / ready / ongoing / finished / cancelled |
| **tournaments** | id, name, status, winner_id, max_participants | status: open / ongoing / finished / cancelled |
| **chat_messages** | id, user_id, message, timestamp | message &lt; 256 chars |

Full schema and constraints are in `backend/dump.sql`.

---

## Modules we chose

The subject asks for at least **7 major modules**. Points: **Major = 2 pts, Minor = 1 pt**; two minor count as one major.

**What we implemented**

- **Use a framework to build the backend** *(Major)* : Fastify with Node.js and TypeScript. REST API, SSE for chat, Swagger at `/api/docs`.
- **Use a framework or toolkit for the frontend** *(Minor)* : React, Vite, TypeScript, and Tailwind CSS.
- **Use a database for the backend** *(Minor)* : SQLite via better-sqlite3. Schema in `dump.sql`, init in `databaseInit.ts`.
- **Standard user management, authentication, users across tournaments** *(Major)* : Register, login, profile (display name, nickname, avatar), friends, friend requests, block list. Tournaments use real user accounts and persistent stats.
- **Remote players** *(Major)* : Python game server over WebSockets. Server-authoritative Pong with heartbeat/ping.
- **Live chat** *(Major)* : SSE stream at `/api/chat/stream`. Join, send messages, DMs, online list, invite to game, tournament notifications. History stored in the DB.
- **Introduce an AI opponent** *(Major)* : Client-side AI in `frontend/src/static/ai.ts`: raycasting, target prediction, updates with quick intervals.
- **User and game stats dashboards** *(Minor)* : Profile page (wins, losses, win rate, match history), leaderboard, data visualisation with graphs.
- **GDPR compliance** *(Minor)* : Privacy policy, anonymize profile, delete account, view/edit your data in Settings.
- **Two-Factor Authentication (2FA) and JWT** *(Major)* : JWT on all protected routes. TOTP 2FA with otplib; setup, enable, verify endpoints; QR code for authenticator apps.

**Summary:** 7 Major (14 pts) + 4 Minor (4 pts).

| Module | Type | Implementation |
|--------|------|----------------|
| Backend framework | Major | Fastify (Node.js) + TypeScript, REST, SSE, Swagger |
| Frontend framework/toolkit | Minor | React, TypeScript, Tailwind CSS |
| Database | Minor | SQLite (better-sqlite3), `dump.sql`, `databaseInit.ts` |
| User management & auth across tournaments | Major | Register, login, profile, friends, blocks, tournaments |
| Remote players | Major | Python WebSocket game server |
| Live chat | Major | SSE `/api/chat/stream`, DMs, online list, invites, blocking |
| AI opponent | Major | Client-side AI in `frontend/src/static/ai.ts` |
| Stats dashboards | Minor | Profile, leaderboard, Recharts |
| GDPR (anonymize, delete, view/edit data) | Minor | Privacy policy and GDPR options |
| 2FA and JWT | Major | JWT + TOTP (otplib), QR code |

---

## The big team

Check out the contributors!
- [@robertrinh](https://github.com/robertrinh)
- [@rutgermeuzelaar](https://github.com/rutgermeuzelaar)
- [@joaovieira](https://github.com/joaovieira)
- [@ekeln](https://github.com/ekeln)

---

## Resources

- [Pong (1972)](https://en.wikipedia.org/wiki/Pong) : original game
- [Fastify](https://fastify.dev/) : backend framework
- [React](https://react.dev/) : frontend
- [Vite](https://vitejs.dev/) : build and dev server
- [Tailwind CSS](https://tailwindcss.com/) : styling
- [SQLite](https://www.sqlite.org/) : database
- [JWT (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519)
- [TOTP (RFC 6238)](https://datatracker.ietf.org/doc/html/rfc6238) : 2FA
- [GDPR (EU data protection)](https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Docker](https://docs.docker.com/)

---

## Extra

- **API docs:** When the app is running, OpenAPI/Swagger is at `/api/docs`.
- **Limitations:** Remote (online) Pong does not work on the dev build : WebSockets for the game server are only configured in the production stack. In production, remote play needs the game server and nginx WebSocket proxy. Self-signed HTTPS means you have to accept the certificate in the browser once.
- **License:** See the repo or project guidelines.
