import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction } from "@/lib/types";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, FileText, CheckCircle, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { explainFraudRisk } from "@/ai/flows/explainable-fraud-risk";
import { Separator } from "@/components/ui/separator";

async function getTransaction(id: string): Promise<Transaction | null> {
    const docRef = doc(db, "transactions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Transaction;
    }
    return null;
}

export default async function AlertPage({ params }: { params: { id: string } }) {
    const transaction = await getTransaction(params.id);

    if (!transaction || transaction.riskLevel !== 'High') {
        notFound();
    }

    const aiExplanation = await explainFraudRisk({
        transactionDetails: `A transaction of $${transaction.amount.toFixed(2)} from ${transaction.location} on a ${transaction.device} device.`,
        riskScore: transaction.riskScore,
        flaggingReasons: transaction.flaggingReasons || ["General security concern"],
    });

    const getBadgeVariant = (riskLevel: Transaction['riskLevel']) => {
        switch (riskLevel) {
          case 'High': return 'destructive';
          case 'Medium': return 'secondary';
          default: return 'outline';
        }
      };

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
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-muted-foreground">Amount:</span>
                            <span className="font-mono text-lg">${transaction.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-muted-foreground">Date:</span>
                            <span>{format(transaction.createdAt.toDate(), 'PPpp')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-muted-foreground">Location:</span>
                            <span>{transaction.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-muted-foreground">Device:</span>
                            <span>{transaction.device}</span>
                        </div>
                        <div className="flex items-center gap-3 md:col-span-2">
                            <span className="font-semibold text-muted-foreground">Risk Score:</span>
                            <Badge variant={getBadgeVariant(transaction.riskLevel)} className="text-lg px-3 py-1">
                                {transaction.riskScore} / 100 ({transaction.riskLevel})
                            </Badge>
                        </div>
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
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {aiExplanation.explanation}
                            </p>
                        </CardContent>
                    </Card>

                    <Separator />

                     <div>
                        <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600"/> What This Means For You</h3>
                        <p className="text-muted-foreground">
                            In a real-world scenario, this would mean your transaction is temporarily on hold pending review. You might be contacted by your bank to verify your identity. Since this is a simulation, no further action is needed. This event has been logged for academic review.
                        </p>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
