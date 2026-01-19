"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { z } from "zod";
import type { RiskLevel } from "./types";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const validated = registerSchema.parse(values);
    const userCredential = await createUserWithEmailAndPassword(auth, validated.email, validated.password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: 'user', // Default role
      createdAt: serverTimestamp(),
      mfaEnabled: false
    });
    
    await sendEmailVerification(user);
    await addDoc(collection(db, "auditLogs"), {
        event: "User Registered",
        userId: user.uid,
        timestamp: serverTimestamp(),
        details: { ip: "unknown", userAgent: "unknown", status: "Success" }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function signInUser(values: z.infer<typeof signInSchema>) {
    try {
        const validated = signInSchema.parse(values);
        const userCredential = await signInWithEmailAndPassword(auth, validated.email, validated.password);
        
        if (!userCredential.user.emailVerified) {
            await signOut(auth);
            return { error: "Please verify your email before logging in." };
        }
        
        await addDoc(collection(db, "auditLogs"), {
            event: "Login",
            userId: userCredential.user.uid,
            timestamp: serverTimestamp(),
            details: { ip: "unknown", userAgent: "unknown", status: "Success" }
        });

        return { success: true };

    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password.';
                    break;
                default:
                    errorMessage = error.message;
            }
        }
        // Log failed login attempt
        await addDoc(collection(db, "auditLogs"), {
            event: "Failed Login",
            userId: values.email, // Log email used for failed attempt
            timestamp: serverTimestamp(),
            details: { error: errorMessage }
        });

        return { error: errorMessage };
    }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

const transactionSchema = z.object({
    amount: z.coerce.number().positive(),
    location: z.string().min(1),
    device: z.enum(["Mobile", "Desktop"]),
});

export async function createTransaction(values: z.infer<typeof transactionSchema>, userId: string) {
    if (!userId) {
        return { error: "User not authenticated." };
    }

    try {
        const validated = transactionSchema.parse(values);
        
        // Fraud Detection Logic
        let riskScore = 0;
        const flaggingReasons: string[] = [];
        
        // Rule 1: Amount > normal threshold
        if (validated.amount > 1000) {
            riskScore += 40;
            flaggingReasons.push(`Transaction amount ($${validated.amount}) is unusually high.`);
        }
        
        // Rule 2: Location mismatch (Simulated)
        const unusualLocations = ["North Korea", "Syria", "Iran"];
        if (unusualLocations.some(loc => validated.location.toLowerCase().includes(loc.toLowerCase()))) {
            riskScore += 30;
            flaggingReasons.push(`Transaction location (${validated.location}) is considered high-risk.`);
        }

        // Rule 3: Rapid repeat transactions (simulated by random chance for this project)
        if (Math.random() < 0.1) { // 10% chance to simulate rapid transaction
            riskScore += 30;
            flaggingReasons.push("Transaction frequency is unusually rapid.");
        }
        
        riskScore = Math.min(riskScore, 100);

        let riskLevel: RiskLevel;
        if (riskScore <= 30) riskLevel = 'Low';
        else if (riskScore <= 70) riskLevel = 'Medium';
        else riskLevel = 'High';

        const transactionData = {
            ...validated,
            userId,
            createdAt: serverTimestamp(),
            riskScore,
            riskLevel,
            flaggingReasons,
        };
        
        const docRef = await addDoc(collection(db, "transactions"), transactionData);

        if (riskLevel === 'High') {
            await addDoc(collection(db, "auditLogs"), {
                event: "Transaction Flagged",
                userId: userId,
                timestamp: serverTimestamp(),
                details: {
                    transactionId: docRef.id,
                    amount: validated.amount,
                    location: validated.location,
                    riskScore: riskScore,
                    reasons: flaggingReasons
                }
            });
        }
        
        return { success: true, transactionId: docRef.id, riskLevel };

    } catch (error: any) {
        return { error: error.message };
    }
}
