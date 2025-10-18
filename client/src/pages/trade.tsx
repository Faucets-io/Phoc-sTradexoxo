import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Order } from "@shared/schema";

export default function Trade() {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // Assume livePrice is fetched from a WebSocket or another real-time source
  // For demonstration, let's use a placeholder or a mock value
  const livePrice = 40000; // Example live price

  const { data: currentPrice } = useQuery<{ price: number; change24h: number }>({
    queryKey: ["/api/markets/price", selectedPair],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: orderBook } = useQuery<{ bids: Array<{ price: number; amount: number }>; asks: Array<{ price: number; amount: number }> }>({
    queryKey: ["/api/markets/orderbook", selectedPair],
  });

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
    const [baseCurrency, quoteCurrency] = selectedPair.split('/');
    placeMutation.mutate({
      type: orderType,
      side,
      pair: selectedPair,
      baseCurrency,
      quoteCurrency,
      amount: parseFloat(amount),
      price: orderType === "limit" ? parseFloat(price) : null,
    });
  };

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiRequest("DELETE", `/api/orders/${orderId}`, {});
      if (!res.ok) throw new Error("Failed to cancel order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col p-3 sm:p-6 gap-3 sm:gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">{selectedPair}</h2>
            <div className="flex items-center gap-4">
              {currentPrice && (
                <>
                  <p className="text-xl sm:text-2xl font-bold font-mono" data-testid="current-price">
                    ${currentPrice.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center gap-1 ${currentPrice.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {currentPrice.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-semibold font-mono">
                      {currentPrice.change24h >= 0 ? '+' : ''}{currentPrice.change24h.toFixed(2)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-6 flex-1">
          <Card>
            <CardHeader className="pb-3 p-4">
              <CardTitle className="flex flex-col gap-2 text-base">
                <span className="text-muted-foreground text-sm">BTC/USDT</span>
                <span className="font-mono text-2xl text-success">
                  {currentPrice ? `$${currentPrice.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[250px] bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Trading Chart</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Place Order</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Tabs defaultValue="buy" onValueChange={(v) => setSide(v as "buy" | "sell")}>
                <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
                  <TabsTrigger value="buy" className="data-[state=active]:text-success text-sm" data-testid="tab-buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:text-destructive text-sm" data-testid="tab-sell">Sell</TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="market" data-testid="tab-market">Market</TabsTrigger>
                        <TabsTrigger value="limit" data-testid="tab-limit">Limit</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {orderType === "limit" && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm">Price (USDT)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="font-mono text-base h-12"
                        inputMode="decimal"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm">Amount (BTC)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00000000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="font-mono text-base h-12"
                      inputMode="decimal"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-muted space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-mono font-semibold">
                        {amount && (orderType === "market" && (livePrice || currentPrice?.price) || orderType === "limit" && price)
                          ? `$${(parseFloat(amount) * (orderType === "market" ? (livePrice || currentPrice!.price) : parseFloat(price))).toFixed(2)}`
                          : "$0.00"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base bg-success hover:bg-success/90 text-white"
                    onClick={handlePlaceOrder}
                    disabled={!amount || (orderType === "limit" && !price) || placeMutation.isPending}
                    data-testid="button-place-buy-order"
                  >
                    {placeMutation.isPending ? "Placing Order..." : "Buy BTC"}
                  </Button>
                </TabsContent>

                <TabsContent value="sell" className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="market" data-testid="tab-market">Market</TabsTrigger>
                        <TabsTrigger value="limit" data-testid="tab-limit">Limit</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {orderType === "limit" && (
                    <div className="space-y-2">
                      <Label htmlFor="sell-price" className="text-sm">Price (USDT)</Label>
                      <Input
                        id="sell-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="font-mono text-base h-12"
                        inputMode="decimal"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="sell-amount" className="text-sm">Amount (BTC)</Label>
                    <Input
                      id="sell-amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00000000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="font-mono text-base h-12"
                      inputMode="decimal"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-muted space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-mono font-semibold">
                        {amount && (orderType === "market" && (livePrice || currentPrice?.price) || orderType === "limit" && price)
                          ? `$${(parseFloat(amount) * (orderType === "market" ? (livePrice || currentPrice!.price) : parseFloat(price))).toFixed(2)}`
                          : "$0.00"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base bg-destructive hover:bg-destructive/90 text-white"
                    onClick={handlePlaceOrder}
                    disabled={!amount || (orderType === "limit" && !price) || placeMutation.isPending}
                    data-testid="button-place-sell-order"
                  >
                    {placeMutation.isPending ? "Placing Order..." : "Sell BTC"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Book</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-success mb-3">Bids (Buy Orders)</h4>
                  <div className="space-y-1">
                    {orderBook?.bids.slice(0, 10).map((bid, i) => (
                      <div key={i} className="flex justify-between text-sm font-mono">
                        <span className="text-success">${bid.price.toFixed(2)}</span>
                        <span className="text-muted-foreground">{bid.amount.toFixed(8)}</span>
                      </div>
                    ))}
                    {(!orderBook?.bids || orderBook.bids.length === 0) && (
                      <p className="text-sm text-muted-foreground">No bids</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-destructive mb-3">Asks (Sell Orders)</h4>
                  <div className="space-y-1">
                    {orderBook?.asks.slice(0, 10).map((ask, i) => (
                      <div key={i} className="flex justify-between text-sm font-mono">
                        <span className="text-destructive">${ask.price.toFixed(2)}</span>
                        <span className="text-muted-foreground">{ask.amount.toFixed(8)}</span>
                      </div>
                    ))}
                    {(!orderBook?.asks || orderBook.asks.length === 0) && (
                      <p className="text-sm text-muted-foreground">No asks</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders && orders.filter(o => o.status === "pending" || o.status === "partial").length > 0 ? (
                  orders.filter(o => o.status === "pending" || o.status === "partial").map((order) => (
                    <div key={order.id} className="p-3 rounded-lg border border-border space-y-2" data-testid={`order-${order.id}`}>
                      <div className="flex items-center justify-between">
                        <Badge variant={order.side === "buy" ? "default" : "destructive"} className={order.side === "buy" ? "bg-success" : ""}>
                          {order.side.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{order.type}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-mono">{parseFloat(order.amount).toFixed(8)} {order.baseCurrency}</span>
                        </div>
                        {order.price && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-mono">${parseFloat(order.price).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => cancelMutation.mutate(order.id)}
                        data-testid={`button-cancel-${order.id}`}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No open orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}