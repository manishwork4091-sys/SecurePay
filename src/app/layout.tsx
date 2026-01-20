import type { Metadata } from 'next';
import { Poppins, DM_Serif_Display, Fira_Code } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins' 
});
const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif-display',
});
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' });


export const metadata: Metadata = {
  title: 'SecurePay Sentinel',
  description: 'Monitoring Digital Payments. Detecting Fraud. Building Trust.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${poppins.variable} ${dmSerifDisplay.variable} ${firaCode.variable} font-body antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
