import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2 } from "lucide-react";
import type { Wallet } from "@shared/schema";

export default function Deposit() {
  const { toast } = useToast();
  const [currency, setCurrency] = useState("BTC");
  const [copied, setCopied] = useState(false);

  const { data: wallets, isLoading: walletsLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const selectedWallet = wallets?.find(w => w.currency === currency);

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

            {!walletsLoading && selectedWallet ? (
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

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                  <h4 className="font-semibold text-sm">Deposit Instructions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>This is your unique {currency} deposit address</li>
                    <li>Send funds to this address from your external wallet</li>
                    <li>Deposits require network confirmations</li>
                    <li>Funds will be credited automatically after confirmation</li>
                    <li>Never share your private keys with anyone</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-muted border space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Important Security Notice
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Only send {currency} to this address. Each cryptocurrency has its own unique address. 
                    Sending the wrong cryptocurrency will result in permanent loss of funds.
                  </p>
                </div>
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
