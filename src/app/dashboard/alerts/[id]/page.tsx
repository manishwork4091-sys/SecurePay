'use client';

import { Transaction } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertCircle, FileText, CheckCircle, ShieldQuestion, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { explainFraudRisk } from '@/ai/flows/explainable-fraud-risk';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const transactionDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/transactions/${params.id}`) : null, [firestore, user, params.id]);
  const { data: transaction, isLoading } = useDoc<Transaction>(transactionDocRef);
  const [explanation, setExplanation] = useState('');
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);

  useEffect(() => {
    if (transaction && transaction.riskLevel === 'High') {
      setIsExplanationLoading(true);
      const getExplanation = async () => {
        const result = await explainFraudRisk({
          transactionDetails: `Amount: $${transaction.amount.toFixed(2)}, Location: ${transaction.location}, Device: ${transaction.device}`,
          riskScore: transaction.riskScore,
          flaggingReasons: transaction.flaggingReasons || [],
        });
        setExplanation(result.explanation);
        setIsExplanationLoading(false);
      };
      getExplanation();
    }
  }, [transaction]);

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (!transaction) {
    return notFound();
  }
  
  const createdAtDate = transaction.createdAt instanceof Date ? transaction.createdAt : (transaction.createdAt as any).toDate();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <ShieldQuestion className="h-10 w-10 text-destructive flex-shrink-0 mt-1" />
            <div>
              <CardTitle className="font-headline text-2xl">Fraud Alert Details</CardTitle>
              <CardDescription>This transaction was flagged for review due to a high risk score.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground w-20">Amount:</span>
              <span className="font-mono text-lg">${transaction.amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground w-20">Date:</span>
              <span>{format(createdAtDate, 'PPpp')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground w-20">Location:</span>
              <span>{transaction.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground w-20">Device:</span>
              <span>{transaction.device}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground w-20">Status:</span>
              <Badge variant="destructive">Pending Review</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground w-20">Risk Score:</span>
              <span className="font-mono text-lg">{transaction.riskScore} / 100</span>
            </div>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-muted-foreground w-20">Transaction ID: </span>
            <span className="font-mono text-xs">{transaction.id}</span>
          </div>
          
          <Separator />

          <div>
            <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Reasons for Flagging</h3>
            <ul className="list-disc list-inside space-y-2 pl-2 text-muted-foreground">
              {transaction.flaggingReasons?.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
          
          <Separator />

          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> AI-Powered Explanation</CardTitle>
              <CardDescription>
                To help you understand the decision, we've generated an explanation of the risk factors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isExplanationLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div>
            <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600"/> Important Notice</h3>
            <p className="text-muted-foreground">
              In a real-world scenario, a high-risk flag means your transaction is temporarily on hold. You might be contacted to verify your identity. Since this is a simulation, no funds are moved and no further action is needed. Flagging does not confirm fraud; it is a protective measure.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 border-t pt-6">
          <Button asChild variant="outline">
            <Link href="/dashboard/transactions"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Transaction History</Link>
          </Button>
          <p className="text-center text-sm leading-loose text-muted-foreground w-full">
            SecurePay Sentinel · Academic Project for MIS5203 · All data is simulated.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
