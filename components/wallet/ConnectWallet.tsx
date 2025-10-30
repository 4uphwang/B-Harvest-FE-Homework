'use client';

import { truncateAddress } from 'lib/utils/wallet';
import { useRef } from 'react';
import { useAccount } from 'wagmi';
import { useWalletModalContext } from './WalletModalContext';

export function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const { open, toggle } = useWalletModalContext();
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <div ref={containerRef} className="relative">
                <button
                    type="button"
                    onClick={() => toggle()}
                    className="flex items-center h-8 rounded-full bg-surfaces-on-surface/[12%] px-[8px] gap-x-[6px] cursor-pointer"
                >
                    {isConnected ? (
                        <span className="text-sm font-medium text-surfaces-on-6 overflow-hidden whitespace-nowrap">
                            {truncateAddress(address as `0x${string}`, 5, 3)}
                        </span>
                    ) : (
                        <span className="text-sm font-medium text-surfaces-on-surface">Connect Wallet</span>
                    )}
                </button>

                {/* Modal panel moved to provider-level (WalletModalRoot). */}
            </div>
        </>
    );
}