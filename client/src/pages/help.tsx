
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, HelpCircle, Search, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Help() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "1",
      title: "Getting Started",
      description: "Learn the basics of trading",
      articles: 12,
    },
    {
      id: "2",
      title: "Account & Security",
      description: "Manage your account settings",
      articles: 8,
    },
    {
      id: "3",
      title: "Deposits & Withdrawals",
      description: "How to fund your account",
      articles: 15,
    },
    {
      id: "4",
      title: "Trading",
      description: "Execute trades and orders",
      articles: 20,
    },
    {
      id: "5",
      title: "Fees & Limits",
      description: "Understand our fee structure",
      articles: 6,
    },
  ];

  const popularArticles = [
    "How to deposit cryptocurrency?",
    "What are trading fees?",
    "How to enable 2FA?",
    "How to withdraw funds?",
    "What is market vs limit order?",
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Help Center</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{category.articles} articles</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Articles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {popularArticles.map((article, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <span>{article}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our support team for assistance
            </p>
            <Button>Contact Support</Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
