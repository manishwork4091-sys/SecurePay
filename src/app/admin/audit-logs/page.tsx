"use client";

import { useAuth } from "@/context/auth-context";
import { AuditLog } from "@/lib/types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";

function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{format(log.timestamp.toDate(), 'PP')}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {format(log.timestamp.toDate(), 'p')}
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
    const q = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
      setLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
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
