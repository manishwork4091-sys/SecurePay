"use client";

import { useAuth } from "@/context/auth-context";
import { Transaction, RiskLevel } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";


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
        <div className="font-medium">{format(tx.createdAt, 'PP')}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(tx.createdAt, 'p')}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">${tx.amount.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">{tx.location}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{tx.device}</TableCell>
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<RiskLevel | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const mockTransactions: Transaction[] = [
        { id: 'tx_1', userId: 'mock-user-id', amount: 150.55, location: 'New York, USA', device: 'Desktop', createdAt: new Date(Date.now() - 80000000), riskScore: 10, riskLevel: 'Low' },
        { id: 'tx_2', userId: 'mock-user-id', amount: 800, location: 'London, UK', device: 'Mobile', createdAt: new Date(Date.now() - 186400000), riskScore: 50, riskLevel: 'Medium' },
        { id: 'tx_3', userId: 'mock-user-id', amount: 1200, location: 'Pyongyang, North Korea', device: 'Desktop', createdAt: new Date(Date.now() - 272800000), riskScore: 90, riskLevel: 'High', flaggingReasons: ['High risk location'] },
        { id: 'tx_4', userId: 'mock-user-id', amount: 25.00, location: 'Sydney, Australia', device: 'Mobile', createdAt: new Date(Date.now() - 372800000), riskScore: 5, riskLevel: 'Low' },
    ];
    
    setTimeout(() => {
        if (filter === 'All') {
            setTransactions(mockTransactions);
        } else {
            setTransactions(mockTransactions.filter(tx => tx.riskLevel === filter));
        }
        setLoading(false);
    }, 500);

  }, [user, filter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transaction History</CardTitle>
        <CardDescription>A complete log of all your simulated transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as RiskLevel | 'All')}>
          <TabsList className="grid w-full grid-cols-4 md:w-fit">
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Low">Low Risk</TabsTrigger>
            <TabsTrigger value="Medium">Medium Risk</TabsTrigger>
            <TabsTrigger value="High">High Risk</TabsTrigger>
          </TabsList>
          <TabsContent value={filter}>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="hidden md:table-cell">Device</TableHead>
                            <TableHead className="text-center">Risk</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                        <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length > 0 ? (
                                transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        No transactions found for this filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
