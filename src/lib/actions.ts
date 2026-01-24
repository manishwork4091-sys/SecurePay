'use server';

import { z } from 'zod';
import type { RiskLevel } from './types';
import { addDoc, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const transactionSchema = z.object({
  amount: z.coerce.number().positive(),
  location: z.string().min(1),
  device: z.enum(['Mobile', 'Desktop']),
});

export async function createTransaction(values: z.infer<typeof transactionSchema>, userId: string) {
  if (!userId) {
    return { error: 'User not authenticated.' };
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

    const unusualLocations = ['North Korea', 'Syria', 'Iran', 'Pyongyang, North Korea'];
    if (unusualLocations.some(loc => validated.location.toLowerCase().includes(loc.toLowerCase()))) {
      riskScore += 50;
      flaggingReasons.push(`Transaction location (${validated.location}) is considered high-risk.`);
    }

    if (Math.random() < 0.1) {
      riskScore += 20;
      flaggingReasons.push('Transaction frequency is unusually rapid (simulated).');
    }

    riskScore = Math.min(riskScore, 100);

    let riskLevel: RiskLevel;
    if (riskScore < 40) riskLevel = 'Low';
    else if (riskScore < 80) riskLevel = 'Medium';
    else riskLevel = 'High';

    const { firestore } = initializeFirebase();
    const transactionsColRef = collection(firestore, `users/${userId}/transactions`);
    
    const newTransaction = {
        ...validated,
        userId,
        createdAt: new Date(),
        riskScore,
        riskLevel,
        flaggingReasons,
    };

    const docRef = await addDoc(transactionsColRef, newTransaction);
    
    return { success: true, transactionId: docRef.id, riskLevel };
  } catch (error: any) {
    return { error: error.message };
  }
}
