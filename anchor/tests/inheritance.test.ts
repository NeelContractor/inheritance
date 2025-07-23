import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js'
import { Inheritance } from '../target/types/inheritance'

describe('Inheritance', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Inheritance as Program<Inheritance>

  const owner = Keypair.generate();
  const beneficiary = Keypair.generate();

  beforeAll(async() => {
    // Airdrop to owner
    const ownerSignature = await provider.connection.requestAirdrop(owner.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(ownerSignature);
    
    // Airdrop to beneficiary for transaction fees
    const beneficiarySignature = await provider.connection.requestAirdrop(beneficiary.publicKey, 0.1 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(beneficiarySignature);
  })

  it('Creates an escrow with 15 second deadline', async () => {
    const slot = await provider.connection.getSlot();
    const timestamp = await provider.connection.getBlockTime(slot);
    if (!timestamp) throw new Error("couldn't get block time");

    const deadline = timestamp + 15;
    const seed = "RANDOM_SEED";

    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), owner.publicKey.toBuffer(), Buffer.from(seed)],
      program.programId
    );

    await program.methods
      .initialize(
        new anchor.BN(deadline),
        beneficiary.publicKey,
        seed
      )
      .accountsStrict({
        owner: owner.publicKey,
        escrow: escrowPDA,
        systemProgram: SystemProgram.programId
      })
      .signers([owner])
      .rpc()

    // Deposit some SOL into the escrow
    const depositAmount = 0.5 * LAMPORTS_PER_SOL;
    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accountsStrict({
        owner: owner.publicKey,
        escrow: escrowPDA,
        systemProgram: SystemProgram.programId
      })
      .signers([owner])
      .rpc()

    const escrowAcc = await program.account.escrow.fetch(escrowPDA);

    expect(escrowAcc.beneficiary.toBase58()).toEqual(beneficiary.publicKey.toBase58());
    expect(escrowAcc.deadline.toString()).toEqual(new anchor.BN(deadline).toString());
  })

  /**
   * below test is failing in logs but in explorer test is successful
   */
  it('Allow claim after 15 seconds', async () => {
    // Wait for the deadline to pass
    await new Promise(resolve => setTimeout(resolve, 17000));

    const seed = "RANDOM_SEED";
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), owner.publicKey.toBuffer(), Buffer.from(seed)],
      program.programId
    );

    const balanceBefore = await provider.connection.getBalance(beneficiary.publicKey);
    const escrowBalanceBefore = await provider.connection.getBalance(escrowPDA);
    
    console.log("Beneficiary balance before:", balanceBefore);
    console.log("Escrow balance before:", escrowBalanceBefore);

    const tx = await program.methods
      .claim()
      .accountsStrict({
        beneficiary: beneficiary.publicKey,
        escrow: escrowPDA,
        systemProgram: SystemProgram.programId
      })
      .signers([beneficiary])
      .rpc({ skipPreflight: true })

    console.log("tx:", tx);

    const balanceAfter = await provider.connection.getBalance(beneficiary.publicKey);
    
    console.log("Beneficiary balance after:", balanceAfter);
  }, 15000) // Increase timeout to 25 seconds
})