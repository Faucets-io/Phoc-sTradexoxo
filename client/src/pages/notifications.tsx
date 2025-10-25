
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, TrendingUp, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { useLocation } from "wouter";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold" data-testid="text-title">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-auto" data-testid="badge-unread-count">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading notifications...
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={!notification.read ? "border-primary/50" : ""} data-testid={`notification-${notification.id}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold" data-testid={`text-notification-title-${notification.id}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="default" className="bg-primary" data-testid={`badge-new-${notification.id}`}>
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2" data-testid={`text-notification-message-${notification.id}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-notification-time-${notification.id}`}>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
