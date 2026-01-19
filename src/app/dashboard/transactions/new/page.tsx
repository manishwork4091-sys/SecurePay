"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/lib/actions";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100.00,
      location: "New York, USA",
      device: "Desktop",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a transaction.",
        });
        return;
    }

    const result = await createTransaction(values, user.uid);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: result.error,
      });
    } else {
      toast({
        title: "Transaction Successful",
        description: `Risk Level: ${result.riskLevel}. Redirecting...`,
      });
      if (result.riskLevel === 'High') {
        router.push(`/dashboard/alerts/${result.transactionId}`);
      } else {
        router.push("/dashboard/transactions");
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Simulate a New Transaction</CardTitle>
        <CardDescription>Enter the details below to simulate a digital payment. Our system will assess its fraud risk in real-time.</CardDescription>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Country / City)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a transaction location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Processing..." : "Submit Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
