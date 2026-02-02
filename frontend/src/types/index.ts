import type { Signer as QuaisSigner, Provider as QuaisProvider, Contract as QuaisContract } from 'quais';

export interface Transaction {
  to: string;
  value: bigint;
  data: string;
  executed: boolean;
  numApprovals: bigint;
  timestamp: bigint;
}

export interface TransactionWithHash extends Transaction {
  hash: string;
}

export interface WalletInfo {
  address: string;
  owners: string[];
  threshold: number;  // Changed from bigint for JSON serializability
  balance: string;    // Changed from bigint to string for JSON serializability (preserves precision)
}

export interface PendingTransaction {
  hash: string;
  to: string;
  value: string;      // Changed from bigint to string for JSON serializability
  data: string;
  numApprovals: number;  // Changed from bigint for JSON serializability
  threshold: number;     // Changed from bigint for JSON serializability
  executed: boolean;
  cancelled: boolean;
  timestamp: number;     // Changed from bigint for JSON serializability
  proposer: string;      // Address of the transaction proposer
  approvals: { [owner: string]: boolean };
  _optimistic?: boolean; // Flag for optimistic updates (client-side only)
}

export interface DeploymentConfig {
  owners: string[];
  threshold: number;
  salt?: string;
}

export interface TransactionData {
  to: string;
  value: bigint;
  data: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface DecodedTransaction {
  method: string;
  params: any[];
}

export type Signer = QuaisSigner;
export type Provider = QuaisProvider;
export type Contract = QuaisContract;
