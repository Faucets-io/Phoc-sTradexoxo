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
  FileText,
  ArrowDownToLine,
  MessageCircle,
  Smartphone,
  Bell,
  HelpCircle
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

  const topMarkets = markets.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold" data-testid="text-app-title">CryptoTrade</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-support">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Total Assets</p>
                <p className="text-3xl font-bold font-mono" data-testid="text-total-assets">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </p>
              </div>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setLocation("/portfolio")}
                data-testid="button-assets"
              >
                Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary to-chart-2 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                BUY / SELL CRYPTO
              </h2>
              <p className="text-base opacity-90 mb-1">ANYTIME ANYWHERE</p>
              <p className="text-sm opacity-80">PEOPLE'S EXCHANGE</p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
              <TrendingUp className="h-full w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="bg-card border border-border rounded-lg p-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-sm text-muted-foreground" data-testid="text-news-ticker">
              📢 U.S. banks come together to mint USDF stablecoins • New trading pairs available • 24/7 customer support
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation("/trade?tab=second")}
            data-testid="card-second"
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <p className="font-semibold text-sm">Second</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation("/trade?tab=contracts")}
            data-testid="card-contracts"
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="font-semibold text-sm">Contracts</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation("/portfolio")}
            data-testid="card-assets"
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
              <Wallet className="h-8 w-8 text-primary mb-2" />
              <p className="font-semibold text-sm">Assets</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation("/deposit")}
            data-testid="card-deposit"
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
              <ArrowDownToLine className="h-8 w-8 text-primary mb-2" />
              <p className="font-semibold text-sm">Deposit</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-livechat">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-sm">Livechat</p>
                <p className="text-xs text-muted-foreground">Need help?</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-download">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Download App</p>
                <p className="text-xs text-muted-foreground">Trade freely</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">Market Overview</h3>
            </div>
            <div className="divide-y divide-border">
              {topMarkets.map((market) => (
                <a
                  key={market.symbol}
                  href={`/trade?pair=${market.symbol}`}
                  className="flex items-center justify-between p-4 hover-elevate active-elevate-2"
                  data-testid={`row-market-${market.symbol}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm" data-testid={`text-pair-${market.symbol}`}>
                      {market.symbol}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="font-mono text-sm" data-testid={`text-price-${market.symbol}`}>
                      {market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex-1 text-right">
                    <span
                      className={`text-sm font-medium ${
                        market.change24h >= 0 ? "text-success" : "text-destructive"
                      }`}
                      data-testid={`text-change-${market.symbol}`}
                    >
                      {market.change24h >= 0 ? "+" : ""}
                      {market.change24h.toFixed(2)}%
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
