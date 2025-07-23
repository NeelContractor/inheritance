# Inheritance

Crypto inheritance on Solana.
The SOL locked into the escrow can be recovered once the account is closed upon withdrawal from the beneficiary.

## 💻 Smart Contract
The core functionality is implemented in Rust using the Anchor framework:

- initialize: Create new inheritance
- deposit: Add funds to escrow
- checkin: Reset/extend the deadline
- claim: Beneficiary claims funds after deadline
- cancel: Owner cancels escrow and reclaims funds