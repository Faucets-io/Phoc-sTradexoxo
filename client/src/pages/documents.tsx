
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Eye } from "lucide-react";
import { useLocation } from "wouter";

export default function Documents() {
  const [, setLocation] = useLocation();

  const documents = [
    {
      id: "1",
      title: "Terms of Service",
      description: "Review our terms and conditions",
      date: "Updated Jan 2024",
      size: "2.5 MB",
    },
    {
      id: "2",
      title: "Privacy Policy",
      description: "How we protect your data",
      date: "Updated Jan 2024",
      size: "1.8 MB",
    },
    {
      id: "3",
      title: "Trading Guidelines",
      description: "Best practices for trading",
      date: "Updated Dec 2023",
      size: "3.2 MB",
    },
    {
      id: "4",
      title: "KYC Requirements",
      description: "Identity verification guide",
      date: "Updated Nov 2023",
      size: "1.2 MB",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Documents</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
            <CardDescription>Important documents and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
