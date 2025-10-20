
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, TrendingUp, AlertCircle, Gift } from "lucide-react";
import { useLocation } from "wouter";

interface Notification {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const [, setLocation] = useLocation();

  // Mock notifications
  const notifications: Notification[] = [
    {
      id: "1",
      type: "success",
      title: "Deposit Confirmed",
      message: "Your deposit of 0.5 BTC has been confirmed",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "Price Alert",
      message: "BTC has reached your target price of $45,000",
      time: "5 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Security Alert",
      message: "New login detected from a different device",
      time: "1 day ago",
      read: true,
    },
    {
      id: "4",
      type: "success",
      title: "Referral Bonus",
      message: "You earned $10 from your referral program",
      time: "2 days ago",
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent</h2>
          <Button variant="ghost" size="sm">Mark all as read</Button>
        </div>

        {notifications.map((notification) => (
          <Card key={notification.id} className={!notification.read ? "border-primary/50" : ""}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <Badge variant="default" className="bg-primary">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
