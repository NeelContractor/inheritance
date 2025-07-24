"use client"
import { WalletButton } from "../solana/solana-provider";

export const Hero = () => {
  return (
    <div className="space-y-6 pt-24">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-6xl font-bold text-white tracking-tight">
          Inheritance
        </h1>
      </div>
      <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        The next generation of digital asset inheritance.
        <br />
        Secure, automated, and decentralized on Solana.
      </p>
      <div className="inline-block">
        <WalletButton />
      </div>
    </div>
  );
}; 