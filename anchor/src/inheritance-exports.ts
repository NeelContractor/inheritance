// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import InheritanceIDL from '../target/idl/inheritance.json'
import type { Inheritance } from '../target/types/inheritance'

// Re-export the generated IDL and type
export { Inheritance, InheritanceIDL }

// The programId is imported from the program IDL.
export const INHERITANCE_PROGRAM_ID = new PublicKey(InheritanceIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getInheritanceProgram(provider: AnchorProvider, address?: PublicKey): Program<Inheritance> {
  return new Program({ ...InheritanceIDL, address: address ? address.toBase58() : InheritanceIDL.address } as Inheritance, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getInheritanceProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('3kXvWrPQbBhakjWEGwWTiyXBf6yebzWXVTDAqqicJG2L')
    case 'mainnet-beta':
    default:
      return INHERITANCE_PROGRAM_ID
  }
}
