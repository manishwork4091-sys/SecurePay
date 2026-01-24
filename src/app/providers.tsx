import { AuthProvider } from "@/context/auth-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </FirebaseClientProvider>
    )
}
