
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Gift, Copy, CheckCircle2, Users } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export default function Referral() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const referralCode = user?.id ? `REF${user.id.substring(0, 8).toUpperCase()}` : "LOADING...";
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Total Referrals", value: "0", icon: Users },
    { label: "Total Earned", value: "$0.00", icon: Gift },
    { label: "Pending Rewards", value: "$0.00", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Referral Program</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Earn $10 per referral</h2>
                <p className="text-muted-foreground">Share the love and get rewarded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(referralCode)}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(referralLink)}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Share your link</h4>
                <p className="text-sm text-muted-foreground">Send your referral link to friends</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold">They sign up</h4>
                <p className="text-sm text-muted-foreground">Your friend creates an account</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold">You both earn</h4>
                <p className="text-sm text-muted-foreground">Get $10 when they complete their first trade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
