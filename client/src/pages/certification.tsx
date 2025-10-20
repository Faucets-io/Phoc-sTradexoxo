
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, CheckCircle2, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Certification() {
  const [, setLocation] = useLocation();

  const certifications = [
    {
      id: "1",
      title: "Basic Trading",
      description: "Learn the fundamentals of cryptocurrency trading",
      progress: 100,
      completed: true,
      lessons: 5,
    },
    {
      id: "2",
      title: "Technical Analysis",
      description: "Master chart patterns and indicators",
      progress: 60,
      completed: false,
      lessons: 8,
    },
    {
      id: "3",
      title: "Risk Management",
      description: "Protect your portfolio with proper strategies",
      progress: 0,
      completed: false,
      lessons: 6,
      locked: true,
    },
    {
      id: "4",
      title: "Advanced Trading",
      description: "Professional trading techniques and strategies",
      progress: 0,
      completed: false,
      lessons: 10,
      locked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Certification</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trading Certifications</CardTitle>
            <CardDescription>Complete courses to earn certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {certifications.map((cert) => (
              <Card key={cert.id} className={cert.locked ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        cert.completed ? "bg-success/10" : cert.locked ? "bg-muted" : "bg-primary/10"
                      }`}>
                        {cert.locked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : cert.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Award className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">{cert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{cert.lessons} lessons</p>
                      </div>
                    </div>
                    {cert.completed && (
                      <Badge variant="default" className="bg-success">Completed</Badge>
                    )}
                    {cert.locked && (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </div>
                  {!cert.locked && (
                    <>
                      <Progress value={cert.progress} className="mb-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{cert.progress}% complete</span>
                        <Button size="sm" variant={cert.completed ? "outline" : "default"}>
                          {cert.completed ? "Review" : "Continue"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
