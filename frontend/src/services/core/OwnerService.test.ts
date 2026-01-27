import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OwnerService } from './OwnerService';
import { TransactionService } from './TransactionService';

// Valid test addresses (42 chars: 0x + 40 hex)
const VALID_WALLET = '0x1234567890123456789012345678901234567890';
const VALID_OWNER = '0xabcdef0123456789abcdef0123456789abcdef01';
const VALID_MODULE = '0x9876543210987654321098765432109876543210';
const VALID_SIGNER = '0xfedcba0987654321fedcba0987654321fedcba09';
const VALID_OWNER_2 = '0x1111111111111111111111111111111111111111';
const VALID_OWNER_3 = '0x2222222222222222222222222222222222222222';

// Mock config
vi.mock('../../config/contracts', () => ({
  CONTRACT_ADDRESSES: {
    MULTISIG_IMPLEMENTATION: '0xImplementation12345678901234567890',
  },
  NETWORK_CONFIG: {
    RPC_URL: 'http://localhost:8545',
  },
}));

// Mock ABIs
vi.mock('../../config/abi/MultisigWallet.json', () => ({
  default: { abi: [] },
}));

describe('OwnerService', () => {
  let service: OwnerService;
  let mockTransactionService: any;
  let mockSigner: any;
  let mockWallet: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTransactionService = {
      setSigner: vi.fn(),
      proposeTransaction: vi.fn().mockResolvedValue('0xproposedtxhash'),
      getPendingTransactions: vi.fn().mockResolvedValue([]),
    };

    service = new OwnerService(undefined, mockTransactionService as unknown as TransactionService);

    mockSigner = {
      getAddress: vi.fn().mockResolvedValue(VALID_SIGNER),
    };

    mockWallet = {
      isOwner: vi.fn().mockResolvedValue(false),
      getOwners: vi.fn().mockResolvedValue([VALID_OWNER, VALID_OWNER_2]),
      threshold: vi.fn().mockResolvedValue(2n),
      modules: vi.fn().mockResolvedValue(false),
      interface: {
        encodeFunctionData: vi.fn().mockReturnValue('0xencoded'),
        decodeFunctionData: vi.fn(),
      },
    };

    vi.spyOn(service as any, 'getWalletContract').mockReturnValue(mockWallet);
  });

  describe('constructor', () => {
    it('should create service with default transaction service', () => {
      const newService = new OwnerService();
      expect(newService).toBeDefined();
    });

    it('should create service with provided transaction service', () => {
      const newService = new OwnerService(undefined, mockTransactionService);
      expect(newService).toBeDefined();
    });
  });

  describe('setSigner', () => {
    it('should set signer on both services', () => {
      service.setSigner(mockSigner);

      expect(mockTransactionService.setSigner).toHaveBeenCalledWith(mockSigner);
    });
  });

  describe('addOwner', () => {
    beforeEach(() => {
      service.setSigner(mockSigner);
    });

    it('should throw when signer not set', async () => {
      service.setSigner(null);

      await expect(service.addOwner(VALID_WALLET, VALID_OWNER)).rejects.toThrow('Signer not set');
    });

    it('should throw for invalid address', async () => {
      await expect(service.addOwner(VALID_WALLET, 'invalid')).rejects.toThrow('Invalid address');
    });

    it('should throw when address is already an owner', async () => {
      mockWallet.isOwner.mockResolvedValue(true);

      await expect(service.addOwner(VALID_WALLET, VALID_OWNER)).rejects.toThrow(
        'Address is already an owner'
      );
    });

    it('should propose addOwner transaction', async () => {
      mockWallet.isOwner.mockResolvedValue(false);

      const result = await service.addOwner(VALID_WALLET, VALID_OWNER);

      expect(result).toBe('0xproposedtxhash');
      expect(mockWallet.interface.encodeFunctionData).toHaveBeenCalledWith('addOwner', [
        VALID_OWNER,
      ]);
      expect(mockTransactionService.proposeTransaction).toHaveBeenCalledWith(
        VALID_WALLET,
        VALID_WALLET, // self-call
        0n,
        '0xencoded'
      );
    });
  });

  describe('removeOwner', () => {
    beforeEach(() => {
      service.setSigner(mockSigner);
    });

    it('should throw when signer not set', async () => {
      service.setSigner(null);

      await expect(service.removeOwner(VALID_WALLET, VALID_OWNER)).rejects.toThrow('Signer not set');
    });

    it('should throw for invalid address', async () => {
      await expect(service.removeOwner(VALID_WALLET, 'invalid')).rejects.toThrow('Invalid address');
    });

    it('should throw when address is not an owner', async () => {
      mockWallet.isOwner.mockResolvedValue(false);

      await expect(service.removeOwner(VALID_WALLET, VALID_OWNER)).rejects.toThrow(
        'Address is not an owner'
      );
    });

    it('should throw when removing would violate threshold', async () => {
      mockWallet.isOwner.mockResolvedValue(true);
      mockWallet.getOwners.mockResolvedValue([VALID_OWNER, VALID_OWNER_2]);
      mockWallet.threshold.mockResolvedValue(2n);

      await expect(service.removeOwner(VALID_WALLET, VALID_OWNER)).rejects.toThrow(
        'Cannot remove owner'
      );
    });

    it('should propose removeOwner transaction', async () => {
      mockWallet.isOwner.mockResolvedValue(true);
      mockWallet.getOwners.mockResolvedValue([VALID_OWNER, VALID_OWNER_2, VALID_OWNER_3]);
      mockWallet.threshold.mockResolvedValue(2n);

      const result = await service.removeOwner(VALID_WALLET, VALID_OWNER);

      expect(result).toBe('0xproposedtxhash');
      expect(mockWallet.interface.encodeFunctionData).toHaveBeenCalledWith('removeOwner', [
        VALID_OWNER,
      ]);
    });
  });

  describe('changeThreshold', () => {
    beforeEach(() => {
      service.setSigner(mockSigner);
    });

    it('should throw when signer not set', async () => {
      service.setSigner(null);

      await expect(service.changeThreshold(VALID_WALLET, 2)).rejects.toThrow('Signer not set');
    });

    it('should throw when threshold is less than 1', async () => {
      await expect(service.changeThreshold(VALID_WALLET, 0)).rejects.toThrow(
        'Threshold must be at least 1'
      );
    });

    it('should throw when threshold exceeds owner count', async () => {
      mockWallet.getOwners.mockResolvedValue([VALID_OWNER, VALID_OWNER_2]);

      await expect(service.changeThreshold(VALID_WALLET, 3)).rejects.toThrow(
        'Threshold cannot exceed number of owners'
      );
    });

    it('should propose changeThreshold transaction', async () => {
      mockWallet.getOwners.mockResolvedValue([VALID_OWNER, VALID_OWNER_2, VALID_OWNER_3]);

      const result = await service.changeThreshold(VALID_WALLET, 2);

      expect(result).toBe('0xproposedtxhash');
      expect(mockWallet.interface.encodeFunctionData).toHaveBeenCalledWith('changeThreshold', [2]);
    });
  });

  describe('enableModule', () => {
    beforeEach(() => {
      service.setSigner(mockSigner);
    });

    it('should throw when signer not set', async () => {
      service.setSigner(null);

      await expect(service.enableModule(VALID_WALLET, VALID_MODULE)).rejects.toThrow(
        'Signer not set'
      );
    });

    it('should throw for invalid address', async () => {
      await expect(service.enableModule(VALID_WALLET, 'invalid')).rejects.toThrow('Invalid address');
    });

    it('should throw when module is already enabled', async () => {
      mockWallet.modules.mockResolvedValue(true);

      await expect(service.enableModule(VALID_WALLET, VALID_MODULE)).rejects.toThrow(
        'Module is already enabled'
      );
    });

    it('should propose enableModule transaction', async () => {
      mockWallet.modules.mockResolvedValue(false);

      const result = await service.enableModule(VALID_WALLET, VALID_MODULE);

      expect(result).toBe('0xproposedtxhash');
      expect(mockWallet.interface.encodeFunctionData).toHaveBeenCalledWith('enableModule', [
        VALID_MODULE,
      ]);
    });
  });

  describe('disableModule', () => {
    beforeEach(() => {
      service.setSigner(mockSigner);
    });

    it('should throw when signer not set', async () => {
      service.setSigner(null);

      await expect(service.disableModule(VALID_WALLET, VALID_MODULE)).rejects.toThrow(
        'Signer not set'
      );
    });

    it('should throw for invalid address', async () => {
      await expect(service.disableModule(VALID_WALLET, 'invalid')).rejects.toThrow(
        'Invalid address'
      );
    });

    it('should throw when module is not enabled', async () => {
      mockWallet.modules.mockResolvedValue(false);

      await expect(service.disableModule(VALID_WALLET, VALID_MODULE)).rejects.toThrow(
        'Module is not enabled'
      );
    });

    it('should propose disableModule transaction', async () => {
      mockWallet.modules.mockResolvedValue(true);

      const result = await service.disableModule(VALID_WALLET, VALID_MODULE);

      expect(result).toBe('0xproposedtxhash');
      expect(mockWallet.interface.encodeFunctionData).toHaveBeenCalledWith('disableModule', [
        VALID_MODULE,
      ]);
    });
  });
});
