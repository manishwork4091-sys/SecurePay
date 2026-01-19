"use client";

import { useAuth } from "@/context/auth-context";
import { Transaction, UserProfile } from "@/lib/types";
import { collection, query, where, orderBy, limit, onSnapshot, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Activity, Users, DollarSign, ShieldAlert, ArrowUpRight } from "lucide-react";
import { format } from 'date-fns';

function HighRiskTransactionRow({ tx }: { tx: Transaction }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tx.userId.substring(0, 8)}...</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(tx.createdAt.toDate(), 'PP')}
        </div>
      </TableCell>
      <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
      <TableCell className="hidden md:table-cell text-right">{tx.riskScore}</TableCell>
      <TableCell className="text-right">
        <Button asChild variant="secondary" size="sm">
            <Link href={`/dashboard/alerts/${tx.id}`}>Review</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTx: 0, totalUsers: 0, fraudRate: 0 });
  const [highRiskTransactions, setHighRiskTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
        const txColl = collection(db, "transactions");
        const usersColl = collection(db, "users");
        const highRiskTxQuery = query(txColl, where("riskLevel", "==", "High"));

        const txCountSnapshot = await getCountFromServer(txColl);
        const usersCountSnapshot = await getCountFromServer(usersColl);
        const highRiskCountSnapshot = await getCountFromServer(highRiskTxQuery);
        
        const totalTx = txCountSnapshot.data().count;
        const highRiskTx = highRiskCountSnapshot.data().count;

        setStats({
            totalTx: totalTx,
            totalUsers: usersCountSnapshot.data().count,
            fraudRate: totalTx > 0 ? (highRiskTx / totalTx) * 100 : 0,
        });
    };

    fetchStats();

    // Listen for new high-risk transactions
    const q = query(
      collection(db, "transactions"),
      where("riskLevel", "==", "High"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setHighRiskTransactions(txs);
      fetchStats(); // Re-fetch stats when a new high-risk transaction appears
    });


    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.totalTx}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Fraud Rate</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.fraudRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Percentage of high-risk transactions</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle className="font-headline">Recent High-Risk Transactions</CardTitle>
                <CardDescription>A real-time feed of transactions flagged as high-risk.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/transactions">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID & Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden md:table-cell text-right">Risk Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highRiskTransactions.length > 0 ? (
                  highRiskTransactions.map(tx => <HighRiskTransactionRow key={tx.id} tx={tx} />)
              ) : (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">No high-risk transactions recently.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
