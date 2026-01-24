"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ListChecks, Terminal, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useFirebase } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import type { RiskLevel } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useState } from "react";

const formSchema = z.object({
  amount: z.coerce.number().min(1, { message: "Amount must be greater than $0." }),
  location: z.string().min(2, { message: "Location is required." }),
  device: z.enum(["Mobile", "Desktop"]),
});

const locations = [
    "New York, USA", "London, UK", "Tokyo, Japan", "Sydney, Australia", 
    "Paris, France", "Berlin, Germany", "Toronto, Canada",
    "Pyongyang, North Korea" // High-risk example
];

export default function NewTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100.00,
      location: "New York, USA",
      device: "Desktop",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a transaction.",
        });
        return;
    }

    setIsSubmitting(true);

    // Mocked Fraud Detection Logic
    let riskScore = 0;
    const flaggingReasons: string[] = [];

    if (values.amount > 1000) {
      riskScore += 40;
      flaggingReasons.push(`Transaction amount ($${values.amount}) is unusually high.`);
    }

    const unusualLocations = ['North Korea', 'Syria', 'Iran', 'Pyongyang, North Korea'];
    if (unusualLocations.some(loc => values.location.toLowerCase().includes(loc.toLowerCase()))) {
      riskScore += 50;
      flaggingReasons.push(`Transaction location (${values.location}) is considered high-risk.`);
    }

    if (Math.random() < 0.1) {
      riskScore += 20;
      flaggingReasons.push('Transaction frequency is unusually rapid (simulated).');
    }

    riskScore = Math.min(riskScore, 100);

    let riskLevel: RiskLevel;
    if (riskScore < 40) riskLevel = 'Low';
    else if (riskScore < 80) riskLevel = 'Medium';
    else riskLevel = 'High';

    const transactionsColRef = collection(firestore, `users/${user.uid}/transactions`);
    
    const newTransaction = {
        ...values,
        userId: user.uid,
        createdAt: new Date(),
        riskScore,
        riskLevel,
        flaggingReasons,
    };

    addDoc(transactionsColRef, newTransaction)
      .then((docRef) => {
        toast({
          title: "Transaction Submitted Successfully",
          description: `Risk Level: ${riskLevel}. Redirecting to review...`,
        });
        if (riskLevel === 'High') {
          router.push(`/dashboard/alerts/${docRef.id}`);
        } else {
          router.push("/dashboard/transactions");
        }
      })
      .catch(() => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: transactionsColRef.path,
            operation: 'create',
            requestResourceData: newTransaction,
          })
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Simulate a New Transaction</CardTitle>
        <CardDescription>
          This interface allows you to create a simulated digital payment. 
          The transaction will be analyzed in real-time by our fraud detection engine.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" placeholder="100.00" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The value of the transaction. Higher amounts may increase the risk score.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a transaction location" />
                      </Trigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Geographic location is a key factor for anomaly detection. Certain locations are flagged as high-risk.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="device"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device type" />
                      </Trigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of device used can influence the transaction's risk profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-8" />
            
            <Alert>
              <ListChecks className="h-4 w-4" />
              <AlertDescription>
                <strong>Risk Factors Analyzed:</strong> Our engine evaluates transaction amount, location, device type, and simulated historical patterns to generate a risk score.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Submit Transaction"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4"/> Cancel & Return</Link>
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
                <p>After submission, you will be redirected to the transaction history or to a specific fraud alert if the risk is high.</p>
                <p>A unique Transaction ID and Timestamp will be automatically generated.</p>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            No real payments are processed. All data is simulated for academic analysis only.
          </p>
      </CardFooter>
    </Card>
  );
}
