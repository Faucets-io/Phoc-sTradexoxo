
# CryptoTrade - Professional Cryptocurrency Exchange

A modern cryptocurrency trading platform built with React, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 Secure authentication system
- 💼 Portfolio management
- 📊 Real-time trading interface
- 💰 Deposit & withdrawal functionality
- 📱 Responsive design with dark mode
- 🚀 Production-ready deployment

## Deployment

### Deploying on Render

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file
4. Set the following environment variables in Render dashboard:
   - `SESSION_SECRET` (auto-generated)
   - `DATABASE_URL` (auto-configured with PostgreSQL addon)
5. Deploy!

### Deploying on Replit (Recommended)

This app is already configured for Replit Deployments:

1. Click the **Deploy** button
2. Choose **Autoscale** deployment
3. Configure environment variables:
   - `SESSION_SECRET` (use Secrets tool)
4. Add custom domain (optional)
5. Click **Deploy**

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5000`

## Build

```bash
npm run build
npm run start
```

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Wouter
- **Backend**: Express, TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Passport.js with sessions

