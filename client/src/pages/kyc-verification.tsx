import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, XCircle, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { KycVerification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const kycSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().min(5, "Document number must be at least 5 characters"),
});

type KycFormData = z.infer<typeof kycSchema>;

export default function KycVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: kycStatus, isLoading } = useQuery<KycVerification | null>({
    queryKey: ["/api/kyc"],
  });

  const form = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      country: "",
      address: "",
      city: "",
      postalCode: "",
      documentType: "",
      documentNumber: "",
    },
  });

  const submitKycMutation = useMutation({
    mutationFn: (data: KycFormData) => apiRequest("POST", "/api/kyc/submit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      toast({
        title: "Success",
        description: "Your KYC verification has been submitted for review",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit KYC verification",
      });
    },
  });

  const onSubmit = (data: KycFormData) => {
    submitKycMutation.mutate(data);
  };

  const getStatusBadge = () => {
    if (!kycStatus) return null;
    
    switch (kycStatus.status) {
      case "approved":
        return (
          <Badge className="bg-success" data-testid="badge-kyc-status">
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning" data-testid="badge-kyc-status">
            <Clock className="h-4 w-4 mr-1" />
            Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive" data-testid="badge-kyc-status">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold" data-testid="text-title">Identity Verification</h1>
          {kycStatus && <div className="ml-auto">{getStatusBadge()}</div>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading KYC status...
          </div>
        ) : kycStatus?.status === "approved" ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
              <h2 className="text-2xl font-bold mb-2">Identity Verified</h2>
              <p className="text-muted-foreground">
                Your identity has been successfully verified. You have full access to all platform features.
              </p>
            </CardContent>
          </Card>
        ) : kycStatus?.status === "pending" ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 mx-auto text-warning mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verification Under Review</h2>
              <p className="text-muted-foreground mb-4">
                Your documents are being reviewed. This typically takes 24-48 hours.
              </p>
              <div className="bg-muted rounded-lg p-4 text-left space-y-2">
                <p className="text-sm"><strong>Submitted:</strong> {new Date(kycStatus.createdAt).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Name:</strong> {kycStatus.firstName} {kycStatus.lastName}</p>
                <p className="text-sm"><strong>Document:</strong> {kycStatus.documentType.replace(/_/g, ' ').toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>
        ) : kycStatus?.status === "rejected" ? (
          <div className="space-y-4">
            <Card className="border-destructive">
              <CardContent className="p-8 text-center">
                <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Verification Rejected</h2>
                <p className="text-muted-foreground mb-4">
                  Your verification was rejected. Please review the reason below and resubmit.
                </p>
                {kycStatus.rejectionReason && (
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-left">
                    <p className="text-sm"><strong>Reason:</strong> {kycStatus.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resubmit Verification</CardTitle>
                <CardDescription>
                  Please provide updated information and documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Form fields will be the same as below */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitKycMutation.isPending}
                      data-testid="button-submit-kyc"
                    >
                      {submitKycMutation.isPending ? "Submitting..." : "Resubmit Verification"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold mb-2">Why verify your identity?</h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Comply with regulatory requirements</li>
                      <li>• Unlock higher trading limits</li>
                      <li>• Enable fiat deposits and withdrawals</li>
                      <li>• Enhance account security</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit Verification</CardTitle>
                <CardDescription>
                  All information is encrypted and stored securely in compliance with data protection regulations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date-of-birth" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} data-testid="input-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} data-testid="input-postal-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-document-type">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="id_card">National ID Card</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="documentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Number</FormLabel>
                          <FormControl>
                            <Input placeholder="A12345678" {...field} data-testid="input-document-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitKycMutation.isPending}
                      data-testid="button-submit-kyc"
                    >
                      {submitKycMutation.isPending ? "Submitting..." : "Submit Verification"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
