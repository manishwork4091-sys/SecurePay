import { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Activity, Users, ShieldAlert, ArrowUpRight } from "lucide-react";
import { format } from 'date-fns';

function HighRiskTransactionRow({ tx }: { tx: Transaction }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tx.userId.substring(0, 15)}...</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(tx.createdAt, 'PP')}
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
  const stats = { totalTx: 1258, totalUsers: 42, fraudRate: 0.8 };
  const mockTransactions: Transaction[] = [
      { id: 'tx_3', userId: 'user@example.com', amount: 1200, location: 'Pyongyang, North Korea', device: 'Desktop', createdAt: new Date(Date.now() - 272800000), riskScore: 90, riskLevel: 'High', flaggingReasons: ['High risk location'] },
      { id: 'tx_6', userId: 'user@example.com', amount: 950.00, location: 'Bogota, Colombia', device: 'Mobile', createdAt: new Date(Date.now() - 572800000), riskScore: 85, riskLevel: 'High' },
  ];
  const highRiskTransactions = mockTransactions.filter(tx => tx.riskLevel === 'High');

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.totalTx.toLocaleString()}</div>
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
                <CardDescription>A feed of transactions automatically flagged as high-risk by the system.</CardDescription>
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
                <TableHead>User & Date</TableHead>
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
