# Ringo

This repository is split into two deployable apps:

- `frontend/` - Next.js app for Vercel. It owns pages, UI, auth/API routes, MongoDB HTTP APIs, and Cloudinary uploads.
- `server/` - Standalone Socket.IO realtime server for Railway. It owns chat realtime events, presence, DMs, and voice signaling.

## Local Development

Install dependencies separately when cloning either folder as its own repo:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd server
npm install
npm run dev
```

From this combined workspace, helper scripts are available:

```bash
npm run frontend:dev
npm run server:dev
```

## Environment

Copy `frontend/.env.example` to `frontend/.env.local` and `server/.env.example` to `server/.env.local`.

Frontend needs:

```env
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=ringo
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
REALTIME_INTERNAL_URL=http://localhost:4000
REALTIME_INTERNAL_SECRET=
```

Server needs:

```env
MONGODB_URI=
JWT_SECRET=
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
REALTIME_INTERNAL_SECRET=
```

Use the same `JWT_SECRET`, `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, and `REALTIME_INTERNAL_SECRET` in both deployments.

## Deployment

Deploy `server/` to Railway first. Set `CLIENT_ORIGIN` to the final Vercel frontend URL once you have it. Railway should run:

```bash
npm start
```

Deploy `frontend/` to Vercel. Set `NEXT_PUBLIC_SOCKET_URL` to the Railway public URL, for example:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-railway-service.up.railway.app
REALTIME_INTERNAL_URL=https://your-railway-service.up.railway.app
```

If either public URL changes, update the matching environment variable and redeploy.
