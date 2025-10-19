import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Coins, Target } from "lucide-react";

export default function Grow() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold" data-testid="text-grow-title">Grow</h1>
          <p className="text-sm text-muted-foreground">Earn rewards with your crypto</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Staking</CardTitle>
                  <CardDescription>Earn up to 12% APY</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stake your crypto and earn passive income with competitive rewards.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Yield Farming</CardTitle>
                  <CardDescription>Maximize your returns</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Provide liquidity and earn rewards from trading fees.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Savings</CardTitle>
                  <CardDescription>Flexible terms</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deposit crypto and earn interest with flexible withdrawal options.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Card className="p-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                We're working on bringing you more ways to grow your crypto holdings. Stay tuned for updates!
              </p>
            </div>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
