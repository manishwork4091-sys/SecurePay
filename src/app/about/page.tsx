import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Shield, BarChart, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">SecurePay Sentinel</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">How Risk Detection Works</h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                    An overview of the static, rule-based fraud detection engine powering this academic simulation.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Core Principle: Risk Scoring</CardTitle>
                    <CardDescription>
                        Every simulated transaction is assigned a numerical risk score from 0 to 100. This score determines whether a transaction is flagged as Low, Medium, or High risk.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>The system is intentionally simple for this academic project. It does not use machine learning or dynamic profiling. Instead, it applies a clear, rule-based system to evaluate each transaction based on a few key data points.</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Key Risk Factors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <BarChart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Transaction Amount</h4>
                                <p className="text-sm text-muted-foreground">Very high amounts (e.g., &gt; $1000) significantly increase the risk score.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Geographic Location</h4>
                                <p className="text-sm text-muted-foreground">Transactions from sanctioned or high-risk countries (e.g., North Korea) are heavily penalized.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Transaction Frequency</h4>
                                <p className="text-sm text-muted-foreground">A random check simulates rapid transaction velocity, adding a minor risk score.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Risk Level Thresholds</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex gap-3">
                            <div className="font-semibold w-24">Low Risk (0-39):</div>
                            <div className="text-muted-foreground">Considered normal. No action is taken.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="font-semibold w-24">Medium Risk (40-79):</div>
                            <div className="text-muted-foreground">Unusual but not critical. Review is advised but not forced.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="font-semibold w-24">High Risk (80-100):</div>
                            <div className="text-muted-foreground">Potential fraud detected. Transaction is flagged for mandatory review.</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-secondary/60">
                <CardHeader>
                    <CardTitle className="font-headline">Ethical & Academic Disclaimer</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This fraud detection engine is a **simulation** built for the MIS5203 Capstone Project. It demonstrates core principles of rule-based security systems. It is not a real-world system and does not process real payments. The rules are intentionally transparent and simple to serve as an educational tool for discussing concepts like false positives, rule tuning, and explainable AI in a fintech context. This design prioritises transparency, explainability, and user trust over predictive complexity.</p>
                </CardContent>
            </Card>
            <div className="text-center pt-6">
                <Button asChild variant="outline">
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                </Button>
            </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
              Built for MIS5203 Master’s Capstone Project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
