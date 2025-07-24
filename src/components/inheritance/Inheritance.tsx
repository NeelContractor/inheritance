// "use client"
// import React, { FormEvent, useState } from 'react';
// import { PublicKey } from '@solana/web3.js';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Calendar, Clock, User, Shield, AlertTriangle } from 'lucide-react';
// import { useInheritanceProgram, useInheritanceProgramAccount } from './inheritance-data-access';
// import { WalletButton } from '../solana/solana-provider';

// export default function Inheritance() {
//   const { publicKey } = useWallet();
//   const { 
//     accounts, 
//     initialize
//   } = useInheritanceProgram();

//   // Form states
//   const [initForm, setInitForm] = useState({
//     deadline: '',
//     beneficiary: '',
//     seed: ''
//   });
  
//   const [depositForm, setDepositForm] = useState({
//     amount: '',
//     seed: ''
//   });
  
//   const [checkinForm, setCheckinForm] = useState({
//     seed: '',
//     newDeadline: ''
//   });
  
//   const [claimForm, setClaimForm] = useState({
//     seed: '',
//     ownerPubkey: ''
//   });
  
//   const [cancelForm, setCancelForm] = useState({
//     seed: ''
//   });

//   // Helper functions
//   const formatDate = (timestamp: number) => {
//     return new Date(timestamp * 1000).toLocaleString();
//   };

//   // const formatSOL = (lamports: number) => {
//   //   return (lamports / 1e9).toFixed(4);
//   // };

//   const isDeadlineReached = (deadline: number) => {
//     return Date.now() / 1000 >= deadline;
//   };

//   // Get program account functions for operations that need them
//   const getAccountOperations = (accountPubkey: PublicKey) => {
//     return useInheritanceProgramAccount({ account: accountPubkey });
//   };

//   const handleInitialize = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!publicKey) return;
    
//     try {
//       const deadlineTimestamp = Math.floor(new Date(initForm.deadline).getTime() / 1000);
//       await initialize.mutateAsync({
//         deadline: deadlineTimestamp,
//         beneficiary: new PublicKey(initForm.beneficiary),
//         seed: initForm.seed,
//         ownerPubkey: publicKey
//       });
//       setInitForm({ deadline: '', beneficiary: '', seed: '' });
//     } catch (error) {
//       console.error('Initialize error:', error);
//     }
//   };

//   const handleDeposit = async (e: FormEvent, accountPubkey: PublicKey) => {
//     e.preventDefault();
//     if (!publicKey) return;
    
//     try {
//       const { deposit } = getAccountOperations(accountPubkey);
//       const amountLamports = parseFloat(depositForm.amount) * 1e9;
//       await deposit.mutateAsync({
//         amount: amountLamports,
//         seed: depositForm.seed,
//         ownerPubkey: publicKey
//       });
//       setDepositForm({ amount: '', seed: '' });
//     } catch (error) {
//       console.error('Deposit error:', error);
//     }
//   };

//   const handleCheckin = async (e: FormEvent, accountPubkey: PublicKey) => {
//     e.preventDefault();
//     if (!publicKey) return;
    
//     try {
//       const { checkin } = getAccountOperations(accountPubkey);
//       const newDeadlineTimestamp = Math.floor(new Date(checkinForm.newDeadline).getTime() / 1000);
//       await checkin.mutateAsync({
//         seed: checkinForm.seed,
//         ownerPubkey: publicKey,
//         newDeadline: newDeadlineTimestamp
//       });
//       setCheckinForm({ seed: '', newDeadline: '' });
//     } catch (error) {
//       console.error('Checkin error:', error);
//     }
//   };

//   const handleClaim = async (e: FormEvent, accountPubkey: PublicKey) => {
//     e.preventDefault();
//     if (!publicKey) return;
    
//     try {
//       const { claim } = getAccountOperations(accountPubkey);
//       await claim.mutateAsync({
//         seed: claimForm.seed,
//         ownerPubkey: new PublicKey(claimForm.ownerPubkey),
//         beneficiary: publicKey
//       });
//       setClaimForm({ seed: '', ownerPubkey: '' });
//     } catch (error) {
//       console.error('Claim error:', error);
//     }
//   };

//   const handleCancel = async (e: FormEvent, accountPubkey: PublicKey) => {
//     e.preventDefault();
//     if (!publicKey) return;
    
//     try {
//       const { cancel } = getAccountOperations(accountPubkey);
//       await cancel.mutateAsync({
//         seed: cancelForm.seed,
//         ownerPubkey: publicKey,
//         beneficiary: new PublicKey('11111111111111111111111111111111') // System program as placeholder
//       });
//       setCancelForm({ seed: '' });
//     } catch (error) {
//       console.error('Cancel error:', error);
//     }
//   };

//   if (!publicKey) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Card className="w-96">
//           <CardHeader className="text-center">
//             <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
//             <CardTitle>Inheritance Program</CardTitle>
//             <CardDescription>Please connect your wallet to continue</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-8">
//         <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold mb-2">Inheritance Program</h1>
//             <p className="text-lg text-gray-600">Secure digital inheritance on Solana</p>
//             <WalletButton />
//         </div>

//         {/* Existing Escrows */}
//         <Card>
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                     <Shield className="w-5 h-5" />
//                     Your Escrows
//                 </CardTitle>
//                 <CardDescription>
//                     Manage your existing inheritance escrows
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 {accounts.isLoading ? (
//                     <div className="text-center py-8">Loading escrows...</div>
//                 ) : accounts.data && accounts.data.length > 0 ? (
//                     <div className="space-y-4">
//                     {accounts.data.map((account) => (
//                         <Card key={account.publicKey.toString()} className="border-l-4 border-l-blue-500">
//                         <CardContent className="pt-6">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div className="space-y-2">
//                                 <div className="flex items-center gap-2">
//                                 <User className="w-4 h-4" />
//                                 <span className="font-semibold">Owner:</span>
//                                 </div>
//                                 <p className="text-sm font-mono bg-gray-100 p-2 rounded">
//                                 {account.account.owner.toString()}
//                                 </p>
//                             </div>
                            
//                             <div className="space-y-2">
//                                 <div className="flex items-center gap-2">
//                                 <User className="w-4 h-4" />
//                                 <span className="font-semibold">Beneficiary:</span>
//                                 </div>
//                                 <p className="text-sm font-mono bg-gray-100 p-2 rounded">
//                                 {account.account.beneficiary.toString()}
//                                 </p>
//                             </div>
                            
//                             {/* <div className="space-y-2">
//                                 <div className="flex items-center gap-2">
//                                 <Coins className="w-4 h-4" />
//                                 <span className="font-semibold">Balance:</span>
//                                 </div>
//                                 <p className="text-lg font-bold text-green-600">
//                                 {formatSOL(account.account.lamports?.toNumber() || 0)} SOL
//                                 </p>
//                             </div> */}
//                             </div>
                            
//                             <Separator className="my-4" />
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <div className="flex items-center gap-2 mb-2">
//                                 <Calendar className="w-4 h-4" />
//                                 <span className="font-semibold">Deadline:</span>
//                                 </div>
//                                 <p className="text-sm">{formatDate(account.account.deadline.toNumber())}</p>
//                                 <Badge 
//                                 variant={isDeadlineReached(account.account.deadline.toNumber()) ? "destructive" : "secondary"}
//                                 className="mt-1"
//                                 >
//                                 {isDeadlineReached(account.account.deadline.toNumber()) ? "Claimable" : "Active"}
//                                 </Badge>
//                             </div>
                            
//                             <div>
//                                 <div className="flex items-center gap-2 mb-2">
//                                 <Clock className="w-4 h-4" />
//                                 <span className="font-semibold">Last Check-in:</span>
//                                 </div>
//                                 <p className="text-sm">{formatDate(account.account.lastCheckin.toNumber())}</p>
//                             </div>
//                             </div>
                            
//                             <div className="mt-4">
//                             <span className="font-semibold">Seed: </span>
//                             <Badge variant="outline">{account.account.seed}</Badge>
//                             </div>
//                         </CardContent>
//                         </Card>
//                     ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-8 text-gray-500">
//                     No escrows found. Create your first one below.
//                     </div>
//                 )}
//             </CardContent>
//         </Card>

//         {/* Initialize Escrow */}
//         <Card>
//             <CardHeader>
//                 <CardTitle>Create New Escrow</CardTitle>
//                 <CardDescription>
//                     Set up a new inheritance escrow with a deadline and beneficiary
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <form onSubmit={handleInitialize} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <Label htmlFor="deadline">Deadline</Label>
//                         <Input
//                         id="deadline"
//                         type="datetime-local"
//                         value={initForm.deadline}
//                         onChange={(e) => setInitForm({...initForm, deadline: e.target.value})}
//                         required
//                         />
//                     </div>
//                     <div>
//                         <Label htmlFor="seed">Seed (unique identifier)</Label>
//                         <Input
//                         id="seed"
//                         placeholder="e.g., inheritance-2024"
//                         value={initForm.seed}
//                         onChange={(e) => setInitForm({...initForm, seed: e.target.value})}
//                         maxLength={16}
//                         required
//                         />
//                     </div>
//                     </div>
//                     <div>
//                     <Label htmlFor="beneficiary">Beneficiary Public Key</Label>
//                     <Input
//                         id="beneficiary"
//                         placeholder="Beneficiary's wallet address"
//                         value={initForm.beneficiary}
//                         onChange={(e) => setInitForm({...initForm, beneficiary: e.target.value})}
//                         required
//                     />
//                     </div>
//                     <Button type="submit" disabled={initialize.isPending} className="w-full">
//                     {initialize.isPending ? 'Creating...' : 'Create Escrow'}
//                     </Button>
//                 </form>
//             </CardContent>
//         </Card>

//         {/* Deposit */}
//         <Card>
//             <CardHeader>
//                 <CardTitle>Deposit SOL</CardTitle>
//                 <CardDescription>
//                     Add funds to an existing escrow
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <Label htmlFor="deposit-amount">Amount (SOL)</Label>
//                         <Input
//                         id="deposit-amount"
//                         type="number"
//                         step="0.001"
//                         placeholder="0.1"
//                         value={depositForm.amount}
//                         onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
//                         required
//                         />
//                     </div>
//                     <div>
//                         <Label htmlFor="deposit-seed">Seed</Label>
//                         <Input
//                         id="deposit-seed"
//                         placeholder="Escrow seed"
//                         value={depositForm.seed}
//                         onChange={(e) => setDepositForm({...depositForm, seed: e.target.value})}
//                         required
//                         />
//                     </div>
//                     </div>
//                     <Button 
//                     onClick={(e) => {
//                         // Find the account with matching seed
//                         const matchingAccount = accounts.data?.find(acc => acc.account.seed === depositForm.seed);
//                         if (matchingAccount) {
//                         handleDeposit(e, matchingAccount.publicKey);
//                         }
//                     }} 
//                     disabled={!depositForm.seed || !depositForm.amount} 
//                     className="w-full"
//                     >
//                     Deposit
//                     </Button>
//                 </div>
//             </CardContent>
//         </Card>

//         {/* Check-in */}
//         <Card>
//             <CardHeader>
//                 <CardTitle>Check-in & Update Deadline</CardTitle>
//                 <CardDescription>
//                     Prove you&apos;re alive and update the deadline
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <Label htmlFor="checkin-seed">Seed</Label>
//                         <Input
//                         id="checkin-seed"
//                         placeholder="Escrow seed"
//                         value={checkinForm.seed}
//                         onChange={(e) => setCheckinForm({...checkinForm, seed: e.target.value})}
//                         required
//                         />
//                     </div>
//                     <div>
//                         <Label htmlFor="new-deadline">New Deadline</Label>
//                         <Input
//                         id="new-deadline"
//                         type="datetime-local"
//                         value={checkinForm.newDeadline}
//                         onChange={(e) => setCheckinForm({...checkinForm, newDeadline: e.target.value})}
//                         required
//                         />
//                     </div>
//                     </div>
//                     <Button 
//                     onClick={(e) => {
//                         const matchingAccount = accounts.data?.find(acc => acc.account.seed === checkinForm.seed);
//                         if (matchingAccount) {
//                         handleCheckin(e, matchingAccount.publicKey);
//                         }
//                     }} 
//                     disabled={!checkinForm.seed || !checkinForm.newDeadline} 
//                     className="w-full"
//                     >
//                     Check-in
//                     </Button>
//                 </div>
//             </CardContent>
//         </Card>

//         {/* Claim */}
//         <Card className="border-green-200">
//             <CardHeader>
//                 <CardTitle className="text-green-700">Claim Inheritance</CardTitle>
//                 <CardDescription>
//                     Claim funds from an escrow after the deadline has passed
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                     <div className="flex items-center gap-2">
//                     <AlertTriangle className="w-4 h-4 text-yellow-600" />
//                     <span className="text-sm text-yellow-800">
//                         Only beneficiaries can claim after the deadline has passed
//                     </span>
//                     </div>
//                 </div>
//                 <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <Label htmlFor="claim-seed">Seed</Label>
//                         <Input
//                         id="claim-seed"
//                         placeholder="Escrow seed"
//                         value={claimForm.seed}
//                         onChange={(e) => setClaimForm({...claimForm, seed: e.target.value})}
//                         required
//                         />
//                     </div>
//                     <div>
//                         <Label htmlFor="owner-pubkey">Owner Public Key</Label>
//                         <Input
//                         id="owner-pubkey"
//                         placeholder="Original owner's wallet address"
//                         value={claimForm.ownerPubkey}
//                         onChange={(e) => setClaimForm({...claimForm, ownerPubkey: e.target.value})}
//                         required
//                         />
//                     </div>
//                     </div>
//                     <Button 
//                     onClick={(e) => {
//                         const matchingAccount = accounts.data?.find(acc => acc.account.seed === claimForm.seed);
//                         if (matchingAccount) {
//                         handleClaim(e, matchingAccount.publicKey);
//                         }
//                     }} 
//                     disabled={!claimForm.seed || !claimForm.ownerPubkey} 
//                     className="w-full bg-green-600 hover:bg-green-700"
//                     >
//                     Claim Inheritance
//                     </Button>
//                 </div>
//             </CardContent>
//         </Card>

//         {/* Cancel */}
//         <Card className="border-red-200">
//             <CardHeader>
//                 <CardTitle className="text-red-700">Cancel Escrow</CardTitle>
//                 <CardDescription>
//                     Cancel an escrow and retrieve all funds (owner only)
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                     <div className="flex items-center gap-2">
//                     <AlertTriangle className="w-4 h-4 text-red-600" />
//                     <span className="text-sm text-red-800">
//                         This action is irreversible and will close the escrow account
//                     </span>
//                     </div>
//                 </div>
//                 <div className="space-y-4">
//                     <div>
//                     <Label htmlFor="cancel-seed">Seed</Label>
//                     <Input
//                         id="cancel-seed"
//                         placeholder="Escrow seed"
//                         value={cancelForm.seed}
//                         onChange={(e) => setCancelForm({...cancelForm, seed: e.target.value})}
//                         required
//                     />
//                     </div>
//                     <Button 
//                     onClick={(e) => {
//                         const matchingAccount = accounts.data?.find(acc => acc.account.seed === cancelForm.seed);
//                         if (matchingAccount) {
//                         handleCancel(e, matchingAccount.publicKey);
//                         }
//                     }} 
//                     disabled={!cancelForm.seed} 
//                     variant="destructive" 
//                     className="w-full"
//                     >
//                     Cancel Escrow
//                     </Button>
//                 </div>
//             </CardContent>
//         </Card>
//     </div>
//   );
// }
