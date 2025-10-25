import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "@/components/protected-route";
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
import NotFound from "@/pages/not-found";
import Admin from "@/pages/admin";
import KycVerification from "@/pages/kyc-verification";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/market">
        <ProtectedRoute><Market /></ProtectedRoute>
      </Route>
      <Route path="/portfolio">
        <ProtectedRoute><Portfolio /></ProtectedRoute>
      </Route>
      <Route path="/trade">
        <ProtectedRoute><Trade /></ProtectedRoute>
      </Route>
      <Route path="/grow">
        <ProtectedRoute><Grow /></ProtectedRoute>
      </Route>
      <Route path="/user">
        <ProtectedRoute><UserCenter /></ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute><Transactions /></ProtectedRoute>
      </Route>
      <Route path="/deposit">
        <ProtectedRoute><Deposit /></ProtectedRoute>
      </Route>
      <Route path="/withdraw">
        <ProtectedRoute><Withdraw /></ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute><TradingHistory /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute><Notifications /></ProtectedRoute>
      </Route>
      <Route path="/documents">
        <ProtectedRoute><Documents /></ProtectedRoute>
      </Route>
      <Route path="/certification">
        <ProtectedRoute><Certification /></ProtectedRoute>
      </Route>
      <Route path="/help">
        <ProtectedRoute><Help /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute><Admin /></ProtectedRoute>
      </Route>
      <Route path="/kyc">
        <ProtectedRoute><KycVerification /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;