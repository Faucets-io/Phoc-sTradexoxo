import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  Settings, 
  LogOut,
  Shield,
  Bell
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function UserCenter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
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
      });
      setLocation("/");
    },
  });

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold" data-testid="text-user-title">User Center</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {user && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold" data-testid="text-username">
                    {user.username}
                  </h2>
                  <p className="text-sm text-muted-foreground" data-testid="text-email">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => setLocation("/deposit")}
            data-testid="button-deposit"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ArrowDownToLine className="h-5 w-5 text-success" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Deposit</div>
                <div className="text-xs text-muted-foreground">Add funds to your account</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => setLocation("/withdraw")}
            data-testid="button-withdraw"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ArrowUpFromLine className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Withdraw</div>
                <div className="text-xs text-muted-foreground">Send funds to external wallet</div>
              </div>
            </div>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => setLocation("/transactions")}
              data-testid="button-transactions"
            >
              <History className="h-5 w-5 mr-3" />
              <span>Transaction History</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => setLocation("/portfolio")}
              data-testid="button-portfolio"
            >
              <ArrowDownToLine className="h-5 w-5 mr-3" />
              <span>Portfolio</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Account Settings</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5 mr-3" />
              <span>Notifications</span>
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
