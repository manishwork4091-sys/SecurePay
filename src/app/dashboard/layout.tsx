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
import { Home, Menu, FileText, PlusCircle, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: FileText, label: "Transactions" },
  { href: "/dashboard/transactions/new", icon: PlusCircle, label: "New Transaction" },
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
  return (
    <UserAuthGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                <Shield className="h-6 w-6 text-primary" />
                <span className="">SecurePay Sentinel</span>
              </Link>
            </div>
            <div className="flex-1">
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
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
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
              <SheetContent side="left" className="flex flex-col">
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
              {/* Optional: Add search bar here */}
            </div>
            <UserNav />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/60">
            {children}
          </main>
        </div>
      </div>
    </UserAuthGuard>
  );
}
