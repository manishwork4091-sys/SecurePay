"use client";

import { useAuth } from "@/context/auth-context";
import { Transaction } from "@/lib/types";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, CheckCircle, ShieldAlert, FileText, PlusCircle } from "lucide-react";
import { format } from 'date-fns';

function TransactionRow({ tx }: { tx: Transaction }) {
  const getBadgeVariant = (riskLevel: Transaction['riskLevel']) => {
    switch (riskLevel) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tx.location}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(tx.createdAt.toDate(), 'PPpp')}
        </div>
      </TableCell>
      <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
      <TableCell className="hidden md:table-cell text-right">
        <Badge variant={getBadgeVariant(tx.riskLevel)}>{tx.riskLevel}</Badge>
      </TableCell>
    </TableRow>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [highRiskAlerts, setHighRiskAlerts] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch recent transactions
    const txQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setRecentTransactions(txs);
    });

    // Fetch high-risk alerts
    const alertQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("riskLevel", "==", "High"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsubscribeAlerts = onSnapshot(alertQuery, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setHighRiskAlerts(alerts);
    });

    return () => {
      unsubscribeTx();
      unsubscribeAlerts();
    };
  }, [user]);
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Security</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              Your account is protected. MFA is currently {user?.mfaEnabled ? 'enabled' : 'disabled'}.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View All Transactions</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground mb-4">
              Review your complete transaction history and filter by risk level.
            </p>
            <Button size="sm" asChild>
                <Link href="/dashboard/transactions">Transaction History</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulate a Payment</CardTitle>
             <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground mb-4">
              Create a new simulated transaction to test our fraud detection system.
            </p>
            <Button size="sm" asChild>
                <Link href="/dashboard/transactions/new">New Transaction</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <CardDescription>Your last 5 simulated transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location & Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length > 0 ? (
                    recentTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                ) : (
                    <TableRow><TableCell colSpan={3} className="text-center">No transactions yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-destructive"/> High-Risk Alerts</CardTitle>
                <CardDescription>Transactions that were flagged as potentially fraudulent.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/transactions">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {highRiskAlerts.length > 0 ? highRiskAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-4 p-2 rounded-lg bg-destructive/10">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            ${alert.amount.toFixed(2)} transaction from {alert.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {format(alert.createdAt.toDate(), 'PP')} - Risk Score: {alert.riskScore}
                        </p>
                    </div>
                    <Button asChild size="sm" className="ml-auto">
                        <Link href={`/dashboard/alerts/${alert.id}`}>Review</Link>
                    </Button>
                </div>
            )) : (
                <div className="text-center text-sm text-muted-foreground py-8">No high-risk alerts found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
