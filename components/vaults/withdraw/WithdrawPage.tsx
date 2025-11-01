'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { Vault } from 'lib/config/vaults';
import { useCoinPrices } from 'lib/hooks/useCoinPrices';
import { useVaultAprs } from 'lib/hooks/useVaultAprs';
import { useVaultBalance } from 'lib/hooks/useVaultBalance';
import { currencyAtom } from 'lib/state/currency';
import { withdrawInputAtom } from 'lib/state/withdrawInput';

import { LeftArrowIcon } from 'assets';
import { getTokenImage } from 'lib/utils/tokenImage';
import { formatApr, getPrice } from 'lib/utils/wallet';
import Image from 'next/image';
import { WithdrawActionButton } from './WithdrawActionButton';
import { WithdrawNumericKeypad } from './WithdrawNumericKeypad';

interface WithdrawPageProps {
    targetVault: Vault;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({ targetVault }) => {
    const { isConnected, address } = useAccount();
    const inputAmount = useAtomValue(withdrawInputAtom);
    const setInputAmount = useSetAtom(withdrawInputAtom);
    const router = useRouter();
    const currency = useAtomValue(currencyAtom);

    const { aprData, isLoadingApr, isErrorApr } = useVaultAprs();
    const { assetsFormatted, isLoading: isLoadingVaultBalance } = useVaultBalance(
        targetVault.vaultAddress,
        targetVault.symbol
    );
    const { data: pricesData, isLoading: isLoadingPrices } = useCoinPrices(currency);
    const vaultBalanceFormatted = assetsFormatted || '0.00';
    const tokenSymbol = targetVault.underlyingToken.symbol;

    // Calculate token price
    const tokenPrice = useMemo(() => {
        if (!pricesData) return 0;
        return getPrice(tokenSymbol, pricesData, currency);
    }, [pricesData, tokenSymbol, currency]);

    // Calculate value of assets supplied to vault
    const suppliedValue = useMemo(() => {
        if (!assetsFormatted || assetsFormatted === '0.00' || !tokenPrice) return '0.00';
        const value = parseFloat(assetsFormatted) * tokenPrice;
        return value.toFixed(2);
    }, [assetsFormatted, tokenPrice]);

    // Calculate value of input amount
    const inputAmountValue = useMemo(() => {
        if (!inputAmount || inputAmount === '0.00' || !tokenPrice) return '0.00';
        const value = parseFloat(inputAmount) * tokenPrice;
        return value.toFixed(2);
    }, [inputAmount, tokenPrice]);

    // Check if input exceeds balance
    const exceedsBalance = useMemo(() => {
        const inNum = Number(inputAmount || 0);
        const balNum = Number(vaultBalanceFormatted || 0);
        if (isNaN(inNum) || isNaN(balNum)) return false;
        return inNum > balNum;
    }, [inputAmount, vaultBalanceFormatted]);

    const formatAPR = () => {
        if (!aprData || !aprData[targetVault.symbol]) return '0.00';
        return formatApr(aprData[targetVault.symbol]);
    };

    const aprValue = formatAPR();

    // Combine all loading states
    const isLoading = isLoadingApr || isLoadingVaultBalance || isLoadingPrices;

    // Early return with skeleton if any data is loading
    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-black">
                <header className="p-4 h-16 flex justify-between items-center bg-black">
                    <button onClick={() => router.back()}>
                        <LeftArrowIcon className="text-white w-7 h-7" />
                    </button>
                    <div className="flex items-center gap-x-1">
                        <div className="w-8 h-4 bg-surfaces-on-surface/20 rounded animate-pulse"></div>
                        <div className="w-12 h-4 bg-surfaces-on-surface/20 rounded animate-pulse"></div>
                    </div>
                </header>
                <main className="flex-1 px-4 flex flex-col overflow-auto leading-none">
                    <div className="flex flex-col gap-y-8">
                        <div className="flex flex-col gap-y-7">
                            <div className="flex flex-col gap-y-[6px]">
                                <div className="w-32 h-6 bg-surfaces-on-surface/20 rounded animate-pulse"></div>
                                <div className="w-48 h-4 bg-surfaces-on-surface/10 rounded animate-pulse"></div>
                            </div>
                            <div className="flex flex-col gap-y-[6px]">
                                <div className="w-24 h-6 bg-surfaces-on-surface/20 rounded animate-pulse"></div>
                                <div className="w-40 h-4 bg-surfaces-on-surface/10 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                            <div className="w-32 h-12 bg-surfaces-on-surface/20 rounded animate-pulse"></div>
                            <div className="w-20 h-8 bg-surfaces-on-surface/10 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="w-40 h-8 bg-surfaces-on-surface/20 rounded animate-pulse mt-4"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-black ">

            <header className="p-4 h-16 flex justify-between items-center bg-black">
                <button onClick={() => router.back()}>
                    <LeftArrowIcon className="text-white w-7 h-7" />
                </button>
                <div className="flex items-center gap-x-1">
                    <span className="text-surfaces-on-3 font-medium">
                        APY
                    </span>
                    <span className="font-medium text-white">
                        {aprValue}%
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 flex flex-col overflow-auto leading-none">

                <div className='flex flex-col gap-y-8'>
                    <div className='flex flex-col gap-y-7'>
                        <div className="flex flex-col gap-y-[6px] text-xl text-surfaces-on-6">
                            <div className="flex items-center gap-x-3">
                                <span>Withdraw</span>
                                <span className="flex items-center gap-x-2">
                                    <Image
                                        src={getTokenImage(targetVault.symbol)}
                                        alt={targetVault.symbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span className="mr-1 text-white">{targetVault.symbol}</span>
                                </span>
                            </div>
                            <p className='text-sm text-surfaces-on-3'>
                                My Supplied:
                                <span className="text-surfaces-on-8">{isConnected ? vaultBalanceFormatted : '--'} {targetVault.symbol}</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-y-[6px]">
                            <div className="flex text-xl items-center gap-x-3 text-surfaces-on-6">
                                <span>To</span>
                                <span className="flex items-center gap-x-2">
                                    <Image
                                        src={getTokenImage(tokenSymbol)}
                                        alt={tokenSymbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span className="mr-1 text-white">{tokenSymbol}</span>
                                </span>
                            </div>
                            <p className='text-sm text-surfaces-on-3'>
                                Wallet Balance: <span className="mx-1 text-surfaces-on-8">${suppliedValue} </span> {assetsFormatted} {targetVault.symbol}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                        <div className="text-[40px] font-medium text-white">
                            {inputAmount || '0.00'}
                        </div>
                        <div className="text-[28px] text-surfaces-on-surface/[40%]">
                            ~${inputAmountValue}
                        </div>
                    </div>
                    {exceedsBalance && (
                        <div className="text-xs text-red-500 -mt-1">
                            Input amount exceeds vault balance.
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setInputAmount(vaultBalanceFormatted)}
                    className="text-xs bg-[#ECEFEC1F] text-gray-300 w-fit p-[6px] rounded-md self-start hover:bg-gray-600 transition"
                >
                    Use Balance {vaultBalanceFormatted} {targetVault.symbol}
                </button>

                <div className="flex-1" />

            </main>
            <WithdrawActionButton vault={targetVault} maxAmount={vaultBalanceFormatted} />

            <WithdrawNumericKeypad decimals={targetVault.underlyingToken.decimals} />
        </div>
    );
};

