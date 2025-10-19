import { useLocation } from "wouter";
import { Home, TrendingUp, BarChart3, TrendingDown, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Home",
      testId: "nav-home"
    },
    {
      path: "/market",
      icon: BarChart3,
      label: "Market",
      testId: "nav-market"
    },
    {
      path: "/trade",
      icon: TrendingUp,
      label: "Trade",
      testId: "nav-trade"
    },
    {
      path: "/grow",
      icon: TrendingDown,
      label: "Grow",
      testId: "nav-grow"
    },
    {
      path: "/user",
      icon: User,
      label: "User",
      testId: "nav-user"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location === path;
          return (
            <a
              key={path}
              href={path}
              data-testid={testId}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-primary" : ""}`} />
              <span className="text-xs font-medium">{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
