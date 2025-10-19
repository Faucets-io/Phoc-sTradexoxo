# CryptoTrade - Cryptocurrency Exchange Platform

## Overview

CryptoTrade is a professional cryptocurrency trading platform that enables users to trade digital assets, manage portfolios, and execute transactions. Built as a full-stack web application, it provides real-time market data, order management, and secure wallet functionality with a modern, responsive interface inspired by established exchanges like Binance and ZYTE.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for client-side routing (lightweight alternative to React Router)
- Mobile-first responsive design with dedicated bottom navigation for mobile devices

**UI Component System**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, forms, etc.)
- shadcn/ui component library built on top of Radix UI
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for managing component variants
- Custom theme system supporting light/dark modes with CSS variables

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Custom query client with credential-based authentication handling
- WebSocket integration for real-time price updates and market data
- Local state management using React hooks (useState, useEffect, useContext)

**Design System**
- Typography: Inter (UI/body), Plus Jakarta Sans (display), JetBrains Mono (numbers/prices)
- Color palette: Bright yellow primary (#FBC02D), green for buy actions, red for sell actions
- Component styling follows Material Design principles with rounded corners and soft shadows
- Consistent spacing and layout grid system

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- Session-based authentication using express-session
- RESTful API design with `/api/*` endpoint namespace
- WebSocket server on port 5001 for real-time data streaming

**Authentication & Authorization**
- Session-based authentication with HTTP-only cookies
- bcrypt.js for password hashing
- Custom authentication middleware (`requireAuth`) protecting sensitive routes
- Session persistence with configurable storage backend

**Database Layer**
- Drizzle ORM for type-safe database queries and schema management
- Neon serverless PostgreSQL as the database provider
- Connection pooling via @neondatabase/serverless
- Schema definitions include: users, wallets, orders, trades, transactions

**API Design**
- Authentication endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Trading endpoints: `/api/orders`, `/api/trades/history`
- Portfolio endpoints: `/api/wallets`, `/api/transactions`
- Market data endpoints: `/api/markets`, `/api/markets/price/:pair`, `/api/markets/orderbook/:pair`
- Transaction endpoints: `/api/transactions/deposit`, `/api/transactions/withdraw`

**Real-time Data Architecture**
- WebSocket server for pushing live price updates to connected clients
- Integration with CoinGecko API for cryptocurrency price data
- In-memory price cache with periodic updates
- Client-side WebSocket hook (`useWebSocket`) for consuming real-time data

### Data Models

**Core Entities**
- **Users**: Authentication credentials and profile information
- **Wallets**: Multi-currency balances with unique addresses per currency
- **Orders**: Trading orders with support for market and limit types, buy/sell sides
- **Trades**: Executed trade records linking buy and sell orders
- **Transactions**: Deposit and withdrawal records with status tracking

**Database Schema Features**
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- Decimal precision (20, 8) for cryptocurrency amounts to handle fractional values
- Cascade deletion for user-related records
- Timestamp tracking for order execution and transaction processing

### Security Considerations

**Authentication Security**
- Password hashing with bcrypt (salt rounds not specified in code)
- Session secrets stored in environment variables
- HTTP-only cookies preventing XSS attacks
- Secure cookies in production (HTTPS only)

**API Security**
- Credential-based requests (`credentials: "include"`) for CORS
- Authentication middleware protecting sensitive endpoints
- Session expiration set to 7 days
- Input validation using Zod schemas on both client and server

### Development & Deployment

**Development Workflow**
- TypeScript with strict mode enabled for type safety
- Vite development server with HMR for rapid iteration
- Separate build processes for client (Vite) and server (esbuild)
- Path aliases (`@/`, `@shared/`, `@assets/`) for clean imports

**Build Process**
- Client: Vite bundles React application to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- ESM module format throughout the application
- Production mode uses NODE_ENV environment variable

**Environment Configuration**
- Required environment variables: `DATABASE_URL`, `SESSION_SECRET`
- Development server runs on port 5000 (configurable)
- WebSocket server on port 5001
- Database migrations managed via Drizzle Kit

## External Dependencies

### Third-Party Services

**Cryptocurrency Data Provider**
- CoinGecko API for real-time and historical cryptocurrency prices
- Endpoints used: `/api/v3/simple/price` with market cap, volume, and 24h change data
- Fallback to cached prices if API requests fail
- Supports: Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Solana (SOL)

**Database Infrastructure**
- Neon serverless PostgreSQL database
- WebSocket-based connection via `@neondatabase/serverless`
- Automatic connection pooling and scaling

### Key NPM Dependencies

**Core Framework**
- `express` - Web server framework
- `react`, `react-dom` - UI framework
- `typescript` - Type safety
- `vite` - Build tool and dev server

**Database & ORM**
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Schema migrations
- `@neondatabase/serverless` - Neon PostgreSQL driver

**Authentication**
- `express-session` - Session management
- `bcryptjs` - Password hashing
- `connect-pg-simple` - PostgreSQL session store (imported but may not be actively used)

**UI Components**
- `@radix-ui/*` - Accessible component primitives (20+ packages)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon library

**State & Data Management**
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation integration

**Utilities**
- `wouter` - Lightweight routing
- `date-fns` - Date formatting
- `clsx`, `tailwind-merge` - Conditional class merging
- `ws` - WebSocket implementation
- `nanoid` - ID generation

**Development Tools**
- `tsx` - TypeScript execution for development
- `esbuild` - Server bundling for production
- `@replit/vite-plugin-*` - Replit-specific development plugins

### Browser APIs Used
- WebSocket API for real-time communication
- LocalStorage for theme persistence
- Fetch API for HTTP requests
- Session Storage (via express-session cookies)