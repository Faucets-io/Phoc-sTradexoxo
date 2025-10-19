import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function Market() {
  const { data: initialMarkets, isLoading } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/markets"],
  });

  const [markets, setMarkets] = useState<CryptoPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredMarkets = markets.filter(market =>
    market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4" data-testid="text-market-title">Market</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trading pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-market-search"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMarkets.map((market) => (
              <a
                key={market.symbol}
                href={`/trade?pair=${market.symbol}`}
                data-testid={`card-market-${market.symbol}`}
              >
                <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-base" data-testid={`text-pair-${market.symbol}`}>
                        {market.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {market.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-base" data-testid={`text-price-${market.symbol}`}>
                        {formatCurrency(market.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          market.change24h >= 0 ? "text-success" : "text-destructive"
                        }`}
                        data-testid={`text-change-${market.symbol}`}
                      >
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
                </Card>
              </a>
            ))}
          </div>
        )}

        {!isLoading && filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trading pairs found</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
