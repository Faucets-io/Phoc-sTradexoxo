import type { Express } from "express";
import { db } from "./db";
import { users, wallets, orders, trades, transactions } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { insertUserSchema, loginSchema, insertOrderSchema, insertTransactionSchema } from "@shared/schema";
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

      // Generate unique wallet addresses for each user
      const generateBTCAddress = () => {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let address = '1';
        for (let i = 0; i < 33; i++) {
          address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return address;
      };

      const generateETHAddress = () => {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
          address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return address;
      };

      const generateUSDTAddress = () => {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let address = 'T';
        for (let i = 0; i < 33; i++) {
          address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return address;
      };

      const initialWallets = [
        { userId: user.id, currency: "BTC", balance: "0", address: generateBTCAddress() },
        { userId: user.id, currency: "ETH", balance: "0", address: generateETHAddress() },
        { userId: user.id, currency: "USDT", balance: "10000", address: generateUSDTAddress() },
      ];

      await db.insert(wallets).values(initialWallets);
      
      console.log(`Created wallets for user ${user.email}:`, initialWallets.map(w => `${w.currency}: ${w.address}`));

      req.session.userId = user.id;

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

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
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

      // Removed demo warning
      // if (parseFloat(data.amount) < 0.001) {
      //   return res.status(400).json({ message: `Minimum withdrawal is 0.001 ${data.currency}` });
      // }

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

      const totalAmount = parseFloat(data.amount) + 0.0001;

      if (parseFloat(wallet.balance) < totalAmount) {
        return res.status(400).json({ message: "Insufficient balance (including network fee)" });
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

      await db
        .update(wallets)
        .set({ 
          balance: sql`${wallets.balance} - ${totalAmount}` 
        })
        .where(eq(wallets.id, wallet.id));

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
}