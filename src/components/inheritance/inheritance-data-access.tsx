'use client'

import { getInheritanceProgram, getInheritanceProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { BN } from 'bn.js'

interface InitializeArgs {
  deadline: number, 
  beneficiary: PublicKey, 
  seed: string, 
  ownerPubkey: PublicKey
}

interface DepositArgs {
  amount: number, 
  seed: string, 
  ownerPubkey: PublicKey
}

interface CheckinArgs {
  seed: string, 
  ownerPubkey: PublicKey,
  newDeadline: number
}

interface ClaimArgs {
  seed: string, 
  ownerPubkey: PublicKey,
  beneficiary: PublicKey
}

interface CancelArgs {
  seed: string, 
  ownerPubkey: PublicKey,
  beneficiary: PublicKey
}

export function useInheritanceProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getInheritanceProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getInheritanceProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.escrow.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation<string, Error, InitializeArgs>({
    mutationKey: ['escrow', 'initialize', { cluster }],
    mutationFn: async ({ deadline, beneficiary, seed, ownerPubkey }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .initialize(
          new BN(deadline),
          beneficiary,
          seed
        )
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize account')
    },
  });

  const deposit = useMutation<string, Error, DepositArgs>({
    mutationKey: ['escrow', 'deposit', { cluster }],
    mutationFn: async ({ seed, ownerPubkey, amount }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .deposit(
          new BN(amount)
        )
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to deposit')
    },
  });

  const checkin = useMutation<string, Error, CheckinArgs>({
    mutationKey: ['escrow', 'deposit', { cluster }],
    mutationFn: async ({ seed, ownerPubkey, newDeadline }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .checkin(
          new BN(newDeadline)
        )
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to checkin')
    },
  });

  const claim = useMutation<string, Error, ClaimArgs>({
    mutationKey: ['escrow', 'deposit', { cluster }],
    mutationFn: async ({ seed, ownerPubkey, beneficiary }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .claim()
        .accountsStrict({ 
          beneficiary: beneficiary,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to claim')
    },
  });

  const cancel = useMutation<string, Error, CancelArgs>({
    mutationKey: ['escrow', 'cancel', { cluster }],
    mutationFn: async ({ seed, ownerPubkey }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .cancel()
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to cancel')
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
    deposit,
    checkin,
    claim,
    cancel
  }
}

export function useInheritanceProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useInheritanceProgram()

  const accountQuery = useQuery({
    queryKey: ['escrow', 'fetch', { cluster, account }],
    queryFn: () => program.account.escrow.fetch(account),
  })

  const deposit = useMutation<string, Error, DepositArgs>({
    mutationKey: ['escrow', 'deposit', { cluster }],
    mutationFn: async ({ seed, ownerPubkey, amount }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .deposit(
          new BN(amount)
        )
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to deposit')
    },
  });

  const checkin = useMutation<string, Error, CheckinArgs>({
    mutationKey: ['escrow', 'deposit', { cluster }],
    mutationFn: async ({ seed, ownerPubkey, newDeadline }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .checkin(
          new BN(newDeadline)
        )
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to checkin')
    },
  });

  const claim = useMutation<string, Error, ClaimArgs>({
    mutationKey: ['escrow', 'deposit', { cluster }],
    mutationFn: async ({ seed, ownerPubkey, beneficiary }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .claim()
        .accountsStrict({ 
          beneficiary: beneficiary,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to claim')
    },
  });

  const cancel = useMutation<string, Error, CancelArgs>({
    mutationKey: ['escrow', 'cancel', { cluster }],
    mutationFn: async ({ seed, ownerPubkey }) => {
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), ownerPubkey.toBuffer(), Buffer.from(seed)],
        program.programId
      );

      return await program.methods
        .cancel()
        .accountsStrict({ 
          owner: ownerPubkey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to cancel')
    },
  });

  return {
    accountQuery,
    deposit,
    checkin,
    claim,
    cancel
  }
}
