// components/vaults/UserSummaryCard.tsx
'use client';

import InfoIcon from "assets/icons/Info.svg";
import { SkeletonSummaryCard } from 'components/ui/Skeleton';
import { useAtomValue } from 'jotai';
import { useUserSummary } from 'lib/hooks/useUserSummary';
import { currencySymbolAtom } from 'lib/state/currency';
import React from 'react';
import { useAccount } from 'wagmi';

interface UserSummaryCardProps {
    isConnected: boolean;
}

export const UserSummaryCard: React.FC<UserSummaryCardProps> = () => {
    const { isConnected, isConnecting } = useAccount();
    const currencySymbol = useAtomValue(currencySymbolAtom);
    const { totalValue, totalApr, isLoading } = useUserSummary();

    if (isConnecting || isLoading) return <SkeletonSummaryCard />;

    return (
        <div className="bg-surfaces-base-2 p-4 rounded-xl shadow-lg flex justify-between items-center text-white">
            <div className="space-y-1">
                <div className="flex items-center gap-x-[4px]">
                    <h3 className="text-xs text-surfaces-on-3 font-medium">My Total Supply</h3>
                    <InfoIcon width={12} height={12} className="text-surfaces-on-3" />
                </div>

                <p className="text-lg font-medium text-surfaces-on-surface">
                    {isConnected ? `${currencySymbol}${(totalValue || 0).toFixed(2)}` : `${currencySymbol}0.00`}
                </p>
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-x-[4px]">
                    <h3 className="text-xs text-surfaces-on-3 font-medium">My Total APY</h3>
                    <InfoIcon width={12} height={12} className="text-surfaces-on-3" />
                </div>
                <p className="text-lg font-medium text-surfaces-on-surface">
                    {isConnected ? `${(totalApr || 0).toFixed(2)}%` : `0.00%`}
                </p>
            </div>
        </div>
    );
};
