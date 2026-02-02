/**
 * Extract IPFS hash from contract bytecode
 * Quai Network embeds the IPFS hash at the end of the bytecode during compilation
 *
 * Example bytecode ending:
 * ...a2646970667358221220f142f8d1d1858583a1dc8e603cfe232774a829e05dae3a38cc3cc04223acf35964736f6c63430008160033
 *      ^^^^^^^^^^^^^^^^ CBOR marker for IPFS
 *                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 32-byte hash
 *
 * @param bytecode Contract bytecode (with or without 0x prefix)
 * @returns IPFS hash in CIDv0 format (Qm...) or null if not found
 */
export function extractIpfsHashFromBytecode(bytecode: string): string | null {
  try {
    // Remove 0x prefix if present
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;

    // CBOR encoding for IPFS: a264697066735822
    // This translates to: { "ipfs": bytes[34] }
    // Breakdown:
    //   a2 = map with 2 items
    //   64 = text string of length 4
    //   69706673 = "ipfs" in ASCII
    //   58 22 = bytes of length 34 (0x22 = 34)
    const ipfsMarker = 'a264697066735822';

    // Search from the end of bytecode
    const ipfsIndex = cleanBytecode.lastIndexOf(ipfsMarker);

    if (ipfsIndex === -1) {
      console.warn('IPFS marker not found in bytecode');
      return null;
    }

    // Extract the bytes after the marker
    // Format: a264697066735822 1220 <32 bytes hash>
    // The 1220 is the multihash prefix (0x12 = sha256, 0x20 = 32 bytes)
    const hashStart = ipfsIndex + ipfsMarker.length;

    // Read the next bytes: should start with 1220 (multihash prefix)
    const multihashPrefix = cleanBytecode.slice(hashStart, hashStart + 4);
    if (multihashPrefix !== '1220') {
      console.warn('Expected multihash prefix 1220, got:', multihashPrefix);
      return null;
    }

    // Extract 32 bytes (64 hex chars) after the prefix
    const hashHex = cleanBytecode.slice(hashStart, hashStart + 68); // includes 1220 prefix + 64 char hash

    if (hashHex.length !== 68) {
      console.warn('Invalid IPFS hash length:', hashHex.length);
      return null;
    }

    // Convert hex to base58 (IPFS CIDv0)
    // The hashHex already includes the 1220 prefix
    const hashBytes = hexToBytes(hashHex);
    const ipfsHash = base58Encode(hashBytes);

    return ipfsHash;
  } catch (error) {
    console.error('Failed to extract IPFS hash:', error);
    return null;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function base58Encode(bytes: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  let encoded = '';

  while (num > 0n) {
    const remainder = num % 58n;
    num = num / 58n;
    encoded = ALPHABET[Number(remainder)] + encoded;
  }

  // Add leading '1's for leading zero bytes
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    encoded = '1' + encoded;
  }

  return encoded;
}
