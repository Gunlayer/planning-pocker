# Planning Poker – Real-Time Agile Estimation App

A simple and lightweight WebSocket-powered app for running agile estimation sessions (a.k.a. planning poker) with live collaboration.

## Features

- Real-time room creation with multiple participants
- Live voting and card reveal/reset
- WebSocket-based messaging (no polling)
- Light/dark theme toggle with system preference support (Tailwind v4)
- Modern React + TypeScript + Tailwind stack

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Zustand, Tailwind CSS
- **Backend:** Node.js, `ws` WebSocket server
- **Tooling:** ESLint, Prettier, tsx (dev server)

## How to Run

require node 20+

### Install dependencies

```bash
npm install
```

### Start UI

```bash
npm run dev
```

### Start server

```bash
npm run server
```
