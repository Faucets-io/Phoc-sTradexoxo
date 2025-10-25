import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Wallet, Clock, Shield, Users, AlertCircle, Copy, Ban, Trash2, Send, UserX, UserCheck } from "lucide-react";
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

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date;
}

export default function Admin() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");

  const { data: wallets, isLoading: walletsLoading } = useQuery<AdminWallet[]>({
    queryKey: ["/api/admin/wallets"],
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery<AdminWithdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
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
        variant: "success",
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
        variant: "destructive",
        title: "Withdrawal rejected",
        description: "The withdrawal request has been declined."
      });
    },
  });

  const banMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/ban`, {});
      if (!res.ok) throw new Error("Failed to ban user");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        variant: "success",
        title: "User banned",
        description: `User ${variables} has been banned successfully.`,
      });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/unban`, {});
      if (!res.ok) throw new Error("Failed to unban user");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        variant: "success",
        title: "User unbanned",
        description: `User ${variables} has been unbanned successfully.`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`, {});
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
      toast({
        variant: "success",
        title: "User deleted",
        description: "The user and all their data has been deleted.",
      });
    },
  });

  const notifyMutation = useMutation({
    mutationFn: async ({ userId, title, message, type }: { userId: string; title: string; message: string; type: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/notify`, { title, message, type });
      if (!res.ok) throw new Error("Failed to send notification");
      return res.json();
    },
    onSuccess: () => {
      setNotifyDialogOpen(false);
      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationType("info");
      setSelectedUserId(null);
      toast({
        variant: "success",
        title: "Notification sent",
        description: "The notification has been sent to the user."
      });
    },
  });

  const notifyAllMutation = useMutation({
    mutationFn: async ({ title, message, type }: { title: string; message: string; type: string }) => {
      const res = await apiRequest("POST", `/api/admin/notify-all`, { title, message, type });
      if (!res.ok) throw new Error("Failed to send notification");
      return res.json();
    },
    onSuccess: () => {
      setNotifyDialogOpen(false);
      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationType("info");
      toast({
        variant: "success",
        title: "Notification sent",
        description: "The notification has been sent to all users."
      });
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast({
      variant: "success",
      title: "Copied to clipboard",
      description: "Private key has been copied securely."
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendNotification = () => {
    if (!notificationTitle || !notificationMessage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    if (selectedUserId) {
      notifyMutation.mutate({ userId: selectedUserId, title: notificationTitle, message: notificationMessage, type: notificationType });
    } else {
      notifyAllMutation.mutate({ title: notificationTitle, message: notificationMessage, type: notificationType });
    }
  };

  const totalBalance = wallets?.reduce((sum, wallet) => {
    const balance = parseFloat(wallet.balance);
    return wallet.currency === "USDT" ? sum + balance : sum;
  }, 0) || 0;

  const pendingCount = withdrawals?.filter(w => w.status === "pending").length || 0;
  const totalUsers = allUsers?.length || 0;
  const bannedUsers = allUsers?.filter(u => u.isBanned).length || 0;

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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="glass-card shadow-medium hover:shadow-strong transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{totalUsers}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Banned Users</p>
                  <p className="text-2xl font-bold mt-1">{bannedUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Ban className="h-6 w-6 text-destructive" />
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

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="glass-card shadow-medium">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span>User Management</span>
                  </CardTitle>
                  <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedUserId(null)}>
                        <Send className="h-4 w-4 mr-2" />
                        Notify All
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Notification</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={notificationType} onValueChange={setNotificationType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={notificationTitle}
                            onChange={(e) => setNotificationTitle(e.target.value)}
                            placeholder="Notification title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            value={notificationMessage}
                            onChange={(e) => setNotificationMessage(e.target.value)}
                            placeholder="Notification message"
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendNotification} disabled={notifyMutation.isPending || notifyAllMutation.isPending}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-3 text-sm text-muted-foreground">Loading users...</p>
                  </div>
                ) : !allUsers || allUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-4">
                      <Users className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium text-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers.map((user) => (
                      <div
                        key={user.id}
                        className="professional-card p-4 hover:shadow-medium transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">{user.username}</p>
                              {user.isAdmin && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  Admin
                                </span>
                              )}
                              {user.isBanned && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                                  Banned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setNotifyDialogOpen(true);
                              }}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Notify
                            </Button>
                            {!user.isAdmin && (
                              <>
                                {user.isBanned ? (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => unbanMutation.mutate(user.id)}
                                    disabled={unbanMutation.isPending}
                                    className="bg-success hover:bg-success/90"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => banMutation.mutate(user.id)}
                                    disabled={banMutation.isPending}
                                    className="text-warning hover:text-warning"
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Ban
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
                                      deleteMutation.mutate(user.id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
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
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}