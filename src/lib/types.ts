export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  mfaEnabled: boolean;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Transaction {
  id: string;
  amount: number;
  location: string;
  device: 'Mobile' | 'Desktop';
  createdAt: Date;
  riskScore: number;
  riskLevel: RiskLevel;
  flaggingReasons?: string[];
}

export interface AuditLog {
  id:string;
  event: 'Login' | 'Failed Login' | 'Transaction Flagged' | 'Admin Action' | 'User Registered';
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
}
