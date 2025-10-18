import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, CheckCircle2 } from "lucide-react";
import type { Wallet } from "@shared/schema";

export default function Deposit() {
  const { toast } = useToast();
  const [currency, setCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const selectedWallet = wallets?.find(w => w.currency === currency);

  const depositMutation = useMutation({
    mutationFn: async (data: { currency: string; amount: number; address: string }) => {
      const res = await apiRequest("POST", "/api/transactions/deposit", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Deposit failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Deposit initiated",
        description: "Your deposit is being processed. It may take a few minutes to confirm.",
      });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyAddress = () => {
    if (selectedWallet) {
      navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeposit = () => {
    if (selectedWallet) {
      depositMutation.mutate({
        currency,
        amount: parseFloat(amount),
        address: selectedWallet.address,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Deposit Cryptocurrency</h2>
          <p className="text-muted-foreground">Add funds to your trading account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Details</CardTitle>
            <CardDescription>
              Send cryptocurrency to your unique wallet address
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

            {selectedWallet ? (
              <>
                <div className="space-y-2">
                  <Label>Your {currency} Deposit Address</Label>
                  <div className="flex gap-2">
                    <Input
                      value={selectedWallet.address}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-deposit-address"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAddress}
                      data-testid="button-copy-address"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send only {currency} to this address. Sending other coins may result in permanent loss.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <h4 className="font-semibold text-sm">Important Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Minimum deposit: 0.001 {currency}</li>
                    <li>Deposits require 3 network confirmations</li>
                    <li>Estimated arrival time: 10-30 minutes</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Deposit (for tracking)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-deposit-amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Enter the amount you're depositing to help track this transaction
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleDeposit}
                  disabled={!amount || depositMutation.isPending}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? "Confirming..." : "Confirm Deposit"}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Wallet address will be generated when you create your first wallet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
