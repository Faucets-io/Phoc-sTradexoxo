import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Clock,
  ArrowDownToLine,
  Repeat,
  ChevronRight
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Wallet as WalletType } from "@shared/schema";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: initialMarkets } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/markets"],
  });

  const { data: wallets } = useQuery<WalletType[]>({
    queryKey: ["/api/wallets"],
  });

  const [markets, setMarkets] = useState<CryptoPrice[]>([]);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (initialMarkets) {
      setMarkets(initialMarkets);
    }
  }, [initialMarkets]);

  useEffect(() => {
    if (lastMessage?.type === 'priceUpdate' && lastMessage.data) {
      setMarkets(lastMessage.data);
    }
  }, [lastMessage]);

  const getPrice = (currency: string) => {
    if (currency === "USDT") return 1;
    const market = markets?.find(m => m.symbol === `${currency}/USDT`);
    return market?.price || 0;
  };

  const totalValue = wallets?.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance) * getPrice(wallet.currency);
  }, 0) || 0;

  const topMarkets = markets.slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="bg-card border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold" data-testid="text-app-title">CryptoTrade</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Total Assets Card */}
        <div className="bg-primary rounded-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-foreground/90 text-sm mb-1">Total Assets≈</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-primary-foreground text-4xl font-bold" data-testid="text-total-assets">
                  {totalValue.toFixed(2)}
                </span>
                <span className="text-primary-foreground/90 text-lg ml-2">USDT</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white hover:bg-white/90 text-foreground"
                onClick={() => setLocation("/portfolio")}
                data-testid="button-assets"
              >
                Assets
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setLocation("/trade")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-second"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Second</span>
            </button>

            <button
              onClick={() => setLocation("/trade")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-contracts"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Repeat className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Contracts</span>
            </button>

            <button
              onClick={() => setLocation("/portfolio")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-assets-quick"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Assets</span>
            </button>

            <button
              onClick={() => setLocation("/deposit")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-deposit"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowDownToLine className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Deposit</span>
            </button>
          </div>
        </div>

        {/* Support Section */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">24/7 Customer Support</h4>
                  <p className="text-xs text-muted-foreground">We're here to help</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Market Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Market Overview</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/market")}
              data-testid="button-view-all-markets"
            >
              View All
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {topMarkets.map((market) => {
                  const isPositive = market.change24h >= 0;
                  return (
                    <button
                      key={market.symbol}
                      onClick={() => setLocation("/trade")}
                      className="w-full p-4 flex items-center justify-between hover-elevate transition-colors"
                      data-testid={`market-item-${market.symbol}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <div className="font-semibold text-sm">{market.symbol}</div>
                          <div className="text-xs text-muted-foreground">{market.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold font-mono text-sm" data-testid={`price-${market.symbol}`}>
                          ${market.price.toFixed(2)}
                        </div>
                        <div className={`text-xs font-medium flex items-center justify-end gap-1 ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(market.change24h).toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { lastMessage } = useWebSocket();

  const { data: wallets } = useQuery<WalletType[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: markets } = useQuery<any[]>({
    queryKey: ["/api/markets"],
  });

  const [currentPrices, setCurrentPrices] = useState<any[]>([]);

  useEffect(() => {
    if (markets) {
      setCurrentPrices(markets);
    }
  }, [markets]);

  useEffect(() => {
    if (lastMessage?.type === 'priceUpdate' && lastMessage.data) {
      setCurrentPrices(lastMessage.data);
    }
  }, [lastMessage]);

  const totalValue = wallets?.reduce((sum, wallet) => {
    const market = currentPrices.find(m => m.symbol === `${wallet.currency}/USDT`);
    const price = wallet.currency === "USDT" ? 1 : (market?.price || 0);
    return sum + parseFloat(wallet.balance) * price;
  }, 0) || 0;

  const quickActions = [
    {
      icon: ArrowDownToLine,
      label: "Deposit",
      path: "/deposit",
      color: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Repeat,
      label: "Transfer",
      path: "/transactions",
      color: "bg-success/10",
      iconColor: "text-success"
    },
    {
      icon: Wallet,
      label: "Withdraw",
      path: "/withdraw",
      color: "bg-destructive/10",
      iconColor: "text-destructive"
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Total Assets Card */}
        <div className="bg-primary rounded-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-foreground/90 text-sm mb-1">Total Assets≈</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-primary-foreground text-4xl font-bold" data-testid="text-total-assets">
                  {totalValue.toFixed(2)}
                </span>
                <span className="text-primary-foreground/90 text-lg ml-2">USDT</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white hover:bg-white/90 text-foreground"
                onClick={() => setLocation("/portfolio")}
                data-testid="button-assets"
              >
                Assets
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => setLocation(action.path)}
                  className="flex flex-col items-center gap-2 p-3"
                  data-testid={`button-${action.label.toLowerCase()}`}
                >
                  <div className={`h-14 w-14 rounded-full ${action.color} flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${action.iconColor}`} />
                  </div>
                  <span className="text-xs text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Market Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Market Overview</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/market")}
              data-testid="button-view-all"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {currentPrices.slice(0, 5).map((market) => (
              <Card 
                key={market.symbol}
                className="cursor-pointer hover-elevate"
                onClick={() => setLocation(`/trade?pair=${market.symbol}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{market.symbol}</p>
                      <p className="text-sm text-muted-foreground">{market.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        ${market.price.toLocaleString()}
                      </p>
                      <div className={`flex items-center gap-1 text-sm ${market.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {market.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {market.change24h >= 0 ? "+" : ""}
                        {market.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Recent Activity</h3>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
