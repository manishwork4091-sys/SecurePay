'use client';

import { useAuth } from '@/context/auth-context';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

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


export default function TransactionsPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();

  const transactionsQuery = useMemoFirebase(() => 
    user
      ? query(
          collection(firestore, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
      : null
  , [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  if (!user) {
    // Auth is still loading or user is not logged in.
    // The AuthGuard will handle redirection if necessary.
    // Showing a loader here is good practice.
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className='font-headline'>Transaction History</CardTitle>
          <CardDescription>A complete log of all your simulated transactions.</CardDescription>
        </CardHeader>
        <CardContent>
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
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
