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
import { Loader2, ArrowLeft, Circle } from "lucide-react";


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
        'All': "Showing all simulated transactions.",
        'Low': "Showing transactions flagged as low risk.",
        'Medium': "Showing transactions flagged as medium risk.",
        'High': "Showing transactions flagged as high risk. Review is recommended.",
    };
    return <div className="ml-auto text-xs italic">{messages[filter]}</div>
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<RiskLevel | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const mockTransactions: Transaction[] = [
        { id: 'txn_1a2b3c4d', userId: 'mock-user-id', amount: 150.55, location: 'New York, USA', device: 'Desktop', createdAt: new Date(Date.now() - 80000000), riskScore: 10, riskLevel: 'Low' },
        { id: 'txn_5e6f7g8h', userId: 'mock-user-id', amount: 800.00, location: 'London, UK', device: 'Mobile', createdAt: new Date(Date.now() - 186400000), riskScore: 55, riskLevel: 'Medium' },
        { id: 'txn_9i0j1k2l', userId: 'mock-user-id', amount: 1200.00, location: 'Pyongyang, North Korea', device: 'Desktop', createdAt: new Date(Date.now() - 272800000), riskScore: 90, riskLevel: 'High', flaggingReasons: ['High risk location'] },
        { id: 'txn_3m4n5o6p', userId: 'mock-user-id', amount: 25.00, location: 'Sydney, Australia', device: 'Mobile', createdAt: new Date(Date.now() - 372800000), riskScore: 5, riskLevel: 'Low' },
    ];
    
    setTimeout(() => {
        setAllTransactions(mockTransactions);
        if (filter === 'All') {
            setFilteredTransactions(mockTransactions);
        } else {
            setFilteredTransactions(mockTransactions.filter(tx => tx.riskLevel === filter));
        }
        setLoading(false);
    }, 500);

  }, [user, filter]);

  const riskCounts = {
    Low: allTransactions.filter(tx => tx.riskLevel === 'Low').length,
    Medium: allTransactions.filter(tx => tx.riskLevel === 'Medium').length,
    High: allTransactions.filter(tx => tx.riskLevel === 'High').length,
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
                    <div className="text-sm text-muted-foreground">Time range: <strong>Last 30 days</strong></div>
                </div>
             </Tabs>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-md flex items-center gap-x-4 gap-y-2 flex-wrap">
                <span>Showing <strong>{filteredTransactions.length}</strong> of <strong>{allTransactions.length}</strong> transactions.</span>
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
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
                 <div>Showing 1–{filteredTransactions.length} of {filteredTransactions.length} transactions</div>
                 <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
            </div>

        </CardContent>
      </Card>

       <div className="grid gap-6 md:grid-cols-2 pt-4">
          <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Risk Level Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                 <div className="flex gap-3">
                    <div className="font-semibold w-24">Low Risk (0-39):</div>
                    <div className="text-muted-foreground">Normal, everyday behavior with no suspicious indicators.</div>
                </div>
                 <div className="flex gap-3">
                    <div className="font-semibold w-24">Medium Risk (40-79):</div>
                    <div className="text-muted-foreground">Unusual but not critical. One or two risk factors detected. Review is advised.</div>
                </div>
                 <div className="flex gap-3">
                    <div className="font-semibold w-24">High Risk (80-100):</div>
                    <div className="text-muted-foreground">Potential fraud detected. Multiple critical risk factors present.</div>
                </div>
            </CardContent>
          </Card>
           <div className="text-sm text-muted-foreground p-4 bg-card border rounded-lg flex items-center justify-center text-center">
                <p>All transactions shown are simulated for academic and research purposes as part of the MIS5203 Capstone Project.</p>
          </div>
      </div>
    </div>
  );
}
