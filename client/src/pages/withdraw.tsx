import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Wallet } from "@shared/schema";
import { AlertCircle } from "lucide-react";

export default function Withdraw() {
  const { toast } = useToast();
  const [currency, setCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const selectedWallet = wallets?.find(w => w.currency === currency);

  const withdrawMutation = useMutation({
    mutationFn: async (data: { currency: string; amount: number; address: string }) => {
      const res = await apiRequest("POST", "/api/transactions/withdraw", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Withdrawal failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Withdrawal submitted",
        description: "Your withdrawal request is being processed. Funds will be sent to the blockchain network.",
      });
      setAmount("");
      setAddress("");
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    if (!address || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter both withdrawal address and amount",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      currency,
      amount: parseFloat(amount),
      address,
    });
  };

  const availableBalance = selectedWallet ? parseFloat(selectedWallet.balance) : 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Withdraw</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Withdraw Cryptocurrency</h2>
          <p className="text-muted-foreground">Send funds to an external wallet</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>
              Enter the destination address and amount to withdraw
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Select Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedWallet && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Balance</span>
                  <span className="font-mono font-semibold" data-testid="available-balance">
                    {availableBalance.toFixed(8)} {currency}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Withdrawal Address</Label>
              <Input
                id="address"
                placeholder="Enter recipient wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono"
                data-testid="input-withdraw-address"
              />
              <p className="text-xs text-muted-foreground">
                Double-check the address. Transactions cannot be reversed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-withdraw-amount"
              />
              {selectedWallet && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((availableBalance * 0.25).toFixed(8))}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((availableBalance * 0.5).toFixed(8))}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((availableBalance * 0.75).toFixed(8))}
                  >
                    75%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(availableBalance.toFixed(8))}
                  >
                    Max
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-primary">Withdrawal Information</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Double-check the destination address - transactions are irreversible</li>
                  <li>Network fee: ~0.0001 {currency}</li>
                  <li>Minimum withdrawal: 0.001 {currency}</li>
                  <li>Processing time: 10-30 minutes depending on network</li>
                  <li>Transactions are sent to the blockchain immediately</li>
                </ul>
              </div>
            </div>

            {amount && selectedWallet && (
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You will receive</span>
                  <span className="font-mono font-semibold">
                    {(parseFloat(amount) - 0.0001).toFixed(8)} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network fee</span>
                  <span className="font-mono">0.0001 {currency}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              variant="destructive"
              onClick={handleWithdraw}
              disabled={!address || !amount || withdrawMutation.isPending || parseFloat(amount) > availableBalance}
              data-testid="button-confirm-withdraw"
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
