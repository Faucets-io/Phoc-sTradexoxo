import type { Express } from "express";
import { db } from "./db";
import { users, wallets, orders, trades, transactions } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { insertUserSchema, loginSchema, insertOrderSchema, insertTransactionSchema } from "@shared/schema";
import { requireAuth, type AuthRequest } from "./auth";

export function registerRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
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

      const initialWallets = [
        { userId: user.id, currency: "BTC", balance: "0", address: `1${Math.random().toString(36).substring(2, 15)}` },
        { userId: user.id, currency: "ETH", balance: "0", address: `0x${Math.random().toString(36).substring(2, 15)}` },
        { userId: user.id, currency: "USDT", balance: "10000", address: `T${Math.random().toString(36).substring(2, 15)}` },
      ];

      await db.insert(wallets).values(initialWallets);

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (!user || !(await bcrypt.compare(data.password, user.password))) {
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
    const mockMarkets = [
      { 
        symbol: "BTC/USDT", 
        name: "Bitcoin", 
        price: 42156.84, 
        change24h: 5.24, 
        volume24h: 28500000000, 
        marketCap: 825000000000 
      },
      { 
        symbol: "ETH/USDT", 
        name: "Ethereum", 
        price: 2235.67, 
        change24h: -2.15, 
        volume24h: 15200000000, 
        marketCap: 268000000000 
      },
      { 
        symbol: "BNB/USDT", 
        name: "Binance Coin", 
        price: 315.42, 
        change24h: 3.87, 
        volume24h: 1800000000, 
        marketCap: 48500000000 
      },
      { 
        symbol: "SOL/USDT", 
        name: "Solana", 
        price: 98.23, 
        change24h: 8.45, 
        volume24h: 2100000000, 
        marketCap: 42000000000 
      },
    ];

    res.json(mockMarkets);
  });

  app.get("/api/markets/price/:pair", async (req, res) => {
    const { pair } = req.params;
    
    const prices: Record<string, { price: number; change24h: number }> = {
      "BTC/USDT": { price: 42156.84, change24h: 5.24 },
      "ETH/USDT": { price: 2235.67, change24h: -2.15 },
      "BNB/USDT": { price: 315.42, change24h: 3.87 },
      "SOL/USDT": { price: 98.23, change24h: 8.45 },
    };

    res.json(prices[pair] || { price: 42156.84, change24h: 5.24 });
  });

  app.get("/api/markets/orderbook/:pair", async (req, res) => {
    const mockOrderBook = {
      bids: Array.from({ length: 15 }, (_, i) => ({
        price: 42100 - i * 10,
        amount: Math.random() * 2,
      })),
      asks: Array.from({ length: 15 }, (_, i) => ({
        price: 42200 + i * 10,
        amount: Math.random() * 2,
      })),
    };

    res.json(mockOrderBook);
  });

  app.get("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.session.userId!))
      .orderBy(desc(orders.createdAt));

    res.json(userOrders);
  });

  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      
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
        const requiredAmount = data.type === "market" 
          ? parseFloat(data.amount) * 42156.84
          : parseFloat(data.amount) * parseFloat(data.price || "0");
        
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
        })
        .returning();

      if (data.type === "market") {
        const executionPrice = 42156.84;
        
        if (data.side === "buy") {
          await db
            .update(wallets)
            .set({ 
              balance: sql`${wallets.balance} - ${parseFloat(data.amount) * executionPrice}` 
            })
            .where(eq(wallets.id, quoteCurrencyWallet.id));
          
          await db
            .update(wallets)
            .set({ 
              balance: sql`${wallets.balance} + ${parseFloat(data.amount)}` 
            })
            .where(eq(wallets.id, baseCurrencyWallet.id));
        } else {
          await db
            .update(wallets)
            .set({ 
              balance: sql`${wallets.balance} - ${parseFloat(data.amount)}` 
            })
            .where(eq(wallets.id, baseCurrencyWallet.id));
          
          await db
            .update(wallets)
            .set({ 
              balance: sql`${wallets.balance} + ${parseFloat(data.amount) * executionPrice}` 
            })
            .where(eq(wallets.id, quoteCurrencyWallet.id));
        }

        await db
          .update(orders)
          .set({ status: "completed", filled: data.amount })
          .where(eq(orders.id, order.id));
      }

      res.json(order);
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

  app.post("/api/transactions/deposit", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      
      const [transaction] = await db
        .insert(transactions)
        .values({
          ...data,
          userId: req.session.userId!,
          type: "deposit",
          txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        })
        .returning();

      await db
        .update(wallets)
        .set({ 
          balance: sql`${wallets.balance} + ${parseFloat(data.amount)}` 
        })
        .where(
          and(
            eq(wallets.userId, req.session.userId!),
            eq(wallets.currency, data.currency)
          )
        );

      await db
        .update(transactions)
        .set({ status: "confirmed" })
        .where(eq(transactions.id, transaction.id));

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
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
          txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        })
        .returning();

      await db
        .update(wallets)
        .set({ 
          balance: sql`${wallets.balance} - ${parseFloat(data.amount)}` 
        })
        .where(eq(wallets.id, wallet.id));

      await db
        .update(transactions)
        .set({ status: "confirmed" })
        .where(eq(transactions.id, transaction.id));

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
}
