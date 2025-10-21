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
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 p-4 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold gradient-text" data-testid="text-dashboard-title">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Total Assets Card */}
        <div className="animated-gradient rounded-2xl p-6 relative overflow-hidden shadow-strong">
          <div className="relative z-10">
            <p className="text-white/90 text-sm mb-1 font-medium">Total Assets≈</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-white text-4xl font-bold tracking-tight" data-testid="text-total-assets">
                  {totalValue.toFixed(2)}
                </span>
                <span className="text-white/90 text-lg ml-2">USDT</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/20 shadow-lg"
                onClick={() => setLocation("/portfolio")}
                data-testid="button-assets"
              >
                Assets
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => setLocation(action.path)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl glass-card hover:shadow-medium transition-all duration-300 hover:scale-105"
                  data-testid={`button-${action.label.toLowerCase()}`}
                >
                  <div className={`h-14 w-14 rounded-2xl ${action.color} flex items-center justify-center shadow-soft`}>
                    <Icon className={`h-7 w-7 ${action.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Market Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Market Overview</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/market")}
              data-testid="button-view-all"
              className="hover:bg-primary/10"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {markets.slice(0, 5).map((market) => (
              <Card 
                key={market.symbol}
                className="cursor-pointer hover:shadow-medium transition-all duration-300 hover:scale-[1.02] glass-card"
                onClick={() => setLocation(`/trade?pair=${market.symbol}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-base">{market.symbol}</p>
                      <p className="text-sm text-muted-foreground">{market.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-base">
                        ${market.price.toLocaleString()}
                      </p>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${market.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {market.change24h >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
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
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-3">
                <Clock className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
