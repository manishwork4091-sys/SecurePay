"use client";

import { UserAuthGuard } from "@/components/auth-guard";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Home, Menu, FileText, PlusCircle, Shield, UserCog, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: FileText, label: "Transactions" },
  { href: "/dashboard/transactions/new", icon: PlusCircle, label: "New Transaction" },
  { href: "/dashboard/profile", icon: UserCog, label: "Profile & Security" },
];

function NavLink({ item, isMobile = false }: { item: typeof navItems[0]; isMobile?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
        isMobile ? "text-lg" : "text-sm"
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <UserAuthGuard>
      <div className="min-h-screen w-full">
         {sidebarOpen && (
            <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-[220px] lg:w-[280px] flex-col border-r bg-card">
                 <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="">SecurePay Sentinel</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:inline-flex"
                            onClick={() => setSidebarOpen(false)}
                            >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navItems.map((item) => (
                            <NavLink key={item.href} item={item} />
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <Card>
                            <CardHeader className="p-2 pt-0 md:p-4">
                                <CardTitle className="font-headline text-base">Academic Project</CardTitle>
                                <CardDescription>
                                    All transactions in this system are simulated for educational and research purposes.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </aside>
        )}
        <div
          className={cn(
            "flex flex-col h-screen",
            sidebarOpen ? "md:ml-[220px] lg:ml-[280px]" : "ml-0"
          )}
        >
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-[280px]">
                <SheetHeader>
                  <SheetTitle>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-lg font-semibold font-headline"
                    >
                      <Shield className="h-6 w-6 text-primary" />
                      <span className="">SecurePay Sentinel</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="grid gap-2 text-lg font-medium mt-4">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} isMobile />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                 {!sidebarOpen && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden md:inline-flex"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <UserNav />
          </header>
          <main className="flex-1 overflow-y-auto bg-secondary/60 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </UserAuthGuard>
  );
}
