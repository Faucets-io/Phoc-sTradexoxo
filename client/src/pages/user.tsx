import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  FileText,
  Award,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  Bell,
  ChevronRight,
  Shield
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Wallet as WalletType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function UserCenter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: wallets } = useQuery<WalletType[]>({
    queryKey: ["/api/wallets"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
        variant: "success",
      });
      setLocation("/");
    },
  });

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const totalBalance = wallets?.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Section */}
        {user && (
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="h-14 w-14 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-base font-semibold" data-testid="text-username">
                {user.email || user.username}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-user-id">
                ID:{user.id.substring(0, 6)}
              </p>
            </div>
          </div>
        )}

        {/* Total Assets Card */}
        <div className="bg-primary rounded-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-foreground/90 text-sm mb-1">Total Assets≈</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-primary-foreground text-4xl font-bold" data-testid="text-total-balance">
                  {totalBalance.toFixed(2)}
                </span>
                <span className="text-primary-foreground/90 text-lg ml-2">USDT</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white hover:bg-white/90 text-foreground"
                onClick={() => setLocation("/portfolio")}
                data-testid="button-assets"
              >
                Assets
              </Button>
            </div>
          </div>
        </div>

        {/* Commonly Used Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Commonly Used</h3>
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setLocation("/portfolio")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-assets-quick"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Assets</span>
            </button>

            <button
              onClick={() => setLocation("/deposit")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-deposit-quick"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowDownToLine className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Deposit</span>
            </button>

            <button
              onClick={() => setLocation("/withdraw")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-withdraw-quick"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowUpFromLine className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Withdraw</span>
            </button>

            <button
              onClick={() => setLocation("/transactions")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-transfer-quick"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRightLeft className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-foreground">Transfer</span>
            </button>
          </div>
        </div>

        {/* More Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">More</h3>
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setLocation("/history")}
              className="flex flex-col items-center gap-2 p-3"
              data-testid="button-records"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-foreground">Records</span>
            </button>

            <button
              onClick={() => setLocation("/certification")}
              className="flex flex-col items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors"
              data-testid="button-certification"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-foreground">Certification</span>
            </button>

            <button
              onClick={() => setLocation("/settings")}
              className="flex flex-col items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors"
              data-testid="button-settings"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-foreground">Settings</span>
            </button>

            <button
              onClick={() => setLocation("/help")}
              className="flex flex-col items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors"
              data-testid="button-help"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-foreground">Help</span>
            </button>

            <button
              onClick={() => setLocation("/assistant")}
              className="flex flex-col items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors"
              data-testid="button-assistant"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-foreground">Assistant</span>
            </button>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-1">
          <Card
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setLocation("/notifications")}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Notifications</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setLocation("/settings")}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setLocation("/documents")}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Documents</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}