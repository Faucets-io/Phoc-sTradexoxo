
import { useState, useEffect } from "react";
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
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Maximize2, Settings, MessageSquare, BookOpen } from "lucide-react";

// Generate realistic candlestick data
const generateChartData = (timeframe: string, currentPrice: number) => {
  const points = timeframe === "1m" ? 60 : timeframe === "5m" ? 72 : timeframe === "15m" ? 96 : timeframe === "1h" ? 168 : 240;
  const data = [];
  let price = currentPrice * 0.98;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * (currentPrice * 0.01);
    price = price + change;
    price = Math.max(price, currentPrice * 0.90);
    price = Math.min(price, currentPrice * 1.10);
    
    const timeMs = Date.now() - (points - i) * (timeframe === "1m" ? 60000 : timeframe === "5m" ? 300000 : timeframe === "15m" ? 900000 : timeframe === "1h" ? 3600000 : 14400000);
    
    data.push({
      time: new Date(timeMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Number(price.toFixed(2)),
      volume: Math.random() * 1000000,
    });
  }
  
  return data;
};

export default function Trade() {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [timeframe, setTimeframe] = useState("15m");
  const [chartType, setChartType] = useState<"line" | "area">("area");

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

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (currentPrice) {
      setChartData(generateChartData(timeframe, currentPrice.price));
    }
  }, [currentPrice, timeframe, selectedPair]);

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

  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "1h", label: "1H" },
    { value: "4h", label: "4H" },
  ];

  const activeOrders = orders?.filter(o => o.status === "pending" || o.status === "partial") || [];
  const completedOrders = orders?.filter(o => o.status === "completed" || o.status === "cancelled") || [];

  const priceChange = currentPrice?.change24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-[140px] border-0 font-bold text-lg" data-testid="select-pair">
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
                <div>
                  <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-success' : 'text-destructive'}`} data-testid="text-current-price">
                    ${currentPrice.price.toLocaleString()}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-0">
        {/* Chart Section */}
        <div className="border-r border-border">
          {/* Chart Controls */}
          <div className="flex items-center justify-between border-b border-border p-2 bg-card/50">
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  variant={timeframe === tf.value ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setTimeframe(tf.value)}
                  data-testid={`button-timeframe-${tf.value}`}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setChartType("line")}
              >
                Line
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setChartType("area")}
              >
                Area
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[400px] lg:h-[calc(100vh-180px)] bg-card/30 p-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={80}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={80}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Order Book & Trades - Mobile */}
          <div className="lg:hidden border-t border-border">
            <Tabs defaultValue="orderbook" className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                <TabsTrigger value="trades">Recent Trades</TabsTrigger>
              </TabsList>
              <TabsContent value="orderbook" className="p-3 m-0">
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
              </TabsContent>
              <TabsContent value="trades" className="p-3 m-0">
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Recent trades will appear here
                </div>
              </TabsContent>
            </Tabs>
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
          {/* Order Book & Trades Tabs */}
          <div className="flex-1 border-b border-border overflow-auto">
            <Tabs defaultValue="orderbook" className="h-full flex flex-col">
              <div className="border-b border-border bg-card/50">
                <TabsList className="w-full grid grid-cols-2 rounded-none h-10">
                  <TabsTrigger value="orderbook" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Order Book
                  </TabsTrigger>
                  <TabsTrigger value="trades" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Trades
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="orderbook" className="flex-1 m-0 overflow-auto">
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
              </TabsContent>

              <TabsContent value="trades" className="flex-1 m-0 overflow-auto p-3">
                <div className="space-y-1 text-xs font-mono">
                  <div className="grid grid-cols-3 text-muted-foreground pb-2 border-b">
                    <div>Price</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Time</div>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    Recent trades will appear here
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
