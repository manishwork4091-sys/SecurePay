'use client';

import { Transaction, RiskLevel } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ArrowLeft, Circle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

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
        <div className="font-medium">{format(createdAtDate, 'PP')}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(createdAtDate, 'p')}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">${tx.amount.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">{tx.location}</div>
        <div className="font-mono text-xs text-muted-foreground/70 mt-1">ID: {tx.id}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{tx.device}</TableCell>
       <TableCell className="hidden md:table-cell text-center font-mono">{tx.riskScore}</TableCell>
      <TableCell className="text-center">
        <Badge variant={getBadgeVariant(tx.riskLevel)}>{tx.riskLevel}</Badge>
      </TableCell>
      <TableCell className="text-right">
        {tx.riskLevel === 'High' && (
            <Button asChild variant="secondary" size="sm">
                <Link href={`/dashboard/alerts/${tx.id}`}>Review</Link>
            </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

const FilterFeedback = ({ filter }: { filter: RiskLevel | 'All' }) => {
    const messages = {
        'All': "Showing all transactions.",
        'Low': "Showing transactions flagged as low risk.",
        'Medium': "Showing transactions flagged as medium risk.",
        'High': "Showing transactions flagged as high risk. Review is recommended.",
    };
    return <div className="ml-auto text-xs italic">{messages[filter]}</div>
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [filter, setFilter] = useState<RiskLevel | 'All'>('All');

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'transactions'),
        where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: allTransactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const sortedTransactions = allTransactions?.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any).toDate();
    const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate();
    return dateB.getTime() - dateA.getTime();
  }) || [];
  
  const transactions = filter === 'All' ? sortedTransactions : sortedTransactions.filter(tx => tx.riskLevel === filter);
  
  const riskCounts = {
    Low: sortedTransactions.filter(tx => tx.riskLevel === 'Low').length,
    Medium: sortedTransactions.filter(tx => tx.riskLevel === 'Medium').length,
    High: sortedTransactions.filter(tx => tx.riskLevel === 'High').length,
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">A complete log of all your simulated transactions.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
             <Tabs value={filter} onValueChange={(value) => setFilter(value as RiskLevel | 'All')} className="w-full">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
                    <TabsList className="grid w-full grid-cols-4 md:w-fit">
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Low">Low Risk</TabsTrigger>
                        <TabsTrigger value="Medium">Medium Risk</TabsTrigger>
                        <TabsTrigger value="High">High Risk</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">Time range: <strong>All Time</strong></div>
                </div>
             </Tabs>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-md flex items-center gap-x-4 gap-y-2 flex-wrap">
                <span>Showing <strong>{transactions?.length || 0}</strong> of <strong>{sortedTransactions?.length || 0}</strong> transactions.</span>
                <span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-green-500 text-green-500"/> Low: {riskCounts.Low}</span>
                <span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-yellow-500 text-yellow-500"/> Medium: {riskCounts.Medium}</span>
                <span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-red-500 text-red-500"/> High: {riskCounts.High}</span>
                <FilterFeedback filter={filter} />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="hidden md:table-cell">Device</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Risk Score</TableHead>
                        <TableHead className="text-center">Risk Level</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                                </TableCell>
                            </TableRow>
                        ) : transactions && transactions.length > 0 ? (
                            transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    No transactions found for this filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                 <div>Showing 1–{transactions?.length || 0} of {transactions?.length || 0} transactions</div>
                 <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
