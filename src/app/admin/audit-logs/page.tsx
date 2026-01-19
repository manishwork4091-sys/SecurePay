"use client";

import { useAuth } from "@/context/auth-context";
import { AuditLog } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";

function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{format(log.timestamp, 'PP')}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(log.timestamp, 'p')}
        </div>
      </TableCell>
      <TableCell>{log.event}</TableCell>
      <TableCell>
        <div className="font-mono text-xs">{log.userId}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell font-code text-xs">
        <pre>{JSON.stringify(log.details, null, 2)}</pre>
      </TableCell>
    </TableRow>
  );
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const mockLogs: AuditLog[] = [
        { id: 'log_1', event: 'User Registered', userId: 'user-abc-123', timestamp: new Date(Date.now() - 500000), details: { status: 'Success', ip: '192.168.1.1' }},
        { id: 'log_2', event: 'Login', userId: 'user-abc-123', timestamp: new Date(Date.now() - 400000), details: { status: 'Success', ip: '192.168.1.1' }},
        { id: 'log_3', event: 'Transaction Flagged', userId: 'user-xyz-456', timestamp: new Date(Date.now() - 300000), details: { transactionId: 'tx_3', riskScore: 90 }},
        { id: 'log_4', event: 'Failed Login', userId: 'bad@actor.com', timestamp: new Date(Date.now() - 200000), details: { error: 'Invalid email or password.' }},
        { id: 'log_5', event: 'Admin Action', userId: 'admin@sentinel.com', timestamp: new Date(Date.now() - 100000), details: { action: 'Updated user role' }},
    ];
    
    setTimeout(() => {
        setLogs(mockLogs);
        setLoading(false);
    }, 500);

  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Audit Logs</CardTitle>
        <CardDescription>A chronological log of security-relevant events in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>User/Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    <p className="mt-2 text-muted-foreground">Loading audit logs...</p>
                                </TableCell>
                            </TableRow>
                        ) : logs.length > 0 ? (
                            logs.map(log => <AuditLogRow key={log.id} log={log} />)
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
