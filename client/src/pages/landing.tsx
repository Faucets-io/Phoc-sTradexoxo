import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Clock, Users, BarChart3, Wallet, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const stats = [
    { label: "Trading Volume", value: "$2.5B+", suffix: "24h" },
    { label: "Active Users", value: "150K+", suffix: "worldwide" },
    { label: "Cryptocurrencies", value: "200+", suffix: "supported" },
    { label: "Countries", value: "100+", suffix: "served" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Trades",
      description: "Execute trades in milliseconds with our high-performance matching engine. Never miss an opportunity.",
    },
    {
      icon: BarChart3,
      title: "Advanced Charts",
      description: "Professional-grade charting tools with real-time data and technical indicators for informed decisions.",
    },
    {
      icon: Wallet,
      title: "Secure Wallets",
      description: "Multi-layer security with cold storage, 2FA, and insurance protection for your digital assets.",
    },
    {
      icon: TrendingUp,
      title: "Low Fees",
      description: "Competitive trading fees starting at 0.1% with volume discounts for high-frequency traders.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support from our expert team to assist you whenever you need help.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Trade from anywhere in the world with our mobile app and web platform available in 15+ languages.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold">CryptoTrade</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" data-testid="link-login">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" data-testid="link-signup">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Sign Up</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <Badge className="w-fit text-xs sm:text-sm" variant="secondary">
                Trusted by 150K+ Traders Worldwide
              </Badge>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Trade Crypto with{" "}
                <span className="text-primary">Confidence</span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
                Access the world's leading cryptocurrency exchange. Trade Bitcoin, Ethereum,
                and 200+ digital assets with professional tools and bank-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg" data-testid="button-hero-signup">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg" data-testid="button-hero-login">
                    View Markets
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-destructive/20 backdrop-blur-sm border border-border p-8">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart3 className="h-24 w-24 mx-auto text-primary" />
                    <p className="text-2xl font-bold font-mono">BTC/USDT</p>
                    <p className="text-4xl font-bold font-mono text-success">$42,156.84</p>
                    <p className="text-lg text-success">+5.24% 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 lg:px-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <p className="text-3xl lg:text-4xl font-bold font-mono text-primary" data-testid={`stat-value-${i}`}>
                  {stat.value}
                </p>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.suffix}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold">
              Why Choose CryptoTrade
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to trade cryptocurrencies like a professional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="hover-elevate transition-all duration-200" data-testid={`feature-card-${i}`}>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-4xl font-bold">
                Security & Trust
              </h2>
              <p className="text-lg text-muted-foreground">
                Your security is our top priority. We employ industry-leading security
                measures to protect your assets and personal information.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: "Bank-Grade Security", desc: "256-bit encryption and SSL certification" },
                  { icon: Lock, title: "Cold Storage", desc: "98% of funds stored offline in secure vaults" },
                  { icon: Users, title: "Regulatory Compliance", desc: "Licensed and compliant in 100+ jurisdictions" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["SOC 2 Type II", "ISO 27001", "PCI DSS", "GDPR Compliant"].map((cert, i) => (
                <Card key={i} className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold">{cert}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-display text-4xl lg:text-5xl font-bold">
            Start Trading Today
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of traders already using CryptoTrade to grow their portfolio
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg" data-testid="button-cta-signup">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">CryptoTrade</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 CryptoTrade. All rights reserved. Trading cryptocurrencies carries risk.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
