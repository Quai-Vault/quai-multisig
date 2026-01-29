import type { Contract } from '../../types';
import { extractErrorMessage } from './TransactionErrorHandler';

/**
 * Gas estimation utility with configurable buffers
 */

export interface GasEstimateOptions {
  /** Buffer percentage (e.g., 50 = 50% extra) */
  bufferPercent?: number;
  /** Minimum gas limit */
  minGas?: bigint;
  /** Maximum gas limit */
  maxGas?: bigint;
  /** Default gas if estimation fails */
  defaultGas?: bigint;
}

const DEFAULT_OPTIONS: Required<GasEstimateOptions> = {
  bufferPercent: 50,
  minGas: 100000n,
  maxGas: 2000000n,
  defaultGas: 300000n,
};

/**
 * Estimate gas for a contract function call with buffer
 */
export async function estimateGasWithBuffer(
  contractMethod: { estimateGas: (...args: any[]) => Promise<bigint> },
  args: any[],
  options: GasEstimateOptions = {}
): Promise<{ gasLimit: bigint; estimated: bigint | null }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let estimated: bigint | null = null;

  try {
    estimated = await contractMethod.estimateGas(...args);
  } catch (error: any) {
    console.warn(`  Gas estimation failed, using default:`, error);
    return {
      gasLimit: opts.defaultGas,
      estimated: null,
    };
  }

  // Apply buffer
  const buffered = estimated + (estimated * BigInt(opts.bufferPercent)) / 100n;

  // Apply min/max constraints
  let gasLimit = buffered;
  if (gasLimit < opts.minGas) {
    gasLimit = opts.minGas;
  }
  if (gasLimit > opts.maxGas) {
    gasLimit = opts.maxGas;
  }

  return { gasLimit, estimated };
}

/**
 * Estimate gas and throw a user-friendly error if it fails
 * Use this when you want to catch validation errors before sending
 */
export async function estimateGasOrThrow(
  contractMethod: { estimateGas: (...args: any[]) => Promise<bigint> },
  args: any[],
  operation: string,
  contract?: Contract
): Promise<bigint> {
  try {
    const estimated = await contractMethod.estimateGas(...args);
    return estimated;
  } catch (error: any) {
    const message = extractErrorMessage(error, contract);
    throw new Error(`Cannot ${operation}: ${message}`);
  }
}

/**
 * Build transaction options with gas limit
 */
export function buildTxOptions(
  gasLimit: bigint,
  additionalOptions?: Record<string, any>
): Record<string, any> {
  return {
    gasLimit,
    ...additionalOptions,
  };
}

/**
 * Preset gas configurations for common operations
 */
export const GasPresets = {
  /** Simple state change (approve, revoke) */
  simple: {
    bufferPercent: 50,
    minGas: 100000n,
    maxGas: 500000n,
    defaultGas: 150000n,
  },
  /** Standard transaction (propose, cancel) */
  standard: {
    bufferPercent: 50,
    minGas: 200000n,
    maxGas: 1000000n,
    defaultGas: 300000n,
  },
  /** Complex transaction (execute, module calls) */
  complex: {
    bufferPercent: 100, // 100% buffer for complex ops
    minGas: 400000n,
    maxGas: 2000000n,
    defaultGas: 500000n,
  },
  /** Self-calls (owner management) - unreliable estimation */
  selfCall: {
    bufferPercent: 100,
    minGas: 200000n,
    maxGas: 500000n,
    defaultGas: 200000n,
  },
} as const;

/**
 * Log gas usage from receipt for debugging
 */
export function logGasUsage(
  operation: string,
  receipt: any,
  gasLimit?: bigint
): void {
  if (receipt?.gasUsed) {
    console.log(`  Actual gas used for ${operation}: ${receipt.gasUsed.toString()}`);
    if (gasLimit && receipt.gasUsed > (gasLimit * 95n) / 100n) {
      console.warn(`  Warning: Gas usage was very close to limit!`, {
        used: receipt.gasUsed.toString(),
        limit: gasLimit.toString(),
      });
    }
  }
}
