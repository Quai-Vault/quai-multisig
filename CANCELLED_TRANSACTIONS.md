# Cancelled Transactions Feature

## Overview

Added support for displaying cancelled transactions in the wallet's transaction history.

## Implementation

### 1. MultisigService (`frontend/src/services/MultisigService.ts`)

Added new method `getCancelledTransactions()` that:
- Queries `TransactionCancelled` events from the smart contract
- Fetches transaction details for each cancelled transaction
- Returns a list of cancelled transactions with their approval history
- Handles the same block range limitations as other event queries (uses 5,000 blocks conservatively, network limit is 10,000 blocks, fallback to 2,000 if needed)

### 2. useMultisig Hook (`frontend/src/hooks/useMultisig.ts`)

Added:
- New query for fetching cancelled transactions
- `cancelledTransactions` data field
- `isLoadingCancelled` loading state
- `refreshCancelled()` utility function
- Auto-invalidation of cancelled transactions cache when transactions are cancelled

### 3. Transaction History UI (`frontend/src/pages/TransactionHistory.tsx`)

Added new "Cancelled Transactions" section that:
- Displays cancelled transactions in a separate card below executed transactions
- Shows transactions with a "Cancelled" badge (gray background)
- Displays the approval count before cancellation
- Shows which owners had approved the transaction before it was cancelled
- Has reduced opacity (75%) to visually distinguish from active transactions
- Includes refresh button for manual updates

## How It Works

When a transaction is cancelled:
1. The smart contract emits a `TransactionCancelled` event
2. The transaction's `cancelled` field is set to `true` in the contract storage
3. The frontend queries for these events and fetches the transaction details
4. Cancelled transactions are removed from "Pending" and shown in "Cancelled" section

## UI Features

- **Visual Distinction**: Cancelled transactions have:
  - Gray "Cancelled" badge
  - Reduced opacity (75%)
  - Shows approval status "before cancel"

- **Information Displayed**:
  - Transaction type (Transfer or Contract Call)
  - Timestamp when cancelled
  - Destination address
  - Value in QUAI
  - Transaction hash
  - Number of approvals before cancellation
  - List of owners who had approved it

## Usage

Navigate to the Transaction History page for any multisig wallet to see:
1. **Executed Transactions** - Successfully executed transactions
2. **Cancelled Transactions** - Transactions that were cancelled by owners

Both sections auto-refresh and have manual refresh buttons.
