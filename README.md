# Ringo

Ringo is a lightweight real-time chat application built with a Next.js frontend and a Node.js backend. It includes support for servers, channels, direct messages, friends, invites, and realtime messaging via WebSockets.

**Features**
- **Real-time chat:** Servers, channels, direct messages, and threaded messages.
- **Authentication:** Signup, login, password reset, and session endpoints.
- **User management:** Friends, friend requests, and user search.
- **Server management:** Create/join servers and manage invites.
- **File uploads:** Uploads endpoint for attachments and images.
- **WebRTC & voice:** Basic WebRTC helpers and voice room components for audio chat.
- **Admin API:** Basic admin users route for managing users.

**Tech stack**
- Frontend: Next.js (app directory), React, Tailwind/CSS
- Backend: Node.js (ES modules), Express-style routes (in `server/`), WebSocket socket server in `socket/`
- Database: (project models provided under `models/`)

**Repository layout**
- `frontend/` — Next.js app and client-side code.
- `server/` — API server, models, and helper libraries.
- `socket/` — WebSocket server implementation.

Prerequisites
- Node.js 18+ (recommended)
- npm or yarn

Getting started (development)
1. Clone the repo and open the project root.
2. Install root dependencies (if present) and workspace packages:

```bash
# from project root
npm install

# install frontend dependencies
cd frontend
npm install

# install server dependencies
cd ../server
npm install

# return to project root
cd ..
```

3. Start the development servers. In separate terminals, run:

```bash
# Start the frontend (Next.js dev)
cd frontend
npm run dev

# Start the backend server
cd ../server
npm run dev

# (Optional) Start the socket server
cd ../socket
node index.js
```

Common scripts
- Frontend: `npm run dev`, `npm run build`, `npm run start` (in `frontend/`).
- Server: `npm run dev` (in `server/`).

Testing & linting
- Frontend contains ESLint config (`frontend/eslint.config.mjs`) — run `npm run lint` in `frontend/` if configured.

Deployment
- Build the frontend with `npm run build` in `frontend/` and deploy to your provider (Vercel, Netlify, etc.).
- Run the `server/` app in a Node.js environment; ensure environment variables and database are configured.

Contributing
- Open issues for bugs or feature requests.
- Send pull requests with focused, testable changes.

Where to look next
- Frontend app entry: `frontend/app/page.tsx` and components in `frontend/components/`.
- Server API routes: `frontend/app/api/` (if using Next API routes) and `server/` for standalone server logic.
