# Syntropy Deployment Guide

This project is deployed as two services:

- Frontend: React app on Vercel
- Backend: Express API on Render
- Database: PostgreSQL on Render

## Project Structure

```text
syntropy/
├── public/                    # React public assets
├── src/
│   ├── Backend/
│   │   ├── config/            # Database and Passport config
│   │   ├── middleware/         # Auth middleware
│   │   ├── models/             # Sequelize models
│   │   ├── routes/             # Express API routes
│   │   └── server.js           # Backend entrypoint for Render
│   ├── Frontend/               # React pages and components
│   ├── App.js
│   └── index.js
├── package.json                # Frontend and backend scripts
├── render.yaml                 # Render backend + database config
├── vercel.json                 # Vercel frontend config
└── .env                        # Local-only environment variables
```

## Important URLs

Use these placeholders until your real deployment URLs are created:

```text
Render backend: https://expense-tracker-9fpm.onrender.com
Vercel frontend: https://your-vercel-app.vercel.app
Google callback: https://expense-tracker-9fpm.onrender.com/api/auth/google/callback
```

After Vercel gives you the real frontend URL, replace `https://your-vercel-app.vercel.app` in Render with the real URL.

## Local Environment Variables

Keep `.env` local. Do not commit secrets.

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_local_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
MISTRAL_API_KEY=your_mistral_api_key
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Deploy Backend on Render

1. Push this repository to GitHub.
2. Open Render and choose **New +**.
3. Choose **Blueprint** if you want Render to use `render.yaml`.
4. Connect your GitHub repository.
5. Render will create:
   - `expense-tracker-9fpm`
   - `syntropy-db`
6. In the `expense-tracker-9fpm` environment variables, set:

```text
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MISTRAL_API_KEY=your_mistral_api_key
FRONTEND_URL=https://your-real-vercel-url.vercel.app
```

`DATABASE_URL` and `JWT_SECRET` are handled by `render.yaml`.

7. Deploy the backend.
8. Test this URL in the browser:

```text
https://expense-tracker-9fpm.onrender.com/
```

Expected response:

```json
{ "message": "Backend is running!" }
```

## Deploy Frontend on Vercel

1. Open Vercel and choose **Add New Project**.
2. Import the same GitHub repository.
3. Use these settings:

```text
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

4. Add these Vercel environment variables:

```text
REACT_APP_API_URL=https://expense-tracker-9fpm.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

5. Deploy the frontend.
6. Copy the final Vercel URL.
7. Go back to Render and update:

```text
FRONTEND_URL=https://your-real-vercel-url.vercel.app
```

8. Redeploy the Render backend.

## Google OAuth Setup

In Google Cloud Console, open your OAuth client and add:

Authorized JavaScript origins:

```text
http://localhost:3000
https://your-real-vercel-url.vercel.app
```

Authorized redirect URIs:

```text
http://localhost:5000/api/auth/google/callback
https://expense-tracker-9fpm.onrender.com/api/auth/google/callback
```

## What Was Changed for Deployment

- `vercel.json` now uses `REACT_APP_API_URL`, matching the frontend code.
- `render.yaml` now runs `npm install`, so Render installs build tooling such as CRACO.

## Quick Verification Commands

Run these before pushing:

```bash
npm run build
npm run start:backend
```

The backend should start on port `5000` locally unless `PORT` is set.
