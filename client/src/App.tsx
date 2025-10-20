import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Market from "@/pages/market";
import Portfolio from "@/pages/portfolio";
import Trade from "@/pages/trade";
import Grow from "@/pages/grow";
import UserCenter from "@/pages/user";
import Transactions from "@/pages/transactions";
import Deposit from "@/pages/deposit";
import Withdraw from "@/pages/withdraw";
import TradingHistory from "@/pages/trading-history";
import Settings from "@/pages/settings";
import Notifications from "@/pages/notifications";
import Documents from "@/pages/documents";
import Certification from "@/pages/certification";
import Help from "@/pages/help";
import Assistant from "@/pages/assistant";
import Feedback from "@/pages/feedback";
import Referral from "@/pages/referral";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/market" component={Market} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/trade" component={Trade} />
      <Route path="/grow" component={Grow} />
      <Route path="/user" component={UserCenter} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/withdraw" component={Withdraw} />
      <Route path="/history" component={TradingHistory} />
      <Route path="/settings" component={Settings} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/documents" component={Documents} />
      <Route path="/certification" component={Certification} />
      <Route path="/help" component={Help} />
      <Route path="/assistant" component={Assistant} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/referral" component={Referral} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;