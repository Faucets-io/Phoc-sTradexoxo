import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletType } from "@shared/schema";
import { TrendingUp, TrendingDown, Wallet as WalletIcon } from "lucide-react";

export default function Portfolio() {
  const { data: wallets, isLoading } = useQuery<WalletType[]>({
    queryKey: ["/api/wallets"],
  });

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(8);
  };

  const totalValue = wallets?.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance) * 50000;
  }, 0) || 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Portfolio</h2>
          <p className="text-muted-foreground">Manage your cryptocurrency holdings</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono" data-testid="total-balance">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">24h Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="h-5 w-5" />
                <span className="text-3xl font-bold font-mono">+5.24%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono" data-testid="total-assets">
                {wallets?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Your Wallets</h3>
          {isLoading ? (
            <div className="grid gap-4">
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
          ) : wallets && wallets.length > 0 ? (
            <div className="grid gap-4">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="hover-elevate transition-all" data-testid={`wallet-${wallet.currency}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <WalletIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{wallet.currency}</h4>
                          <p className="text-sm text-muted-foreground">Wallet Address</p>
                          <p className="text-xs font-mono text-muted-foreground">{wallet.address}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Balance</p>
                        <p className="text-2xl font-bold font-mono" data-testid={`balance-${wallet.currency}`}>
                          {formatBalance(wallet.balance)} {wallet.currency}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ≈ ${(parseFloat(wallet.balance) * 50000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <WalletIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="font-semibold mb-1">No wallets yet</p>
                  <p className="text-sm text-muted-foreground">
                    Deposit cryptocurrency to get started trading
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
