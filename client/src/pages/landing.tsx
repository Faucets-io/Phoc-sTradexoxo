
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Clock, Users, BarChart3, Wallet, Globe, Check, Star, Award, Smartphone, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function Landing() {
  const { data: markets } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/markets"],
  });

  const [activeFeature, setActiveFeature] = useState(0);

  const stats = [
    { label: "Trading Volume", value: "$2.5B+", suffix: "24h", icon: TrendingUp },
    { label: "Active Users", value: "150K+", suffix: "worldwide", icon: Users },
    { label: "Cryptocurrencies", value: "200+", suffix: "supported", icon: BarChart3 },
    { label: "Countries", value: "100+", suffix: "served", icon: Globe },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Trades",
      description: "Execute trades in milliseconds with our high-performance matching engine. Never miss an opportunity.",
      highlight: "99.9% Uptime"
    },
    {
      icon: BarChart3,
      title: "Advanced Charts",
      description: "Professional-grade charting tools with real-time data and technical indicators for informed decisions.",
      highlight: "50+ Indicators"
    },
    {
      icon: Wallet,
      title: "Secure Wallets",
      description: "Multi-layer security with cold storage, 2FA, and insurance protection for your digital assets.",
      highlight: "Bank-Grade Security"
    },
    {
      icon: TrendingUp,
      title: "Low Fees",
      description: "Competitive trading fees starting at 0.1% with volume discounts for high-frequency traders.",
      highlight: "From 0.1%"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support from our expert team to assist you whenever you need help.",
      highlight: "Always Available"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Trade from anywhere in the world with our mobile app and web platform available in 15+ languages.",
      highlight: "15+ Languages"
    },
  ];

  const benefits = [
    "Industry-leading security measures",
    "Real-time market data and analytics",
    "Mobile app for iOS and Android",
    "Advanced trading tools and API",
    "Competitive fee structure",
    "24/7 customer support"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Day Trader",
      content: "Best crypto exchange I've used. Fast execution and excellent customer support.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Investor",
      content: "The advanced charting tools and low fees make this my go-to platform for crypto trading.",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Crypto Enthusiast",
      content: "User-friendly interface with professional features. Perfect for both beginners and experts.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">CryptoTrade</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" data-testid="link-login">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" data-testid="link-signup">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Sign Up</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <Badge className="w-fit text-xs sm:text-sm bg-primary/10 text-primary border-primary/20" variant="outline">
                <Star className="h-3 w-3 mr-1 fill-primary" />
                Trusted by 150K+ Traders Worldwide
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                Trade Crypto with{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Access the world's leading cryptocurrency exchange. Trade Bitcoin, Ethereum,
                and 200+ digital assets with professional tools and bank-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" data-testid="button-hero-signup">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/market" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg border-2" data-testid="button-hero-login">
                    View Markets
                    <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                {[
                  { icon: Shield, label: "Bank-Grade Security" },
                  { icon: Award, label: "Licensed & Regulated" },
                  { icon: Smartphone, label: "Mobile App Available" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Live Market Data */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm border-2 border-border/50 p-6 sm:p-8 shadow-2xl">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Live Markets</h3>
                      <Badge variant="secondary" className="animate-pulse">
                        <div className="h-2 w-2 rounded-full bg-success mr-1" />
                        Live
                      </Badge>
                    </div>
                    
                    {markets?.slice(0, 4).map((market, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors">
                        <div>
                          <p className="font-semibold">{market.symbol.split('/')[0]}</p>
                          <p className="text-xs text-muted-foreground">{market.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">
                            ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className={`text-xs font-medium ${market.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center space-y-3 p-6 rounded-2xl hover:bg-background/50 transition-colors">
                  <Icon className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-3xl lg:text-4xl font-bold font-mono bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid={`stat-value-${i}`}>
                    {stat.value}
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.suffix}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
            <Badge className="mb-2" variant="secondary">Features</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Professional trading tools designed for traders of all levels
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isActive = activeFeature === i;
              return (
                <Card 
                  key={i} 
                  className={`hover-elevate transition-all duration-300 ${isActive ? 'border-primary shadow-lg scale-105' : ''}`}
                  data-testid={`feature-card-${i}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary">Why Choose Us</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                Built for Traders, By Traders
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We understand what traders need because we are traders ourselves. 
                Our platform combines cutting-edge technology with user-friendly design.
              </p>
              
              <div className="grid gap-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
              
              <Link href="/signup">
                <Button size="lg" className="mt-4 bg-gradient-to-r from-primary to-primary/80">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Testimonials */}
            <div className="space-y-6">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <Badge variant="secondary">Security First</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Your Security is Our Priority
            </h2>
            <p className="text-lg text-muted-foreground">
              Industry-leading security measures to protect your assets
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["SOC 2 Type II", "ISO 27001", "PCI DSS", "GDPR Compliant"].map((cert, i) => (
              <Card key={i} className="p-6 text-center hover-elevate">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="font-semibold text-lg">{cert}</p>
                <p className="text-sm text-muted-foreground mt-2">Certified & Verified</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
            Ready to Start Trading?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of traders already using CryptoTrade to grow their portfolio. 
            Sign up now and get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg bg-gradient-to-r from-primary to-primary/80" data-testid="button-cta-signup">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/market">
              <Button size="lg" variant="outline" className="text-lg border-2">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">CryptoTrade</span>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              The world's leading cryptocurrency exchange platform.
            </p>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center">
                © 2024 CryptoTrade. All rights reserved. Trading cryptocurrencies carries risk.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
                <a href="#" className="hover:text-foreground transition-colors">Legal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
