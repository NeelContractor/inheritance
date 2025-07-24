'use client';

import React, { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const InheritancePageSwitch = dynamic(
  () => import('@/components/inheritance/InheritancePage'),
  { ssr: false }
);

const Dashboard: FC = () => {
    const { connected } = useWallet();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkWallet = async () => {
        // Add a small delay to prevent immediate redirection
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!connected) {
            router.replace('/');
        }
        setIsLoading(false);
        };

        checkWallet();
    }, [connected, router]);

    // Show nothing while checking wallet status
    if (isLoading) {
        return null;
    }

    // If not connected, show nothing (redirect will happen)
    if (!connected) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href={"/"} className="text-2xl font-bold">Inheritance</Link>
            </div>
        </nav>
        
        <main className="max-w-7xl mx-auto p-8">
            <InheritancePageSwitch />
        </main>
        </div>
    );
};

export default Dashboard; 