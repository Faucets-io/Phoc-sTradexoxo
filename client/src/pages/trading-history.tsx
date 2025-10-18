
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface TradeHistory {
  id: string;
  pair: string;
  amount: string;
  price: string;
  side: "buy" | "sell";
  createdAt: string;
}

export default function TradingHistory() {
  const { data: trades, isLoading } = useQuery<TradeHistory[]>({
    queryKey: ["/api/trades/history"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Trading History</h2>
          <p className="text-muted-foreground">Your complete trading activity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
                ))}
              </div>
            ) : trades && trades.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-sm">
                        {format(new Date(trade.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{trade.pair}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={trade.side === "buy" ? "default" : "destructive"}
                          className={trade.side === "buy" ? "bg-success" : ""}
                        >
                          {trade.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{parseFloat(trade.amount).toFixed(8)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(parseFloat(trade.price))}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(parseFloat(trade.amount) * parseFloat(trade.price))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No trades yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start trading to see your history here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
