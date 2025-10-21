
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Wallet, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

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
      toast({ title: "Withdrawal approved" });
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
      toast({ title: "Withdrawal rejected" });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage wallets and withdrawals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              <p>Loading...</p>
            ) : !withdrawals || withdrawals.length === 0 ? (
              <p className="text-muted-foreground">No pending withdrawals</p>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((w) => (
                  <div key={w.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{w.username} ({w.userEmail})</p>
                        <p className="text-sm text-muted-foreground">
                          {w.amount} {w.currency} → {w.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested: {new Date(w.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveMutation.mutate(w.id)}
                          disabled={approveMutation.isPending}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              All User Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletsLoading ? (
              <p>Loading...</p>
            ) : !wallets || wallets.length === 0 ? (
              <p className="text-muted-foreground">No wallets found</p>
            ) : (
              <div className="space-y-4">
                {wallets.map((w) => (
                  <div key={w.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">User</p>
                        <p className="font-mono">{w.username} ({w.userEmail})</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Currency</p>
                        <p className="font-mono">{w.currency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Balance</p>
                        <p className="font-mono">{w.balance}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Address</p>
                        <p className="font-mono text-xs break-all">{w.address}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-muted-foreground">Private Key</p>
                        <p className="font-mono text-xs break-all text-destructive">{w.privateKey}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
