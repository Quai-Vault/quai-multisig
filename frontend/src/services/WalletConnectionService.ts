import { BrowserProvider } from 'quais';
import type { Provider, Signer } from '../types';

interface WalletState {
  connected: boolean;
  address: string | null;
  signer: Signer | null;
  provider: Provider | null;
}

export class WalletConnectionService {
  private state: WalletState = {
    connected: false,
    address: null,
    signer: null,
    provider: null,
  };

  private listeners: Set<(state: WalletState) => void> = new Set();

  // Store bound listener references to prevent memory leaks
  // (using arrow functions ensures same reference for add/remove)
  private boundAccountsChanged = (accounts: string[]) => this.handleAccountsChanged(accounts);
  private boundChainChanged = () => this.handleChainChanged();

  /**
   * Connect to Pelagus or other Quai-compatible wallet
   */
  async connect(): Promise<void> {
    try {
      // Check if Pelagus is installed
      if (!window.ethereum) {
        throw new Error('No Quai wallet found. Please install Pelagus wallet.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider with usePathing for Quai sharded architecture
      const provider = new BrowserProvider(
        window.ethereum,
        undefined,
        { usePathing: true }
      );

      // Get signer
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      this.state = {
        connected: true,
        address,
        signer,
        provider,
      };

      this.notifyListeners();

      // Listen for account changes (use stored bound references for proper cleanup)
      window.ethereum.on('accountsChanged', this.boundAccountsChanged);
      window.ethereum.on('chainChanged', this.boundChainChanged);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    if (window.ethereum) {
      // Use stored bound references (same as added) to properly remove listeners
      window.ethereum.removeListener('accountsChanged', this.boundAccountsChanged);
      window.ethereum.removeListener('chainChanged', this.boundChainChanged);
    }

    this.state = {
      connected: false,
      address: null,
      signer: null,
      provider: null,
    };

    this.notifyListeners();
  }

  /**
   * Get current connection state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Get connected address
   */
  getAddress(): string | null {
    return this.state.address;
  }

  /**
   * Get signer instance
   */
  getSigner(): Signer | null {
    return this.state.signer;
  }

  /**
   * Get provider instance
   */
  getProvider(): Provider | null {
    return this.state.provider;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.state.connected;
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.state.signer) {
      throw new Error('Wallet not connected');
    }

    return await this.state.signer.signMessage(message);
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Handle account changes
   */
  private async handleAccountsChanged(accounts: string[]): Promise<void> {
    if (accounts.length === 0) {
      this.disconnect();
    } else {
      // Reconnect with new account
      await this.connect();
    }
  }

  /**
   * Handle chain changes
   */
  private handleChainChanged(): void {
    // Reload the page on chain change as recommended by MetaMask/Pelagus
    window.location.reload();
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

// Singleton instance
export const walletConnectionService = new WalletConnectionService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
