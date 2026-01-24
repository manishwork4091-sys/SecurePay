'use client';

import { useAuth } from '@/context/auth-context';
import { Transaction } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
    ArrowUpRight, 
    ShieldAlert, 
    Activity,
    AlertTriangle,
    Percent,
    CalendarDays,
    Info,
    CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

function TransactionRow({ tx }: { tx: Transaction }) {
  const getBadgeVariant = (riskLevel: Transaction['riskLevel']) => {
    switch (riskLevel) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };
  
  const createdAtDate = tx.createdAt instanceof Date ? tx.createdAt : (tx.createdAt as any).toDate();

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tx.location}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(createdAtDate, 'PPpp')}
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
  const { firestore } = useFirebase();

  if (!user) {
    return null;
  }

  const transactionsQuery = useMemoFirebase(() => user ? query(collection(firestore, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null, [firestore, user]);
  const { data: allTransactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [highRiskAlerts, setHighRiskAlerts] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
      totalTx: 0,
      highRiskAlerts: 0,
      mediumRiskTx: 0,
      fraudRate: 0,
  });

  useEffect(() => {
    if (allTransactions) {
      const highRisk = allTransactions.filter(tx => tx.riskLevel === 'High');
      const mediumRisk = allTransactions.filter(tx => tx.riskLevel === 'Medium');
      
      setRecentTransactions(allTransactions.slice(0, 5));
      setHighRiskAlerts(highRisk.slice(0, 3));
      
      setStats({
          totalTx: allTransactions.length,
          highRiskAlerts: highRisk.length,
          mediumRiskTx: mediumRisk.length,
          fraudRate: allTransactions.length > 0 ? (highRisk.length / allTransactions.length) * 100 : 0,
      });
    }
  }, [allTransactions]);
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your digital payment activity and fraud risk status.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-md border">
            <CalendarDays className="h-4 w-4" />
            <span>Showing activity for: <strong>All Time</strong></span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.totalTx}</div>
            <p className="text-xs text-muted-foreground">in total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Risk Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.highRiskAlerts}</div>
            <p className="text-xs text-muted-foreground">Potential fraud detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium-Risk Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.mediumRiskTx}</div>
            <p className="text-xs text-muted-foreground">Review advised</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.fraudRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Based on high-risk alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <CardDescription>Your last 5 transactions.</CardDescription>
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
                {isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : recentTransactions.length > 0 ? (
                    recentTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                ) : (
                    <TableRow><TableCell colSpan={3} className="text-center h-24">No transactions yet.</TableCell></TableRow>
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
            {isLoading ? (
                <div className="text-center text-sm text-muted-foreground py-8">Loading alerts...</div>
            ) : highRiskAlerts.length > 0 ? highRiskAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-4 p-2 rounded-lg bg-destructive/10">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            ${alert.amount.toFixed(2)} transaction from {alert.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {format((alert.createdAt as any).toDate(), 'PP')} - Risk Score: {alert.riskScore}
                        </p>
                    </div>
                    <Button asChild size="sm" className="ml-auto">
                        <Link href={`/dashboard/alerts/${alert.id}`}>Review</Link>
                    </Button>
                </div>
            )) : (
                <div className="text-center text-sm text-muted-foreground py-8">No high-risk alerts found.</div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 mt-auto">
                <Info className="h-4 w-4" />
                <span>Risk scores are calculated based on amount, location, and frequency.</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <footer className="border-t pt-6 mt-6 text-center text-sm text-muted-foreground">
        <p>© SecurePay Sentinel – Academic Project for MIS5203. All data is simulated.</p>
        <p className="mt-2">
            <Link href="/about" className="hover:underline text-primary">How risk detection works</Link>
            <span className="mx-2">|</span>
            <Link href="/about" className="hover:underline text-primary">About this project</Link>
        </p>
      </footer>
    </div>
  );
}
