import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@shared/schema";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function Transactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Transaction History</h2>
          <p className="text-muted-foreground">View all your deposits and withdrawals</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id} className="hover-elevate transition-all" data-testid={`transaction-${tx.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {tx.type === "deposit" ? (
                          <ArrowDownToLine className="h-6 w-6 text-success" />
                        ) : (
                          <ArrowUpFromLine className="h-6 w-6 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold capitalize">{tx.type}</h4>
                          <Badge variant={getStatusVariant(tx.status)}>
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                          {tx.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-2xl font-bold font-mono ${tx.type === "deposit" ? "text-success" : "text-destructive"}`} data-testid={`amount-${tx.id}`}>
                        {tx.type === "deposit" ? "+" : "-"}{parseFloat(tx.amount).toFixed(8)}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.currency}</p>
                      {tx.txHash && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          TX: {tx.txHash.substring(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <ArrowDownToLine className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-semibold mb-1">No transactions yet</p>
                <p className="text-sm text-muted-foreground">
                  Your deposit and withdrawal history will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
