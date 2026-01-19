"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Calendar, KeyRound, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format, subDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return null; // Or a loading state
    }

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    }
    
    const userRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold">Profile & Security</h1>
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-6">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.email} />
                            <AvatarFallback className="text-2xl">{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="font-headline text-2xl">Student User</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </CardDescription>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="h-4 w-4" />
                                Role: <Badge variant="outline">{userRole}</Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    <div>
                        <h3 className="text-lg font-medium font-headline mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">Account Created</p>
                                    <p className="font-medium">{format(user.createdAt, 'PP')}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">Last Login</p>
                                    <p className="font-medium">{format(new Date(), 'PPpp')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <h3 className="text-lg font-medium font-headline mb-4">Security Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                <KeyRound className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">Password</p>
                                    <p className="font-medium">••••••••••••</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-muted-foreground">Multi-Factor Authentication (MFA)</p>
                                    <p className="font-medium">
                                        <Badge variant={user.mfaEnabled ? 'default' : 'destructive'} className={user.mfaEnabled ? 'bg-green-600' : ''}>
                                            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <h3 className="text-lg font-medium font-headline mb-4">Recent Security Activity</h3>
                        <div className="space-y-3 text-sm">
                           <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p><span className="text-muted-foreground">Last password update:</span> {format(subDays(new Date(), 30), 'PP')}</p>
                           </div>
                           <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p><span className="text-muted-foreground">Last MFA verification:</span> {format(subDays(new Date(), 2), 'PP')}</p>
                           </div>
                        </div>
                    </div>
                     <Separator />
                    <Alert variant="default" className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            All security settings and activity logs are simulated for academic purposes only.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                     <p className="text-xs text-muted-foreground w-full text-center">
                        SecurePay Sentinel · Academic Project · MIS5203
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
