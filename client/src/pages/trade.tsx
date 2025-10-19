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

export default function Trade() {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState("XRP/USDT");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [secondDuration, setSecondDuration] = useState("60");

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

  const durations = [
    { value: "60", label: "60s" },
    { value: "120", label: "120s" },
    { value: "180", label: "180s" },
    { value: "300", label: "300s" },
    { value: "500", label: "500s" },
    { value: "720", label: "720s" },
    { value: "900", label: "900s" },
  ];

  const activeOrders = orders?.filter(o => o.status === "pending" || o.status === "partial") || [];
  const completedOrders = orders?.filter(o => o.status === "completed" || o.status === "cancelled") || [];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold" data-testid="text-trade-title">Trade</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <Tabs defaultValue="exchange" className="w-full">
          <TabsList className="w-full grid grid-cols-3 sticky top-[57px] z-30 rounded-none border-b bg-card">
            <TabsTrigger value="exchange" data-testid="tab-exchange">Exchange</TabsTrigger>
            <TabsTrigger value="second" data-testid="tab-second">Second</TabsTrigger>
            <TabsTrigger value="contracts" data-testid="tab-contracts">Contracts</TabsTrigger>
          </TabsList>

          <TabsContent value="exchange" className="mt-0 p-4 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Pair Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Trading Pair</Label>
                      <Select value={selectedPair} onValueChange={setSelectedPair}>
                        <SelectTrigger data-testid="select-pair">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                          <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                          <SelectItem value="XRP/USDT">XRP/USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {currentPrice && (
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="text-2xl font-mono font-bold text-success" data-testid="text-current-price">
                          ${currentPrice.price.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-4">
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
                      <Label>Transaction Mode</Label>
                      <Select value={orderType} onValueChange={(v: "market" | "limit") => setOrderType(v)}>
                        <SelectTrigger data-testid="select-order-type">
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
                        <Label>Price</Label>
                        <Input
                          type="number"
                          placeholder="Enter price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          data-testid="input-price"
                        />
                      </div>
                    )}

                    {orderType === "market" && (
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        Market Optimal Price
                      </div>
                    )}

                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        data-testid="input-amount"
                      />
                    </div>

                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <Button
                          key={percent}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setPercentage(percent)}
                          data-testid={`button-percent-${percent}`}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Usable: {usableBalance.toFixed(2)} USDT
                    </div>

                    <Button
                      className={`w-full ${side === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                      onClick={handlePlaceOrder}
                      disabled={!amount || placeMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {placeMutation.isPending ? "Placing..." : side === "buy" ? "Buy" : "Sell"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Book</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="grid grid-cols-2 text-xs text-muted-foreground pb-2 border-b">
                        <div>Price</div>
                        <div className="text-right">Amount</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-destructive font-semibold mb-1">Sell Orders</div>
                        {orderBook?.asks.slice(0, 5).reverse().map((order, i) => (
                          <div key={i} className="grid grid-cols-2 text-destructive">
                            <div>{order.price.toFixed(2)}</div>
                            <div className="text-right">{order.amount.toFixed(4)}</div>
                          </div>
                        ))}
                      </div>

                      {currentPrice && (
                        <div className="py-2 text-center text-lg font-bold text-success border-y">
                          ${currentPrice.price.toLocaleString()}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="text-xs text-success font-semibold mb-1">Buy Orders</div>
                        {orderBook?.bids.slice(0, 5).map((order, i) => (
                          <div key={i} className="grid grid-cols-2 text-success">
                            <div>{order.price.toFixed(2)}</div>
                            <div className="text-right">{order.amount.toFixed(4)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <Tabs defaultValue="current">
                <TabsList className="w-full">
                  <TabsTrigger value="current" className="flex-1" data-testid="tab-current-orders">Current Orders</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1" data-testid="tab-history-orders">History</TabsTrigger>
                </TabsList>
                <TabsContent value="current" className="p-4">
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No Data Yet!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeOrders.map(order => (
                        <div key={order.id} className="p-3 border rounded-lg">
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
                <TabsContent value="history" className="p-4">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No Data Yet!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {completedOrders.map(order => (
                        <div key={order.id} className="p-3 border rounded-lg">
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
            </Card>
          </TabsContent>

          <TabsContent value="second" className="mt-0 p-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">XRP/USDT</CardTitle>
                  {currentPrice && (
                    <div className="text-xl font-mono font-bold text-success">
                      ${currentPrice.price.toFixed(4)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Transaction Mode</Label>
                  <Select defaultValue="usdt">
                    <SelectTrigger data-testid="select-second-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdt">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Opening Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    data-testid="input-second-quantity"
                  />
                </div>

                <div>
                  <Label>Open Time</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {durations.map((duration) => (
                      <Button
                        key={duration.value}
                        variant={secondDuration === duration.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSecondDuration(duration.value)}
                        data-testid={`button-duration-${duration.value}`}
                      >
                        {duration.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Profit Rate</div>
                  <div className="text-2xl font-bold">87.00%</div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Usable: {usableBalance.toFixed(2)} USDT
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-success hover:bg-success/90" data-testid="button-second-buy">
                    Buy
                  </Button>
                  <Button className="bg-destructive hover:bg-destructive/90" data-testid="button-second-sell">
                    Sell
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <Tabs defaultValue="open">
                <TabsList className="w-full">
                  <TabsTrigger value="open" className="flex-1">Open Orders</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">Order History</TabsTrigger>
                </TabsList>
                <TabsContent value="open" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No Data Yet!</p>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No Data Yet!</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="mt-0 p-4">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Futures and contracts trading will be available soon. Stay tuned!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
