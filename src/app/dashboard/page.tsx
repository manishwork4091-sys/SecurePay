"use client";

import { useAuth } from "@/context/auth-context";
import { Transaction } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
    ArrowUpRight, 
    ShieldAlert, 
    Activity,
    AlertTriangle,
    Percent,
    CalendarDays,
    Info,
    CheckCircle,
    Circle,
} from "lucide-react";
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
          {format(tx.createdAt, 'PPpp')}
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
  const [stats, setStats] = useState({
      totalTx: 124,
      highRiskAlerts: 6,
      mediumRiskTx: 14,
      fraudRate: 4.8,
  });

  useEffect(() => {
    if (!user) return;

    const mockTransactions: Transaction[] = [
        { id: 'tx_1', userId: 'mock-user-id', amount: 150.55, location: 'New York, USA', device: 'Desktop', createdAt: new Date(Date.now() - 80000000), riskScore: 10, riskLevel: 'Low' },
        { id: 'tx_2', userId: 'mock-user-id', amount: 800, location: 'London, UK', device: 'Mobile', createdAt: new Date(Date.now() - 186400000), riskScore: 50, riskLevel: 'Medium' },
        { id: 'tx_3', userId: 'mock-user-id', amount: 1200, location: 'Pyongyang, North Korea', device: 'Desktop', createdAt: new Date(Date.now() - 272800000), riskScore: 90, riskLevel: 'High', flaggingReasons: ['High risk location'] },
        { id: 'tx_4', userId: 'mock-user-id', amount: 25.00, location: 'Sydney, Australia', device: 'Mobile', createdAt: new Date(Date.now() - 372800000), riskScore: 5, riskLevel: 'Low' },
        { id: 'tx_5', userId: 'mock-user-id', amount: 450.00, location: 'Paris, France', device: 'Desktop', createdAt: new Date(Date.now() - 472800000), riskScore: 20, riskLevel: 'Low' },
        { id: 'tx_6', userId: 'mock-user-id', amount: 950.00, location: 'Bogota, Colombia', device: 'Mobile', createdAt: new Date(Date.now() - 572800000), riskScore: 85, riskLevel: 'High' },
    ];
    
    setRecentTransactions(mockTransactions.slice(0, 5));
    setHighRiskAlerts(mockTransactions.filter(tx => tx.riskLevel === 'High').slice(0, 3));

  }, [user]);
  
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Dashboard Title & Context Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your digital payment activity and fraud risk status.</p>
        </div>
        {/* 3. Time Range Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-md border">
            <CalendarDays className="h-4 w-4" />
            <span>Showing activity for: <strong>Last 30 days</strong></span>
        </div>
      </div>

      {/* 2. Quick Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stats.totalTx}</div>
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
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
            <div className="text-2xl font-bold font-headline">{stats.fraudRate}%</div>
            <p className="text-xs text-muted-foreground">Based on high-risk alerts</p>
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
            {highRiskAlerts.length > 0 ? highRiskAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-4 p-2 rounded-lg bg-destructive/10">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            ${alert.amount.toFixed(2)} transaction from {alert.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {format(alert.createdAt, 'PP')} - Risk Score: {alert.riskScore}
                        </p>
                    </div>
                    <Button asChild size="sm" className="ml-auto">
                        <Link href={`/dashboard/alerts/${alert.id}`}>Review</Link>
                    </Button>
                </div>
            )) : (
                <div className="text-center text-sm text-muted-foreground py-8">No high-risk alerts found.</div>
            )}
            {/* 6. Explanation Hint for Risk Scores */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 mt-auto">
                <Info className="h-4 w-4" />
                <span>Risk scores are calculated based on amount, location, and frequency.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        {/* 5. Risk Trend / Activity Summary (Static) */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Fraud Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">High-risk alerts have <span className="text-destructive font-semibold">increased by 15%</span> this week. The majority of flagged transactions originate from new or high-risk locations, suggesting a potential targeted attack pattern.</p>
            </CardContent>
        </Card>

        {/* 4. Risk Level Legend */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Risk Level Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div>
                        <p className="font-semibold text-sm">Low Risk</p>
                        <p className="text-xs text-muted-foreground">Normal, everyday behavior.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div>
                        <p className="font-semibold text-sm">Medium Risk</p>
                        <p className="text-xs text-muted-foreground">Unusual but not critical. Review advised.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div>
                        <p className="font-semibold text-sm">High Risk</p>
                        <p className="text-xs text-muted-foreground">Potential fraud detected. Action required.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      
      {/* 8. System Status Indicator */}
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
            <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Fraud Detection Engine: Active
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Audit Logging: Enabled
            </Badge>
        </CardContent>
      </Card>
      
      {/* 9. Help & 10. Footer */}
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
