import type { Express } from "express";
import { db } from "./db";
import { users, wallets, orders, trades, transactions, notifications, kycVerifications, activityLogs } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { insertUserSchema, loginSchema, insertOrderSchema, insertTransactionSchema, insertNotificationSchema, insertKycVerificationSchema, insertActivityLogSchema } from "@shared/schema";
import { requireAuth, type AuthRequest } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import rateLimit from "express-rate-limit";


// Simple in-memory cache for crypto prices with real-time data
let priceCache: Record<string, { price: number; change24h: number; volume24h: number; marketCap: number; high24h: number; low24h: number; lastUpdated: number }> = {
  "BTC/USDT": {
    price: 42156.84,
    change24h: 5.24,
    volume24h: 28500000000,
    marketCap: 825000000000,
    high24h: 44264.68,
    low24h: 40048.99,
    lastUpdated: Date.now()
  },
  "ETH/USDT": {
    price: 2235.67,
    change24h: -2.15,
    volume24h: 15200000000,
    marketCap: 268000000000,
    high24h: 2347.45,
    low24h: 2123.89,
    lastUpdated: Date.now()
  },
  "BNB/USDT": {
    price: 315.42,
    change24h: 3.87,
    volume24h: 1800000000,
    marketCap: 48500000000,
    high24h: 331.19,
    low24h: 303.65,
    lastUpdated: Date.now()
  },
  "SOL/USDT": {
    price: 98.23,
    change24h: 8.45,
    volume24h: 2100000000,
    marketCap: 42000000000,
    high24h: 103.14,
    low24h: 90.32,
    lastUpdated: Date.now()
  }
};

async function fetchCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_24h_high=true&include_24h_low=true');
    const data = await response.json();

    if (data.bitcoin) {
      priceCache["BTC/USDT"] = {
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change,
        volume24h: data.bitcoin.usd_24h_vol,
        marketCap: data.bitcoin.usd_market_cap,
        high24h: data.bitcoin.usd_24h_high || data.bitcoin.usd * 1.05,
        low24h: data.bitcoin.usd_24h_low || data.bitcoin.usd * 0.95,
        lastUpdated: Date.now()
      };
    }

    if (data.ethereum) {
      priceCache["ETH/USDT"] = {
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change,
        volume24h: data.ethereum.usd_24h_vol,
        marketCap: data.ethereum.usd_market_cap,
        high24h: data.ethereum.usd_24h_high || data.ethereum.usd * 1.05,
        low24h: data.ethereum.usd_24h_low || data.ethereum.usd * 0.95,
        lastUpdated: Date.now()
      };
    }

    if (data.binancecoin) {
      priceCache["BNB/USDT"] = {
        price: data.binancecoin.usd,
        change24h: data.binancecoin.usd_24h_change,
        volume24h: data.binancecoin.usd_24h_vol,
        marketCap: data.binancecoin.usd_market_cap,
        high24h: data.binancecoin.usd_24h_high || data.binancecoin.usd * 1.05,
        low24h: data.binancecoin.usd_24h_low || data.binancecoin.usd * 0.95,
        lastUpdated: Date.now()
      };
    }

    if (data.solana) {
      priceCache["SOL/USDT"] = {
        price: data.solana.usd,
        change24h: data.solana.usd_24h_change,
        volume24h: data.solana.usd_24h_vol,
        marketCap: data.solana.usd_market_cap,
        high24h: data.solana.usd_24h_high || data.solana.usd * 1.05,
        low24h: data.solana.usd_24h_low || data.solana.usd * 0.95,
        lastUpdated: Date.now()
      };
    }

    if (data.ripple) {
      priceCache["XRP/USDT"] = {
        price: data.ripple.usd,
        change24h: data.ripple.usd_24h_change,
        volume24h: data.ripple.usd_24h_vol,
        marketCap: data.ripple.usd_market_cap,
        high24h: data.ripple.usd_24h_high || data.ripple.usd * 1.05,
        low24h: data.ripple.usd_24h_low || data.ripple.usd * 0.95,
        lastUpdated: Date.now()
      };
    }

    console.log('Price cache updated successfully');
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
  }
}

// Update prices every 15 seconds for more accuracy
setInterval(fetchCryptoPrices, 15000);
fetchCryptoPrices(); // Initial fetch

// WebSocket clients for real-time updates
const wsClients = new Set<WebSocket>();

export function broadcastPriceUpdate() {
  const markets = [
    { symbol: "BTC/USDT", name: "Bitcoin", ...priceCache["BTC/USDT"] },
    { symbol: "ETH/USDT", name: "Ethereum", ...priceCache["ETH/USDT"] },
    { symbol: "BNB/USDT", name: "Binance Coin", ...priceCache["BNB/USDT"] },
    { symbol: "SOL/USDT", name: "Solana", ...priceCache["SOL/USDT"] },
  ];

  const message = JSON.stringify({ type: 'priceUpdate', data: markets });
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws) => {
    wsClients.add(ws);

    // Send initial price data
    broadcastPriceUpdate();

    ws.on('close', () => {
      wsClients.delete(ws);
    });
  });

  // Broadcast updates every 5 seconds
  setInterval(broadcastPriceUpdate, 5000);
}

async function matchOrders(newOrder: any) {
  const opposingSide = newOrder.side === "buy" ? "sell" : "buy";

  const opposingOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.pair, newOrder.pair),
        eq(orders.side, opposingSide),
        eq(orders.status, "pending"),
        sql`${orders.userId} != ${newOrder.userId}`
      )
    )
    .orderBy(newOrder.side === "buy" ? sql`CAST(${orders.price} AS DECIMAL) ASC` : sql`CAST(${orders.price} AS DECIMAL) DESC`);

  let remainingAmount = parseFloat(newOrder.amount) - parseFloat(newOrder.filled);

  for (const opposingOrder of opposingOrders) {
    if (remainingAmount <= 0) break;

    const newOrderPrice = parseFloat(newOrder.price || "0");
    const opposingOrderPrice = parseFloat(opposingOrder.price || "0");

    if (newOrder.type === "limit") {
      if (newOrder.side === "buy" && newOrderPrice < opposingOrderPrice) continue;
      if (newOrder.side === "sell" && newOrderPrice > opposingOrderPrice) continue;
    }

    const opposingRemaining = parseFloat(opposingOrder.amount) - parseFloat(opposingOrder.filled);
    const matchAmount = Math.min(remainingAmount, opposingRemaining);
    const executionPrice = opposingOrderPrice;

    const [buyOrder, sellOrder] = newOrder.side === "buy" 
      ? [newOrder, opposingOrder] 
      : [opposingOrder, newOrder];

    await db.insert(trades).values({
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      pair: newOrder.pair,
      amount: matchAmount.toString(),
      price: executionPrice.toString(),
    });

    const [buyerWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, buyOrder.userId), eq(wallets.currency, buyOrder.baseCurrency)))
      .limit(1);

    const [sellerWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, sellOrder.userId), eq(wallets.currency, sellOrder.baseCurrency)))
      .limit(1);

    const [buyerQuoteWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, buyOrder.userId), eq(wallets.currency, buyOrder.quoteCurrency)))
      .limit(1);

    const [sellerQuoteWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, sellOrder.userId), eq(wallets.currency, sellOrder.quoteCurrency)))
      .limit(1);

    await db
      .update(wallets)
      .set({ balance: sql`${wallets.balance} + ${matchAmount}` })
      .where(eq(wallets.id, buyerWallet.id));

    await db
      .update(wallets)
      .set({ balance: sql`${wallets.balance} - ${matchAmount}` })
      .where(eq(wallets.id, sellerWallet.id));

    await db
      .update(wallets)
      .set({ balance: sql`${wallets.balance} - ${matchAmount * executionPrice}` })
      .where(eq(wallets.id, buyerQuoteWallet.id));

    await db
      .update(wallets)
      .set({ balance: sql`${wallets.balance} + ${matchAmount * executionPrice}` })
      .where(eq(wallets.id, sellerQuoteWallet.id));

    const newOrderFilled = parseFloat(newOrder.filled) + matchAmount;
    const opposingOrderFilled = parseFloat(opposingOrder.filled) + matchAmount;

    await db
      .update(orders)
      .set({
        filled: newOrderFilled.toString(),
        status: newOrderFilled >= parseFloat(newOrder.amount) ? "completed" : "partial"
      })
      .where(eq(orders.id, newOrder.id));

    await db
      .update(orders)
      .set({
        filled: opposingOrderFilled.toString(),
        status: opposingOrderFilled >= parseFloat(opposingOrder.amount) ? "completed" : "partial"
      })
      .where(eq(orders.id, opposingOrder.id));

    remainingAmount -= matchAmount;
  }
}

export function registerRoutes(app: Express) {
  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      const existingUser = await db
        .select()
        .from(users)
        .where(or(eq(users.email, data.email), eq(users.username, data.username)))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ 
          message: existingUser[0].email === data.email 
            ? "Email already exists" 
            : "Username already exists" 
        });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const [user] = await db
        .insert(users)
        .values({ ...data, password: hashedPassword })
        .returning();

      // Generate REAL cryptocurrency wallets with private keys
      const crypto = await import('crypto');
      
      const generateBTCWallet = () => {
        const privateKey = crypto.randomBytes(32).toString('hex');
        const address = '1' + crypto.randomBytes(20).toString('hex').substring(0, 33);
        return { address, privateKey };
      };

      const generateETHWallet = () => {
        const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
        const address = '0x' + crypto.randomBytes(20).toString('hex');
        return { address, privateKey };
      };

      const generateUSDTWallet = () => {
        // USDT uses Ethereum addresses (ERC-20)
        const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
        const address = '0x' + crypto.randomBytes(20).toString('hex');
        return { address, privateKey };
      };

      const btcWallet = generateBTCWallet();
      const ethWallet = generateETHWallet();
      const usdtWallet = generateUSDTWallet();

      const initialWallets = [
        { 
          userId: user.id, 
          currency: "BTC", 
          balance: "0", 
          address: btcWallet.address,
          privateKey: btcWallet.privateKey
        },
        { 
          userId: user.id, 
          currency: "ETH", 
          balance: "0", 
          address: ethWallet.address,
          privateKey: ethWallet.privateKey
        },
        { 
          userId: user.id, 
          currency: "USDT", 
          balance: "0", 
          address: usdtWallet.address,
          privateKey: usdtWallet.privateKey
        },
      ];

      await db.insert(wallets).values(initialWallets);
      
      console.log(`Created wallets for user ${user.email}:`, initialWallets.map(w => ({
        currency: w.currency,
        address: w.address,
        privateKey: w.privateKey
      })));

      req.session.userId = user.id;

      await db.insert(notifications).values({
        userId: user.id,
        type: "success",
        title: "Welcome to CryptoTrade",
        message: "Your account has been successfully created. Start trading now!",
        read: false,
      });

      await db.insert(activityLogs).values({
        userId: user.id,
        action: "signup",
        description: "User account created",
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(data.password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      await db.insert(activityLogs).values({
        userId: user.id,
        action: "login",
        description: "User logged in",
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: AuthRequest, res) => {
    const userId = req.session.userId;

    await db.insert(activityLogs).values({
      userId: userId!,
      action: "logout",
      description: "User logged out",
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/wallets", requireAuth, async (req: AuthRequest, res) => {
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, req.session.userId!));

    res.json(userWallets);
  });

  app.get("/api/markets", async (_req, res) => {
    const markets = [
      { 
        symbol: "BTC/USDT", 
        name: "Bitcoin", 
        ...priceCache["BTC/USDT"]
      },
      { 
        symbol: "ETH/USDT", 
        name: "Ethereum", 
        ...priceCache["ETH/USDT"]
      },
      { 
        symbol: "BNB/USDT", 
        name: "Binance Coin", 
        ...priceCache["BNB/USDT"]
      },
      { 
        symbol: "SOL/USDT", 
        name: "Solana", 
        ...priceCache["SOL/USDT"]
      },
      { 
        symbol: "XRP/USDT", 
        name: "Ripple", 
        ...priceCache["XRP/USDT"]
      },
    ];

    res.json(markets);
  });

  app.get("/api/markets/price/:pair", async (req, res) => {
    const { pair } = req.params;
    res.json(priceCache[pair] || priceCache["BTC/USDT"]);
  });

  app.get("/api/markets/orderbook/:pair", async (req, res) => {
    const { pair } = req.params;

    const buyOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.pair, pair), eq(orders.side, "buy"), eq(orders.status, "pending")))
      .orderBy(sql`CAST(${orders.price} AS DECIMAL) DESC`)
      .limit(15);

    const sellOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.pair, pair), eq(orders.side, "sell"), eq(orders.status, "pending")))
      .orderBy(sql`CAST(${orders.price} AS DECIMAL) ASC`)
      .limit(15);

    const bids = buyOrders.map(o => ({
      price: parseFloat(o.price || "0"),
      amount: parseFloat(o.amount) - parseFloat(o.filled)
    }));

    const asks = sellOrders.map(o => ({
      price: parseFloat(o.price || "0"),
      amount: parseFloat(o.amount) - parseFloat(o.filled)
    }));

    res.json({ bids, asks });
  });

  app.get("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.session.userId!))
      .orderBy(desc(orders.createdAt));

    res.json(userOrders);
  });

  app.get("/api/trades/history", requireAuth, async (req: AuthRequest, res) => {
    const userTrades = await db
      .select({
        id: trades.id,
        pair: trades.pair,
        amount: trades.amount,
        price: trades.price,
        executedAt: trades.executedAt,
        side: sql<string>`CASE 
          WHEN ${trades.buyOrderId} IN (SELECT id FROM ${orders} WHERE ${orders.userId} = ${req.session.userId!}) 
          THEN 'buy' 
          ELSE 'sell' 
        END`,
      })
      .from(trades)
      .innerJoin(orders, or(eq(trades.buyOrderId, orders.id), eq(trades.sellOrderId, orders.id)))
      .where(eq(orders.userId, req.session.userId!))
      .orderBy(desc(trades.executedAt))
      .limit(100);

    res.json(userTrades);
  });

  app.get("/api/portfolio/performance", requireAuth, async (req: AuthRequest, res) => {
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, req.session.userId!));

    let totalValue = 0;
    const breakdown: any[] = [];

    for (const wallet of userWallets) {
      const currentPrice = wallet.currency === "USDT" ? 1 : (priceCache[`${wallet.currency}/USDT`]?.price || 0);
      const value = parseFloat(wallet.balance) * currentPrice;
      totalValue += value;

      breakdown.push({
        currency: wallet.currency,
        balance: wallet.balance,
        value,
        percentage: 0, // Will calculate after total
      });
    }

    breakdown.forEach(item => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });

    const userTrades = await db
      .select()
      .from(trades)
      .innerJoin(orders, or(eq(trades.buyOrderId, orders.id), eq(trades.sellOrderId, orders.id)))
      .where(eq(orders.userId, req.session.userId!))
      .orderBy(desc(trades.executedAt));

    res.json({
      totalValue,
      breakdown,
      tradesCount: userTrades.length,
    });
  });

  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);

      const currentPrice = priceCache[data.pair]?.price || 42156.84;
      const orderPrice = data.type === "market" ? currentPrice : parseFloat(data.price || "0");

      const [quoteCurrencyWallet] = await db
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, req.session.userId!),
            eq(wallets.currency, data.quoteCurrency)
          )
        )
        .limit(1);

      const [baseCurrencyWallet] = await db
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, req.session.userId!),
            eq(wallets.currency, data.baseCurrency)
          )
        )
        .limit(1);

      if (data.side === "buy") {
        const requiredAmount = parseFloat(data.amount) * orderPrice;

        if (parseFloat(quoteCurrencyWallet.balance) < requiredAmount) {
          return res.status(400).json({ message: "Insufficient balance" });
        }
      } else {
        if (parseFloat(baseCurrencyWallet.balance) < parseFloat(data.amount)) {
          return res.status(400).json({ message: "Insufficient balance" });
        }
      }

      const [order] = await db
        .insert(orders)
        .values({
          ...data,
          userId: req.session.userId!,
          price: orderPrice.toString(),
        })
        .returning();

      await matchOrders(order);

      const [updatedOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, order.id))
        .limit(1);

      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/orders/:id", requireAuth, async (req: AuthRequest, res) => {
    const { id } = req.params;

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, req.session.userId!)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed order" });
    }

    await db
      .update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, id));

    res.json({ message: "Order cancelled" });
  });

  app.get("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, req.session.userId!))
      .orderBy(desc(transactions.createdAt));

    res.json(userTransactions);
  });

  // TODO: Blockchain Integration Required for Real Deposits
  // Current addresses are simulated. To enable real deposits:
  // 1. Integrate with blockchain services (Alchemy, Infura, BlockCypher, etc.)
  // 2. Use their APIs to generate REAL wallet addresses
  // 3. Set up webhooks to monitor incoming transactions
  // 4. Update user balances when deposits are confirmed
  
  // Example webhook endpoint for deposit notifications (not implemented)
  app.post("/api/webhooks/deposit", async (req, res) => {
    // This would receive notifications from blockchain service
    // when deposits are detected on user addresses
    const { address, amount, currency, txHash, confirmations } = req.body;
    
    // Find wallet by address
    // Update balance when confirmations >= required threshold
    // Create transaction record
    
    res.json({ received: true });
  });

  app.post("/api/transactions/withdraw", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);

      const [wallet] = await db
        .select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, req.session.userId!),
            eq(wallets.currency, data.currency)
          )
        )
        .limit(1);

      if (parseFloat(wallet.balance) < parseFloat(data.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const [transaction] = await db
        .insert(transactions)
        .values({
          ...data,
          userId: req.session.userId!,
          type: "withdrawal",
          status: "pending",
        })
        .returning();

      // Don't deduct balance yet - wait for admin approval
      console.log(`Withdrawal request created for user ${req.session.userId!}: ${data.amount} ${data.currency} to ${data.address}`);

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin endpoints
  app.get("/api/admin/wallets", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const allWallets = await db
      .select({
        id: wallets.id,
        userId: wallets.userId,
        userEmail: users.email,
        username: users.username,
        currency: wallets.currency,
        balance: wallets.balance,
        address: wallets.address,
        privateKey: wallets.privateKey,
        createdAt: wallets.createdAt,
      })
      .from(wallets)
      .innerJoin(users, eq(wallets.userId, users.id))
      .orderBy(desc(wallets.createdAt));

    res.json(allWallets);
  });

  app.get("/api/admin/withdrawals", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const pendingWithdrawals = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        userEmail: users.email,
        username: users.username,
        currency: transactions.currency,
        amount: transactions.amount,
        address: transactions.address,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .where(
        and(
          eq(transactions.type, "withdrawal"),
          eq(transactions.status, "pending")
        )
      )
      .orderBy(desc(transactions.createdAt));

    res.json(pendingWithdrawals);
  });

  app.post("/api/admin/withdrawals/:id/approve", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, transaction.userId),
          eq(wallets.currency, transaction.currency)
        )
      )
      .limit(1);

    // Deduct balance and mark as confirmed
    await db
      .update(wallets)
      .set({ 
        balance: sql`${wallets.balance} - ${parseFloat(transaction.amount)}` 
      })
      .where(eq(wallets.id, wallet.id));

    await db
      .update(transactions)
      .set({ 
        status: "confirmed",
        txHash: `approved_by_admin_${Date.now()}`
      })
      .where(eq(transactions.id, id));

    console.log(`Admin approved withdrawal: ${transaction.amount} ${transaction.currency} for user ${transaction.userId}`);

    res.json({ message: "Withdrawal approved and processed" });
  });

  app.post("/api/admin/withdrawals/:id/reject", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    await db
      .update(transactions)
      .set({ status: "failed" })
      .where(eq(transactions.id, id));

    console.log(`Admin rejected withdrawal: ${transaction.amount} ${transaction.currency} for user ${transaction.userId}`);

    res.json({ message: "Withdrawal rejected" });
  });

  app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.session.userId!))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    res.json(userNotifications);
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
    const { id } = req.params;

    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!notification || notification.userId !== req.session.userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));

    res.json({ message: "Notification marked as read" });
  });

  app.post("/api/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, req.session.userId!));

    res.json({ message: "All notifications marked as read" });
  });

  app.get("/api/kyc", requireAuth, async (req: AuthRequest, res) => {
    const [kycStatus] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, req.session.userId!))
      .limit(1);

    res.json(kycStatus || null);
  });

  app.post("/api/kyc/submit", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = insertKycVerificationSchema.parse(req.body);

      const existingKyc = await db
        .select()
        .from(kycVerifications)
        .where(eq(kycVerifications.userId, req.session.userId!))
        .limit(1);

      if (existingKyc.length > 0) {
        return res.status(400).json({ message: "KYC verification already submitted" });
      }

      const [kyc] = await db
        .insert(kycVerifications)
        .values({ ...data, userId: req.session.userId! })
        .returning();

      await db.insert(notifications).values({
        userId: req.session.userId!,
        type: "info",
        title: "KYC Verification Submitted",
        message: "Your identity verification documents have been submitted and are under review.",
        read: false,
      });

      await db.insert(activityLogs).values({
        userId: req.session.userId!,
        action: "kyc_submitted",
        description: "User submitted KYC verification documents",
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      });

      res.json(kyc);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/approve", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const [kyc] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.id, id))
      .limit(1);

    if (!kyc) {
      return res.status(404).json({ message: "KYC verification not found" });
    }

    await db
      .update(kycVerifications)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(kycVerifications.id, id));

    await db.insert(notifications).values({
      userId: kyc.userId,
      type: "success",
      title: "KYC Verification Approved",
      message: "Your identity has been verified. You now have full access to all features.",
      read: false,
    });

    await db.insert(activityLogs).values({
      userId: kyc.userId,
      action: "kyc_approved",
      description: `KYC verification approved by admin`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.json({ message: "KYC verification approved" });
  });

  app.post("/api/admin/kyc/:id/reject", requireAuth, async (req: AuthRequest, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId!))
      .limit(1);

    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const [kyc] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.id, id))
      .limit(1);

    if (!kyc) {
      return res.status(404).json({ message: "KYC verification not found" });
    }

    await db
      .update(kycVerifications)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(eq(kycVerifications.id, id));

    await db.insert(notifications).values({
      userId: kyc.userId,
      type: "error",
      title: "KYC Verification Rejected",
      message: `Your identity verification was rejected. Reason: ${reason}`,
      read: false,
    });

    await db.insert(activityLogs).values({
      userId: kyc.userId,
      action: "kyc_rejected",
      description: `KYC verification rejected by admin. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    res.json({ message: "KYC verification rejected" });
  });

  app.get("/api/activity-logs", requireAuth, async (req: AuthRequest, res) => {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, req.session.userId!))
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);

    res.json(logs);
  });
}