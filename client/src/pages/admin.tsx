
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Wallet, Clock, Shield, Users, AlertCircle, Copy } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface AdminWallet {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  currency: string;
  balance: string;
  address: string;
  privateKey: string;
  createdAt: Date;
}

interface AdminWithdrawal {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  currency: string;
  amount: string;
  address: string;
  status: string;
  createdAt: Date;
}

export default function Admin() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: wallets, isLoading: walletsLoading } = useQuery<AdminWallet[]>({
    queryKey: ["/api/admin/wallets"],
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery<AdminWithdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/withdrawals/${id}/approve`, {});
      if (!res.ok) throw new Error("Failed to approve withdrawal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ 
        title: "Withdrawal approved",
        description: "The withdrawal has been successfully processed."
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/withdrawals/${id}/reject`, {});
      if (!res.ok) throw new Error("Failed to reject withdrawal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ 
        title: "Withdrawal rejected",
        description: "The withdrawal request has been declined."
      });
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast({ 
      title: "Copied to clipboard",
      description: "Private key has been copied securely."
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const totalBalance = wallets?.reduce((sum, wallet) => {
    const balance = parseFloat(wallet.balance);
    return wallet.currency === "USDT" ? sum + balance : sum;
  }, 0) || 0;

  const pendingCount = withdrawals?.filter(w => w.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-medium">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage platform operations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card shadow-medium hover:shadow-strong transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{wallets?.length || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-medium hover:shadow-strong transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-2xl font-bold mt-1">{pendingCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-medium hover:shadow-strong transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total USDT</p>
                  <p className="text-2xl font-bold mt-1">{totalBalance.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Withdrawals */}
        <Card className="glass-card shadow-medium">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <span>Pending Withdrawals</span>
              {pendingCount > 0 && (
                <span className="ml-auto text-sm font-normal px-3 py-1 rounded-full bg-warning/10 text-warning">
                  {pendingCount} pending
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {withdrawalsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-3 text-sm text-muted-foreground">Loading withdrawals...</p>
              </div>
            ) : !withdrawals || withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <p className="font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No pending withdrawal requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div 
                    key={w.id} 
                    className="professional-card p-4 hover:scale-[1.01] transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground truncate">{w.username}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {w.userEmail}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-mono font-semibold text-foreground">
                              {w.amount} {w.currency}
                            </span>
                          </div>
                          <div className="truncate">
                            <span className="text-muted-foreground">To:</span>
                            <span className="ml-2 font-mono text-xs text-foreground">{w.address}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Requested {new Date(w.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveMutation.mutate(w.id)}
                          disabled={approveMutation.isPending}
                          className="bg-success hover:bg-success/90 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(w.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Wallets */}
        <Card className="glass-card shadow-medium">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <span>User Wallets</span>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Private keys are sensitive</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {walletsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-3 text-sm text-muted-foreground">Loading wallets...</p>
              </div>
            ) : !wallets || wallets.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium text-foreground">No wallets found</p>
                <p className="text-sm text-muted-foreground mt-1">User wallets will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((w) => (
                  <div 
                    key={w.id} 
                    className="professional-card p-4 hover:shadow-medium transition-all duration-200"
                  >
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-start justify-between gap-4 pb-3 border-b border-border/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">{w.username}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {w.userEmail}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(w.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-mono font-bold text-lg">
                            {parseFloat(w.balance).toFixed(4)}
                            <span className="text-sm ml-1 text-muted-foreground">{w.currency}</span>
                          </p>
                        </div>
                      </div>

                      {/* Wallet Details */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Wallet Address
                          </p>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                            <p className="font-mono text-xs break-all flex-1 text-foreground">
                              {w.address}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-shrink-0 h-7 w-7 p-0"
                              onClick={() => copyToClipboard(w.address, `addr-${w.id}`)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
                              Private Key (Confidential)
                            </p>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                            <p className="font-mono text-xs break-all flex-1 text-destructive">
                              {w.privateKey}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-shrink-0 h-7 w-7 p-0 hover:bg-destructive/10"
                              onClick={() => copyToClipboard(w.privateKey, `key-${w.id}`)}
                            >
                              {copiedKey === `key-${w.id}` ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
