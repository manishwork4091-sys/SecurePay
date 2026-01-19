"use server";

import { z } from "zod";
import type { RiskLevel } from "./types";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    registerSchema.parse(values);
    // Mock success
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
        signInSchema.parse(values);
        // Mock success for any valid input
        if (values.email === "admin@sentinel.com") {
             // In a real app you wouldn't do this, but for static mock this is fine.
             // This doesn't actually set the user role, that's handled in the mock auth context.
             // This is just to show a different flow could exist.
        }
        return { success: true };
    } catch (error: any) {
        return { error: "Invalid email or password." };
    }
}

export async function signOutUser() {
    try {
        // Mock success
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
        
        // Mocked Fraud Detection Logic
        let riskScore = 0;
        const flaggingReasons: string[] = [];
        
        if (validated.amount > 1000) {
            riskScore += 40;
            flaggingReasons.push(`Transaction amount ($${validated.amount}) is unusually high.`);
        }
        
        const unusualLocations = ["North Korea", "Syria", "Iran", "Pyongyang, North Korea"];
        if (unusualLocations.some(loc => validated.location.toLowerCase().includes(loc.toLowerCase()))) {
            riskScore += 50;
            flaggingReasons.push(`Transaction location (${validated.location}) is considered high-risk.`);
        }

        if (Math.random() < 0.1) {
            riskScore += 20;
            flaggingReasons.push("Transaction frequency is unusually rapid (simulated).");
        }
        
        riskScore = Math.min(riskScore, 100);

        let riskLevel: RiskLevel;
        if (riskScore < 40) riskLevel = 'Low';
        else if (riskScore < 80) riskLevel = 'Medium';
        else riskLevel = 'High';
        
        return { success: true, transactionId: `mock-tx-${Date.now()}`, riskLevel };

    } catch (error: any) {
        return { error: error.message };
    }
}
