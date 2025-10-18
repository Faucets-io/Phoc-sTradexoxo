import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function Dashboard() {
  const { data: markets, isLoading } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/markets"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Markets Overview</h2>
          <p className="text-muted-foreground">Live cryptocurrency prices and 24h changes</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {markets?.map((market) => (
              <Card key={market.symbol} className="hover-elevate transition-all" data-testid={`market-card-${market.symbol}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-sm">{market.symbol.substring(0, 3)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{market.name}</h3>
                          <p className="text-sm text-muted-foreground">{market.symbol}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="text-2xl font-bold font-mono" data-testid={`price-${market.symbol}`}>
                          {formatCurrency(market.price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                        <div className={`flex items-center gap-1 justify-end ${market.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {market.change24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-semibold font-mono" data-testid={`change-${market.symbol}`}>
                            {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                        <p className="font-medium">{formatLargeNumber(market.volume24h)}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                        <p className="font-medium">{formatLargeNumber(market.marketCap)}</p>
                      </div>

                      <Link href={`/trade?pair=${market.symbol}`}>
                        <Button data-testid={`button-trade-${market.symbol}`}>
                          Trade
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!markets || markets.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No markets available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
