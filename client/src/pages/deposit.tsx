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
import { Copy, CheckCircle2 } from "lucide-react";
import type { Wallet } from "@shared/schema";

export default function Deposit() {
  const { toast } = useToast();
  const [currency, setCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: wallets, isLoading: walletsLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const selectedWallet = wallets?.find(w => w.currency === currency);

  // Generate a demo wallet address if none exists
  const getWalletAddress = (curr: string) => {
    if (selectedWallet?.address) return selectedWallet.address;
    
    // Generate demo addresses
    const addresses: Record<string, string> = {
      'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'ETH': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      'USDT': 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    };
    
    return addresses[curr] || 'Address generating...';
  };

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
        title: "Deposit tracked",
        description: "Your deposit has been recorded and will be credited after blockchain confirmation.",
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
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Deposit</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
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

            {!walletsLoading ? (
              <>
                <div className="space-y-2">
                  <Label>Your {currency} Deposit Address</Label>
                  <div className="flex gap-2">
                    <Input
                      value={getWalletAddress(currency)}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-deposit-address"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(getWalletAddress(currency));
                        setCopied(true);
                        toast({
                          title: "Address copied",
                          description: "Wallet address copied to clipboard",
                        });
                        setTimeout(() => setCopied(false), 2000);
                      }}
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

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                  <h4 className="font-semibold text-sm">Deposit Instructions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Minimum deposit: 0.001 {currency}</li>
                    <li>Send funds to the address above from your external wallet</li>
                    <li>Deposits require 3 network confirmations for {currency}</li>
                    <li>Average processing time: 10-30 minutes</li>
                    <li>Funds are credited automatically after confirmation</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Expected Deposit Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-deposit-amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the amount you plan to send for tracking purposes. Actual amount received will be credited.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    depositMutation.mutate({
                      currency,
                      amount: parseFloat(amount),
                      address: getWalletAddress(currency),
                    });
                  }}
                  disabled={!amount || depositMutation.isPending}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? "Recording..." : "Track Deposit"}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading wallet information...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
