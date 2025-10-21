import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BottomNav } from "@/components/bottom-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, Wallet } from "@shared/schema";
import { TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Trade() {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const { data: currentPrice } = useQuery<{ price: number; change24h: number }>({
    queryKey: ["/api/markets/price", selectedPair],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: orderBook } = useQuery<{
    bids: Array<{ price: number; amount: number }>;
    asks: Array<{ price: number; amount: number }>
  }>({
    queryKey: ["/api/markets/orderbook", selectedPair],
  });

  const [livePrice, setLivePrice] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Real-time price updates
  useEffect(() => {
    if (!currentPrice?.price) return;

    const interval = setInterval(() => {
      setLivePrice(prev => {
        if (!prev) return currentPrice.price;
        const change = (Math.random() - 0.5) * (currentPrice.price * 0.0002);
        return prev + change;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // TradingView widget integration
  useEffect(() => {
    // Get current theme
    const isDark = document.documentElement.classList.contains('dark');
    const chartTheme = isDark ? 'dark' : 'light';
    const bgColor = isDark ? '#0a0a0a' : '#ffffff';

    // Check if script is already loaded
    if (typeof (window as any).TradingView !== 'undefined') {
      initializeWidgets();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      initializeWidgets();
    };

    document.head.appendChild(script);

    function initializeWidgets() {
      if (typeof (window as any).TradingView === 'undefined') return;

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Ticker Tape Widget
        const tickerContainer = document.getElementById('tradingview_ticker');
        if (tickerContainer) {
          tickerContainer.innerHTML = ''; // Clear previous widget
          new (window as any).TradingView.widget({
            width: "100%",
            height: 46,
            symbol: "BINANCE:BTCUSDT",
            interval: "1",
            timezone: "Etc/UTC",
            theme: chartTheme,
            style: "3",
            locale: "en",
            toolbar_bg: bgColor,
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: true,
            withdateranges: false,
            hide_side_toolbar: true,
            allow_symbol_change: false,
            save_image: false,
            container_id: "tradingview_ticker",
            autosize: false,
            studies: [],
            show_popup_button: false,
            popup_width: "1000",
            popup_height: "650",
          });
        }

        // Desktop chart
        const desktopContainer = document.getElementById('tradingview_chart');
        if (desktopContainer) {
          desktopContainer.innerHTML = ''; // Clear previous widget
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: selectedPair.replace('/', ''),
            interval: '15',
            timezone: 'Etc/UTC',
            theme: chartTheme,
            style: '1',
            locale: 'en',
            toolbar_bg: bgColor,
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: false,
            container_id: 'tradingview_chart',
            studies: ['Volume@tv-basicstudies'],
            disabled_features: ['use_localstorage_for_settings'],
            enabled_features: ['study_templates'],
            loading_screen: { backgroundColor: bgColor },
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': '#22c55e',
              'mainSeriesProperties.candleStyle.downColor': '#ef4444',
              'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
              'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
              'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
              'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
            }
          });
        }

        // Mobile chart
        const mobileContainer = document.getElementById('tradingview_chart_mobile');
        if (mobileContainer) {
          mobileContainer.innerHTML = ''; // Clear previous widget
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: selectedPair.replace('/', ''),
            interval: '15',
            timezone: 'Etc/UTC',
            theme: chartTheme,
            style: '1',
            locale: 'en',
            toolbar_bg: bgColor,
            enable_publishing: false,
            hide_side_toolbar: true,
            allow_symbol_change: false,
            container_id: 'tradingview_chart_mobile',
            studies: ['Volume@tv-basicstudies'],
            disabled_features: ['use_localstorage_for_settings', 'header_widget'],
            enabled_features: [],
            loading_screen: { backgroundColor: bgColor },
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': '#22c55e',
              'mainSeriesProperties.candleStyle.downColor': '#ef4444',
              'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
              'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
              'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
              'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
            }
          });
        }
      }, 100);
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          initializeWidgets();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
      const tickerContainer = document.getElementById('tradingview_ticker');
      const desktopContainer = document.getElementById('tradingview_chart');
      const mobileContainer = document.getElementById('tradingview_chart_mobile');
      if (tickerContainer) tickerContainer.innerHTML = '';
      if (desktopContainer) desktopContainer.innerHTML = '';
      if (mobileContainer) mobileContainer.innerHTML = '';
    };
  }, [selectedPair]);

  const usdtWallet = wallets?.find(w => w.currency === "USDT");
  const usableBalance = parseFloat(usdtWallet?.balance || "0");

  const placeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Order placement failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Order placed",
        description: `Your ${side} order has been placed successfully.`,
      });
      setAmount("");
      setPrice("");
    },
    onError: (error: Error) => {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    const [baseCurrency, quoteCurrency] = selectedPair.split("/");
    placeMutation.mutate({
      type: orderType,
      side,
      pair: selectedPair,
      baseCurrency,
      quoteCurrency,
      amount: parseFloat(amount),
      price: orderType === "limit" ? parseFloat(price) : undefined,
    });
  };

  const setPercentage = (percent: number) => {
    if (!currentPrice) return;
    const maxAmount = usableBalance / currentPrice.price;
    setAmount((maxAmount * (percent / 100)).toFixed(8));
  };

  const activeOrders = orders?.filter(o => o.status === "pending" || o.status === "partial") || [];
  const completedOrders = orders?.filter(o => o.status === "completed" || o.status === "cancelled") || [];

  const priceChange = currentPrice?.change24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedPair} onValueChange={setSelectedPair}>
                <SelectTrigger className="w-[140px] border-0 font-bold text-lg hover:bg-muted/50 transition-colors" data-testid="select-pair">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                  <SelectItem value="XRP/USDT">XRP/USDT</SelectItem>
                </SelectContent>
              </Select>
              {currentPrice && (
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <div className={`text-2xl font-mono font-bold transition-all duration-300 ${isPositive ? 'text-success' : 'text-destructive'}`} data-testid="text-current-price">
                      ${livePrice ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : currentPrice.price.toLocaleString()}
                    </div>
                    <div className={`text-xs flex items-center gap-1 font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}% 24h
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Price Ticker */}
          {livePrice && currentPrice && (
            <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono bg-muted/30 -mx-3 px-3 py-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">24h High</span>
                <span className="text-success font-semibold">${((currentPrice as any).high24h || currentPrice.price * 1.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">24h Low</span>
                <span className="text-destructive font-semibold">${((currentPrice as any).low24h || currentPrice.price * 0.95).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">24h Volume</span>
                <span className="font-semibold">${((currentPrice as any).volume24h || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* TradingView Ticker Tape Widget */}
      <div className="bg-card border-b border-border">
        <div id="tradingview_ticker" className="w-full h-[46px]"></div>
      </div>

      <main className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-0">
        <div className="border-r border-border">
          {/* TradingView Chart - Desktop */}
          <div className="hidden lg:block h-[calc(100vh-140px)] bg-card" ref={chartContainerRef}>
            <div id="tradingview_chart" className="h-full w-full"></div>
          </div>

          {/* TradingView Chart - Mobile */}
          <div className="lg:hidden h-[400px] bg-card border-t border-border">
            <div id="tradingview_chart_mobile" className="h-full w-full"></div>
          </div>

          {/* Order Book - Mobile */}
          <div className="lg:hidden border-t border-border">
            <div className="p-3 bg-card">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Order Book</h3>
              <div className="space-y-1 text-xs font-mono">
                <div className="grid grid-cols-3 text-muted-foreground pb-2 border-b">
                  <div>Price</div>
                  <div className="text-right">Amount</div>
                  <div className="text-right">Total</div>
                </div>

                <div className="space-y-0.5">
                  {orderBook?.asks.slice(0, 8).reverse().map((order, i) => (
                    <div key={i} className="grid grid-cols-3 text-destructive">
                      <div>{order.price.toFixed(2)}</div>
                      <div className="text-right">{order.amount.toFixed(4)}</div>
                      <div className="text-right">{(order.price * order.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {currentPrice && (
                  <div className={`py-2 text-center text-base font-bold border-y ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    ${currentPrice.price.toLocaleString()}
                  </div>
                )}

                <div className="space-y-0.5 pt-1">
                  {orderBook?.bids.slice(0, 8).map((order, i) => (
                    <div key={i} className="grid grid-cols-3 text-success">
                      <div>{order.price.toFixed(2)}</div>
                      <div className="text-right">{order.amount.toFixed(4)}</div>
                      <div className="text-right">{(order.price * order.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section - Mobile */}
          <div className="lg:hidden p-4 border-t border-border bg-card/50">
            <Tabs defaultValue="spot" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="spot">Spot</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="spot" className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={side === "buy" ? "default" : "outline"}
                    className={side === "buy" ? "bg-success hover:bg-success/90 flex-1" : "flex-1"}
                    onClick={() => setSide("buy")}
                    data-testid="button-buy-toggle"
                  >
                    Buy
                  </Button>
                  <Button
                    variant={side === "sell" ? "default" : "outline"}
                    className={side === "sell" ? "bg-destructive hover:bg-destructive/90 flex-1" : "flex-1"}
                    onClick={() => setSide("sell")}
                    data-testid="button-sell-toggle"
                  >
                    Sell
                  </Button>
                </div>

                <div>
                  <Label className="text-xs">Order Type</Label>
                  <Select value={orderType} onValueChange={(v: "market" | "limit") => setOrderType(v)}>
                    <SelectTrigger className="mt-1" data-testid="select-order-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType === "limit" && (
                  <div>
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-1"
                      data-testid="input-price"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                    data-testid="input-amount"
                  />
                </div>

                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setPercentage(percent)}
                      data-testid={`button-percent-${percent}`}
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  Available: {usableBalance.toFixed(2)} USDT
                </div>

                <Button
                  className={`w-full ${side === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                  onClick={handlePlaceOrder}
                  disabled={!amount || placeMutation.isPending}
                  data-testid="button-place-order"
                >
                  {placeMutation.isPending ? "Placing..." : side === "buy" ? "Buy" : "Sell"}
                </Button>
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                <Tabs defaultValue="current">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="current">Open</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="current" className="mt-3">
                    {activeOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No open orders
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeOrders.map(order => (
                          <div key={order.id} className="p-3 border rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span className={order.side === "buy" ? "text-success" : "text-destructive"}>
                                {order.side.toUpperCase()} {order.pair}
                              </span>
                              <span className="font-mono">{order.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="history" className="mt-3">
                    {completedOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No order history
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {completedOrders.map(order => (
                          <div key={order.id} className="p-3 border rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span className={order.side === "buy" ? "text-success" : "text-destructive"}>
                                {order.side.toUpperCase()} {order.pair}
                              </span>
                              <span className="text-muted-foreground">{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:flex lg:flex-col h-[calc(100vh-70px)]">
          {/* Order Book */}
          <div className="flex-1 border-b border-border overflow-auto">
            <div className="h-full flex flex-col">
              <div className="border-b border-border bg-card/50">
                <div className="w-full h-10 flex items-center px-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                    <BookOpen className="h-3 w-3 mr-2" />
                    Order Book
                  </div>
                </div>
              </div>

              <div className="flex-1 m-0 overflow-auto">
                <div className="p-3 space-y-1 text-xs font-mono">
                  <div className="grid grid-cols-3 text-muted-foreground pb-2 border-b">
                    <div>Price</div>
                    <div className="text-right">Size</div>
                    <div className="text-right">Total</div>
                  </div>

                  <div className="space-y-0.5">
                    {orderBook?.asks.slice(0, 10).reverse().map((order, i) => (
                      <div key={i} className="grid grid-cols-3 text-destructive hover:bg-destructive/5 cursor-pointer">
                        <div>{order.price.toFixed(2)}</div>
                        <div className="text-right">{order.amount.toFixed(4)}</div>
                        <div className="text-right">{(order.price * order.amount).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  {currentPrice && (
                    <div className={`py-2 text-center text-base font-bold border-y ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      ${currentPrice.price.toLocaleString()}
                    </div>
                  )}

                  <div className="space-y-0.5 pt-1">
                    {orderBook?.bids.slice(0, 10).map((order, i) => (
                      <div key={i} className="grid grid-cols-3 text-success hover:bg-success/5 cursor-pointer">
                        <div>{order.price.toFixed(2)}</div>
                        <div className="text-right">{order.amount.toFixed(4)}</div>
                        <div className="text-right">{(order.price * order.amount).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="h-[400px] border-t border-border overflow-auto bg-card/30">
            <div className="p-3">
              <Tabs defaultValue="spot" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="spot">Spot</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="spot" className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={side === "buy" ? "default" : "outline"}
                      className={side === "buy" ? "bg-success hover:bg-success/90 flex-1 text-xs" : "flex-1 text-xs"}
                      onClick={() => setSide("buy")}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={side === "sell" ? "default" : "outline"}
                      className={side === "sell" ? "bg-destructive hover:bg-destructive/90 flex-1 text-xs" : "flex-1 text-xs"}
                      onClick={() => setSide("sell")}
                    >
                      Sell
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={orderType} onValueChange={(v: "market" | "limit") => setOrderType(v)}>
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {orderType === "limit" && (
                    <div>
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>

                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-6 text-xs"
                        onClick={() => setPercentage(percent)}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Available: {usableBalance.toFixed(2)} USDT
                  </div>

                  <Button
                    className={`w-full h-9 text-xs ${side === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                    onClick={handlePlaceOrder}
                    disabled={!amount || placeMutation.isPending}
                  >
                    {placeMutation.isPending ? "..." : side === "buy" ? "Buy" : "Sell"}
                  </Button>
                </TabsContent>

                <TabsContent value="orders" className="mt-3">
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    {activeOrders.length === 0 ? "No open orders" : `${activeOrders.length} active`}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}