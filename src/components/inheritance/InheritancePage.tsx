'use client';

import React, { FC, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from './custom-date-picker';
import { cn } from '@/lib/utils';
import { useInheritanceProgram, useInheritanceProgramAccount } from './inheritance-data-access';

// interface ExtendDuration {
//   days: number;
//   months: number;
//   years: number;
// }

interface EscrowAccountType {
    publicKey: PublicKey,
    account: {
        owner: PublicKey;
        beneficiary: PublicKey;
        deadline: BN;
        lastCheckin: BN;
        balance: BN;
        bump: number;
        seed: string;
    }
}

const InheritancePage: FC = () => {
    const { connection } = useConnection();
    const { initialize, accounts } = useInheritanceProgram();
    const { publicKey } = useWallet();
    const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [duration, setDuration] = useState<number>(0);
    // const [extendDuration, setExtendDuration] = useState<ExtendDuration>({
    //     days: 0,
    //     months: 0,
    //     years: 0
    // });
    const [depositAmount, setDepositAmount] = useState<number>(1);

    // Update duration when date changes
    useEffect(() => {
        if (selectedDate) {
            const now = new Date();
            const diffInMinutes = Math.floor((selectedDate.getTime() - now.getTime()) / (1000 * 60));
            setDuration(diffInMinutes > 0 ? diffInMinutes : 0);
        } else {
            setDuration(0);
        }
    }, [selectedDate]);

    // const formatSolBalance = (lamports: number) => {
    //     return `${(lamports / LAMPORTS_PER_SOL).toFixed(2)} SOL`;
    // };

    const StatusBadge: FC<{ deadline: BN }> = ({ deadline }) => {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = deadline.toNumber() <= now;
        
        return (
        <span className={`px-2 py-1 rounded text-sm ${
            isExpired 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
            {isExpired ? 'Expired' : 'Active'}
        </span>
        );
    };

    const activateSwitch = async (seconds: number) => {
        if (!publicKey || !connection) {
            toast.error('Please connect your wallet first.');
            return;
        }

        // try {
            const balance = await connection.getBalance(publicKey);
            const amountInLamports = depositAmount * LAMPORTS_PER_SOL;
            
            if (balance < amountInLamports) {
                toast.error(`Insufficient funds. You need at least ${depositAmount} SOL. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL.`);
                return;
            }

            const slot = await connection.getSlot();
            const currentTime = await connection.getBlockTime(slot);
            if (!currentTime) throw new Error("Couldn't get block time");

            const deadline = currentTime + seconds;
            const seed = new Date().getTime().toString();

            toast.info('Please approve the transaction.');

            await initialize.mutateAsync({ 
                deadline, 
                beneficiary: new PublicKey(beneficiaryAddress), 
                seed, 
                ownerPubkey: publicKey 
            });

        //     toast.success('Escrow created successfully!');
        // } catch (error) {
        //     console.error('Error creating escrow:', error);
        //     toast.error('Failed to create escrow');
        // }
    };

    const handleDateSelection = async () => {
        if (!beneficiaryAddress || beneficiaryAddress.trim() === '') {
            toast.error('Please enter a beneficiary address.');
            return;
        }

        if (!selectedDate) {
            toast.error('Please select a deadline date.');
            return;
        }

        if (duration <= 0) {
            toast.error('Selected date must be in the future.');
            return;
        }

        try {
            if (!PublicKey.isOnCurve(beneficiaryAddress)) {
                toast.error('Invalid beneficiary address format.');
                return;
            }
        } catch {
            toast.error('Invalid beneficiary address format.');
            return;
        }

        const seconds = duration * 60;
        await activateSwitch(seconds);
        setSelectedDate(undefined);
        setBeneficiaryAddress('');
        setDepositAmount(1);
    };

    // const calculateTotalSeconds = (duration: ExtendDuration): number => {
    //     const now = new Date();
    //     const future = new Date(now);
        
    //     // Add days
    //     future.setDate(future.getDate() + duration.days);
    //     // Add months
    //     future.setMonth(future.getMonth() + duration.months);
    //     // Add years
    //     future.setFullYear(future.getFullYear() + duration.years);
        
    //     return Math.floor((future.getTime() - now.getTime()) / 1000);
    // };

    // const DurationInputs: FC<{
    //     duration: ExtendDuration;
    //     onChange: (duration: ExtendDuration) => void;
    // }> = ({ duration, onChange }) => {
    //     const handleChange = (field: keyof ExtendDuration, value: string) => {
    //         const numValue = parseInt(value) || 0;
    //         onChange({ ...duration, [field]: numValue });
    //     };

    //     return (
    //         <div className="flex gap-4">
    //             <div>
    //                 <label className="block text-sm font-medium text-gray-200 mb-2">
    //                     Days
    //                 </label>
    //                 <input
    //                     type="number"
    //                     min="0"
    //                     value={duration.days || ''}
    //                     onChange={(e) => handleChange('days', e.target.value)}
    //                     className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg 
    //                             text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
    //                 />
    //             </div>
    //             <div>
    //                 <label className="block text-sm font-medium text-gray-200 mb-2">
    //                     Months
    //                 </label>
    //                 <input
    //                     type="number"
    //                     min="0"
    //                     value={duration.months || ''}
    //                     onChange={(e) => handleChange('months', e.target.value)}
    //                     className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg 
    //                             text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
    //                 />
    //             </div>
    //             <div>
    //                 <label className="block text-sm font-medium text-gray-200 mb-2">
    //                     Years
    //                 </label>
    //                 <input
    //                     type="number"
    //                     min="0"
    //                     value={duration.years || ''}
    //                     onChange={(e) => handleChange('years', e.target.value)}
    //                     className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg 
    //                             text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
    //                 />
    //             </div>
    //         </div>
    //     );
    // };

    // Component for individual escrow actions
    const EscrowActions: FC<{ escrow: EscrowAccountType }> = ({ escrow }) => {
        const { deposit, claim, cancel } = useInheritanceProgramAccount({
            account: escrow.publicKey
        });
        const [depositAmount, setDepositAmount] = useState<number>(1);

        // const [localExtendDuration, setLocalExtendDuration] = useState<ExtendDuration>({
        //     days: 0,
        //     months: 0,
        //     years: 0
        // });

        // const handleCheckIn = async () => {
        //     if (!publicKey) return;
            
        //     try {
        //         const totalSeconds = calculateTotalSeconds(localExtendDuration);
        //         const slot = await connection.getSlot();
        //         const currentTime = await connection.getBlockTime(slot);
        //         if (!currentTime) throw new Error("Couldn't get block time");
                
        //         const newDeadline = currentTime + totalSeconds;
                
        //         await checkin.mutateAsync({
        //             seed: escrow.account.seed,
        //             ownerPubkey: publicKey,
        //             newDeadline
        //         });
                
        //         toast.success('Check-in successful!');
        //         setLocalExtendDuration({ days: 0, months: 0, years: 0 });
        //     } catch (error) {
        //         console.error('Error checking in:', error);
        //         toast.error('Failed to check in');
        //     }
        // };

        const handleClaim = async () => {
            if (!publicKey) return;
            
            try {
                await claim.mutateAsync({
                    seed: escrow.account.seed,
                    ownerPubkey: escrow.account.owner,
                    beneficiary: publicKey
                });
                
                toast.success('Funds claimed successfully!');
            } catch (error) {
                console.error('Error claiming funds:', error);
                toast.error('Failed to claim funds');
            }
        };

        const handleCancel = async () => {
            if (!publicKey) return;
            
            try {
                await cancel.mutateAsync({
                    seed: escrow.account.seed,
                    ownerPubkey: publicKey,
                    beneficiary: escrow.account.beneficiary
                });
                
                toast.success('Escrow cancelled successfully!');
            } catch (error) {
                console.error('Error cancelling escrow:', error);
                toast.error('Failed to cancel escrow');
            }
        };

        const handleDeposit = async () => {
            if (!publicKey) return;
            
            toast.success('approve deposit!');
            // try {
                await deposit.mutateAsync({
                    amount: depositAmount,
                    seed: escrow.account.seed,
                    ownerPubkey: publicKey,
                });
                
            //     toast.success('Escrow deposit successfully!');
            // } catch (error) {
            //     console.error('Error depositing escrow:', error);
            //     toast.error('Failed to deposit escrow');
            // }
        };

        const isExpired = escrow.account.deadline.toNumber() <= Date.now() / 1000;
        const isBeneficiary = escrow.account.beneficiary.toString() === publicKey?.toString();
        const isOwner = escrow.account.owner.toString() === publicKey?.toString();
        // const isBalanced = escrow.account.balance > 0;

        if (isBeneficiary) {
            return (
                <Button
                    onClick={handleClaim}
                    variant="default"
                    size="lg"
                    disabled={!isExpired || claim.isPending}
                    className={cn(
                        "w-32 bg-gradient-to-r",
                        isExpired
                            ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            : "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
                        "shadow-lg hover:shadow-green-500/25",
                        "border border-white/10",
                        "transition-all duration-300 ease-out",
                        "font-semibold text-base",
                        "group relative overflow-hidden",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>{claim.isPending ? 'Claiming...' : 'Claim'}</span>
                        {isExpired && !claim.isPending && (
                            <svg 
                                className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        )}
                    </span>
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
                </Button>
            );
        }

        if (isOwner) {
            return (
                <>
                    {/* <DurationInputs
                        duration={localExtendDuration}
                        onChange={setLocalExtendDuration}
                    /> */}

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Amount (SOL)
                        </label>
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                                    text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter amount in SOL"
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                    <Button
                            onClick={handleDeposit}
                            variant="default"
                            size="lg"
                            disabled={deposit.isPending}
                            className={cn(
                                "w-32 bg-gradient-to-r from-blue-500 to-blue-600",
                                "hover:from-blue-600 hover:to-blue-700",
                                "shadow-lg hover:shadow-blue-500/25",
                                "border border-white/10",
                                "transition-all duration-300 ease-out",
                                "font-semibold text-base",
                                "disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed",
                                "group relative overflow-hidden"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>{deposit.isPending ? 'Depositing...' : 'Deposit'}</span>
                                {!deposit.isPending && (
                                    <svg 
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
                        </Button>
                        
                        <Button
                            onClick={handleCancel}
                            variant="default"
                            size="lg"
                            disabled={cancel.isPending}
                            className={cn(
                                "w-32 bg-gradient-to-r from-red-500 to-red-600",
                                "hover:from-red-600 hover:to-red-700",
                                "shadow-lg hover:shadow-red-500/25",
                                "border border-white/10",
                                "transition-all duration-300 ease-out",
                                "font-semibold text-base",
                                "group relative overflow-hidden"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>{cancel.isPending ? 'Cancelling...' : 'Cancel'}</span>
                                {!cancel.isPending && (
                                    <svg 
                                        className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
                        </Button>
                    </div>
                </>
            );
        }

        return null;
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {publicKey ? (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Time-Locked Succession</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Set up automatic transfer of funds if you don&apos;t check in regularly
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-6">Create New Escrow</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Beneficiary Address
                                </label>
                                <input
                                    type="text"
                                    value={beneficiaryAddress}
                                    onChange={(e) => setBeneficiaryAddress(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                                            text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter Solana address"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-200">
                                    Select Deadline Date
                                </label>
                                <DatePickerDemo 
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                />
                                {duration > 0 && (
                                    <p className="text-sm text-zinc-400 mt-2">
                                        Duration: {duration} minutes
                                    </p>
                                )}
                                <Button
                                    onClick={handleDateSelection}
                                    variant="default"
                                    size="lg"
                                    className={cn(
                                        "w-full mt-4 bg-gradient-to-r from-gray-500 to-gray-600",
                                        "hover:from-gray-600 hover:to-gray-700",
                                        "shadow-lg hover:shadow-gray-500/25",
                                        "border border-white/10",
                                        "transition-all duration-300 ease-out",
                                        "font-semibold text-base",
                                        "disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed",
                                        "group relative overflow-hidden"
                                    )}
                                    disabled={!selectedDate || !beneficiaryAddress || duration <= 0 || initialize.isPending}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <span>{initialize.isPending ? 'Creating...' : 'Create Switch'}</span>
                                        {!initialize.isPending && (
                                            <svg 
                                                className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-6">Your Escrows</h3>
                        
                        {accounts.isLoading ? (
                            <p className="text-gray-400">Loading escrows...</p>
                        ) : accounts.data?.length === 0 ? (
                            <p className="text-gray-400">No escrows found</p>
                        ) : (
                            <div className="space-y-6">
                                {accounts.data?.map((escrow) => (
                                    <div 
                                        key={escrow.publicKey.toString()} 
                                        className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-4 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-semibold text-white">Escrow</h4>
                                                    <StatusBadge deadline={escrow.account.deadline} />
                                                </div>
                                                
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-gray-300">
                                                        <span className="text-gray-400">Beneficiary:</span> {escrow.account.beneficiary.toString()}
                                                    </p>
                                                    {/* <p className="text-gray-300">
                                                        <span className="text-gray-400">Balance:</span> {escrow.account.balance?.toNumber() / LAMPORTS_PER_SOL}
                                                    </p> */}
                                                    <p className="text-gray-300">
                                                        <span className="text-gray-400">Last Check-in:</span> {new Date(escrow.account.lastCheckin.toNumber() * 1000).toLocaleString()}
                                                    </p>
                                                    <p className="text-gray-300">
                                                        <span className="text-gray-400">Deadline:</span> {new Date(escrow.account.deadline.toNumber() * 1000).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="ml-6">
                                                <EscrowActions escrow={escrow} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => activateSwitch(15)}
                            variant="default"
                            size="lg"
                            disabled={!beneficiaryAddress || initialize.isPending}
                            className={cn(
                                "flex-1 bg-gradient-to-r from-purple-500 to-purple-600",
                                "hover:from-purple-600 hover:to-purple-700",
                                "shadow-lg hover:shadow-purple-500/25",
                                "border border-white/10",
                                "transition-all duration-300 ease-out",
                                "font-semibold text-base",
                                "group relative overflow-hidden",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>15s Escrow for testing</span>
                                <svg 
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
                        </Button>
                        
                        <Button
                            onClick={() => activateSwitch(30)}
                            variant="default"
                            size="lg"
                            disabled={!beneficiaryAddress || initialize.isPending}
                            className={cn(
                                "flex-1 bg-gradient-to-r from-purple-500 to-purple-600",
                                "hover:from-purple-600 hover:to-purple-700",
                                "shadow-lg hover:shadow-purple-500/25",
                                "border border-white/10",
                                "transition-all duration-300 ease-out",
                                "font-semibold text-base",
                                "group relative overflow-hidden",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>30s Escrow for testing</span>
                                <svg 
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-gray-400">Please connect your Solana wallet to use the inheritance system.</p>
                </div>
            )}
        </div>
    );
};

export default InheritancePage;
