import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  mfaEnabled: boolean;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  location: string;
  device: 'Mobile' | 'Desktop';
  createdAt: Timestamp;
  riskScore: number;
  riskLevel: RiskLevel;
  flaggingReasons?: string[];
}

export interface AuditLog {
  id: string;
  event: 'Login' | 'Failed Login' | 'Transaction Flagged' | 'Admin Action';
  userId: string;
  timestamp: Timestamp;
  details: Record<string, any>;
}
