import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield, BarChart, FileText } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: 'Digital Payment Fraud Risks',
    description: 'Simulate transactions to understand common vulnerabilities and threats in digital payments.',
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-primary" />,
    title: 'Authentication Security',
    description: 'Experience secure registration and login processes powered by Firebase Authentication.',
  },
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Real-time Fraud Detection',
    description: 'Witness our backend evaluate transactions in real-time, assigning risk scores based on intelligent rules.',
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: 'Explainable Security & Audits',
    description: 'Understand why transactions are flagged with clear explanations and review detailed audit logs.',
  },
];

export default function Home() {
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
                <Link href="/register">Register</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32 lg:py-40">
          <div className="container text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Monitoring Digital Payments.
            </h1>
            <h2 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl lg:text-7xl">
              Detecting Fraud. Building Trust.
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
              SecurePay Sentinel is a fintech security simulation platform demonstrating how to detect, prevent, and audit financial cybercrime using modern web technologies.
            </p>
            <div className="mt-8 space-x-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Access Your Account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                A Capstone Project Showcase
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mt-4">
                This application is developed as a Master’s Capstone Project (MIS5203) to explore key areas of fintech security. All transactions are simulated for educational purposes.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col items-center text-center p-6">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
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
