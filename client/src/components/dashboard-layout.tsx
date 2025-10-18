import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Home, TrendingUp, Wallet, History, LogOut, BarChart3, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
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

  const menuItems = [
    { title: "Markets", url: "/dashboard", icon: Home },
    { title: "Trade", url: "/trade", icon: TrendingUp },
    { title: "Portfolio", url: "/portfolio", icon: Wallet },
    { title: "Transactions", url: "/transactions", icon: History },
    { title: "Trading History", url: "/history", icon: BarChart3 },
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/dashboard">
              <div className="flex items-center gap-2 hover-elevate p-2 rounded-lg cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-lg font-bold">CryptoTrade</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Link href={item.url}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <a className="flex items-center gap-3 w-full" data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/deposit">
                      <SidebarMenuButton asChild>
                        <a className="flex items-center gap-3 w-full" data-testid="link-deposit">
                          <ArrowDownToLine className="h-4 w-4 text-success" />
                          <span>Deposit</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/withdraw">
                      <SidebarMenuButton asChild>
                        <a className="flex items-center gap-3 w-full" data-testid="link-withdraw">
                          <ArrowUpFromLine className="h-4 w-4 text-destructive" />
                          <span>Withdraw</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            {user && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-sidebar-accent">
                  <p className="text-sm font-medium truncate" data-testid="text-username">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => logoutMutation.mutate()}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">
                {menuItems.find(item => item.url === location)?.title || 
                 location === '/deposit' ? 'Deposit' :
                 location === '/withdraw' ? 'Withdraw' :
                 'Dashboard'}
              </h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}