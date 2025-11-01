'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { calculateMaxAmountWithGas } from 'lib/utils/gas';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';

import { Vault } from 'lib/config/vaults';
import { useCoinPrices } from 'lib/hooks/useCoinPrices';
import { useVaultAprs } from 'lib/hooks/useVaultAprs';
import { useVaultBalance } from 'lib/hooks/useVaultBalance';
import { currencyAtom } from 'lib/state/currency';
import { supplyInputAtom } from 'lib/state/supplyInput';

import { LeftArrowIcon } from 'assets';
import { getTokenImage } from 'lib/utils/tokenImage';
import { formatApr, getPrice } from 'lib/utils/wallet';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { DepositActionButton } from './DepositActionButton';
import { NumericKeypad } from './NumericKeypad';

interface SupplyPageProps {
    targetVault: Vault;
}

export const SupplyPage: React.FC<SupplyPageProps> = ({ targetVault }) => {
    const { isConnected, address } = useAccount();
    const inputAmount = useAtomValue(supplyInputAtom);
    const setInputAmount = useSetAtom(supplyInputAtom);
    const router = useRouter();
    const currency = useAtomValue(currencyAtom);
    const [isProcessing, setIsProcessing] = React.useState(false);

    useEffect(() => {
        setInputAmount('0.00');
        return () => {
            setInputAmount('0.00');
        };
    }, [setInputAmount]);

    const { data: balanceData, isLoading: isLoadingWalletBalance } = useBalance({
        address,
        token: targetVault.underlyingToken.address,
        query: { enabled: isConnected, staleTime: 5000 },
    });

    // Get native token (ETH) balance for gas fee calculation
    const { data: nativeBalanceData } = useBalance({
        address,
        query: { enabled: isConnected, staleTime: 5000 },
    });
    const { aprData, isLoadingApr, isErrorApr } = useVaultAprs();
    const { assetsFormatted, isLoading: isLoadingVaultBalance } = useVaultBalance(
        targetVault.vaultAddress,
        targetVault.symbol
    );
    const { data: pricesData, isLoading: isLoadingPrices } = useCoinPrices(currency);

    const walletBalanceFormatted = useMemo(() => {
        if (balanceData && balanceData.value && balanceData.decimals) {
            const formatted = formatUnits(balanceData.value, balanceData.decimals);
            // 소수점 자리수를 6자리로 제한 (비트코인 등 긴 소수점 방지)
            const num = parseFloat(formatted);
            if (isNaN(num) || num === 0) return '0.00';
            // 소수점 이하 불필요한 0 제거
            const fixed = num.toFixed(6);
            const trimmed = fixed.replace(/\.?0+$/, '');
            return trimmed || '0.00';
        }
        return '0.00';
    }, [balanceData]);
    const tokenSymbol = targetVault.underlyingToken.symbol;

    // Calculate token price
    const tokenPrice = useMemo(() => {
        if (!pricesData) return 0;
        return getPrice(tokenSymbol, pricesData, currency);
    }, [pricesData, tokenSymbol, currency]);

    // Calculate value of supplied assets
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
        const balNum = Number(walletBalanceFormatted || 0);
        if (isNaN(inNum) || isNaN(balNum)) return false;
        return inNum > balNum;
    }, [inputAmount, walletBalanceFormatted]);

    const formatAPR = () => {
        if (!aprData || !aprData[targetVault.symbol]) return '0.00';
        return formatApr(aprData[targetVault.symbol]);
    };

    const aprValue = formatAPR();

    // 캐시된 데이터가 하나라도 있으면 스켈레톤 표시하지 않음
    // 모든 데이터가 없고, 모든 로딩이 완료되지 않았을 때만 스켈레톤 표시
    const hasAnyCachedData = aprData || assetsFormatted || pricesData || walletBalanceFormatted !== '0.00';
    const isInitialLoading = !hasAnyCachedData && (isLoadingApr || isLoadingVaultBalance || isLoadingPrices || (isConnected && isLoadingWalletBalance));

    if (isInitialLoading) {
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
                                <span>Supply</span>
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
                                Wallet Balance:
                                <span className="text-surfaces-on-8">{isConnected ? walletBalanceFormatted : '--'} {tokenSymbol}</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-y-[6px]">
                            <div className="flex text-xl items-center gap-x-3 text-surfaces-on-6">
                                <span>To</span>
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
                                My Supplied: <span className="mx-1 text-surfaces-on-8">${suppliedValue} </span> {assetsFormatted} {targetVault.symbol}
                            </p>
                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-[40px] font-medium text-white">
                                {inputAmount || '0.00'}
                            </div>
                            <div className="text-[28px] text-surfaces-on-surface/[40%]">
                                ~${inputAmountValue}
                            </div>
                        </div>
                        {exceedsBalance && (
                            <div className="text-xs text-red-500 mt-[6px]">
                                Input amount exceeds wallet balance.
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => {
                        const maxAmount = calculateMaxAmountWithGas(
                            walletBalanceFormatted,
                            nativeBalanceData?.value,
                            '0.002', // Approve + Deposit gas estimate
                            targetVault.underlyingToken.decimals
                        );
                        setInputAmount(maxAmount);
                    }}
                    className="text-xs bg-[#ECEFEC1F] text-gray-300 w-fit p-[6px] rounded-md self-start hover:bg-gray-600 transition"
                >
                    Use Balance {isConnected ? walletBalanceFormatted : ''} {tokenSymbol}
                </button>

                <div className="flex-1" />

            </main>
            <DepositActionButton
                vault={targetVault}
                maxAmount={walletBalanceFormatted}
                onProcessingChange={setIsProcessing}
            />

            <NumericKeypad
                decimals={targetVault.underlyingToken.decimals}
                disabled={isProcessing}
            />
        </div>
    );
};
