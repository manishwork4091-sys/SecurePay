import { Transaction } from "@/lib/types";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, FileText, CheckCircle, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

// In a real app, this would fetch from a database.
// For this static demo, we define a set of mock high-risk transactions.
const mockHighRiskTransactions: { [id: string]: Transaction } = {
    'tx_3': {
        id: 'tx_3',
        userId: 'mock-user-id',
        amount: 1200,
        location: 'Pyongyang, North Korea',
        device: 'Desktop',
        createdAt: new Date(Date.now() - 272800000),
        riskScore: 90,
        riskLevel: 'High',
        flaggingReasons: ["Transaction amount ($1200.00) is unusually high.", "Transaction location (Pyongyang, North Korea) is considered high-risk."]
    },
    'tx_6': {
        id: 'tx_6',
        userId: 'mock-user-id',
        amount: 950.00,
        location: 'Bogota, Colombia',
        device: 'Mobile',
        createdAt: new Date(Date.now() - 572800000),
        riskScore: 85,
        riskLevel: 'High',
        flaggingReasons: ["Transaction amount ($950.00) is high for this user profile.", "Transaction originates from a location with a history of fraud."]
    }
};

// This function simulates fetching a transaction and its AI-generated explanation.
function getAlertDetails(id: string): { transaction: Transaction; explanation: string } | null {
    let transaction: Transaction | undefined = mockHighRiskTransactions[id];

    // Also handle transactions created dynamically from the form for demo purposes
    if (!transaction && id.startsWith('mock-tx')) {
         transaction = {
            id,
            userId: 'user@example.com',
            amount: 1500.00,
            location: 'Pyongyang, North Korea',
            device: 'Desktop',
            createdAt: new Date(),
            riskScore: 95,
            riskLevel: 'High',
            flaggingReasons: ["Transaction amount ($1500.00) is unusually high.", "Transaction location (Pyongyang, North Korea) is a sanctioned country."],
        };
    }
    
    if (!transaction || transaction.riskLevel !== 'High') {
        return null;
    }

    // Static AI-powered explanation, tailored to the transaction
    const explanation = `This transaction was flagged as high-risk primarily due to its origin and amount. The transaction of $${transaction.amount.toFixed(2)} from ${transaction.location} triggered two critical rules in our fraud detection engine.

First, the location is on our high-risk country list, which automatically elevates the risk score significantly. Second, the transaction amount exceeds the user's typical spending pattern by a large margin. The combination of these factors results in a high-risk score of ${transaction.riskScore}, indicating a strong likelihood of fraudulent activity. For user protection, transactions like this are automatically held for manual review.`;

    return { transaction, explanation };
}

export default function AlertPage({ params }: { params: { id: string } }) {
    const alertDetails = getAlertDetails(params.id);

    if (!alertDetails) {
        notFound();
    }

    const { transaction, explanation } = alertDetails;

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
                            <span>{format(transaction.createdAt, 'PPpp')}</span>
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
                                {explanation}
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
