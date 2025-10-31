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
    const { data: pricesData } = useCoinPrices(currency);
    const vaultBalanceFormatted = assetsFormatted || '0.00';
    const tokenSymbol = targetVault.underlyingToken.symbol;

    // 토큰 가격 계산
    const tokenPrice = useMemo(() => {
        if (!pricesData) return 0;
        return getPrice(tokenSymbol, pricesData, currency);
    }, [pricesData, tokenSymbol, currency]);

    // Vault에 공급한 자산의 가치 계산
    const suppliedValue = useMemo(() => {
        if (!assetsFormatted || assetsFormatted === '0.00' || !tokenPrice) return '0.00';
        const value = parseFloat(assetsFormatted) * tokenPrice;
        return value.toFixed(2);
    }, [assetsFormatted, tokenPrice]);

    // 입력한 금액의 가치 계산
    const inputAmountValue = useMemo(() => {
        if (!inputAmount || inputAmount === '0.00' || !tokenPrice) return '0.00';
        const value = parseFloat(inputAmount) * tokenPrice;
        return value.toFixed(2);
    }, [inputAmount, tokenPrice]);

    // 잔액 초과 여부 계산
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

    const getAprDisplay = () => {
        if (isLoadingApr) return 'Loading...';
        if (isErrorApr) return 'Error';
        return `${aprValue}%`;
    };

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
                    <span className={`font-medium ${isLoadingApr ? 'text-surfaces-on-3 text-sm' :
                        isErrorApr ? 'text-red-500' :
                            'text-white'
                        }`}>
                        {getAprDisplay()}
                    </span>
                </div>
            </header>

            {/* 본문 Content */}
            <main className="flex-1 px-4 flex flex-col overflow-auto leading-none">

                <div className='flex flex-col gap-y-8'>
                    <div className='flex flex-col gap-y-7'>
                        <div className="flex flex-col gap-y-[6px] text-xl text-surfaces-on-6">
                            <p className="flex items-center gap-x-3">
                                <span>Withdraw</span>
                                <div className="flex items-center gap-x-2">
                                    <Image
                                        src={getTokenImage(targetVault.symbol)}
                                        alt={targetVault.symbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span className="mr-1 text-white">{targetVault.symbol}</span>
                                </div>
                            </p>
                            <p className='text-sm text-surfaces-on-3'>
                                My Supplied:
                                <span className="text-surfaces-on-8">{isConnected ? vaultBalanceFormatted : '--'} {targetVault.symbol}</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-y-[6px]">
                            <p className="flex text-xl items-center gap-x-3 text-surfaces-on-6">
                                <span>To</span>
                                <div className="flex items-center gap-x-2">
                                    <Image
                                        src={getTokenImage(tokenSymbol)}
                                        alt={tokenSymbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span className="mr-1 text-white">{tokenSymbol}</span>
                                </div>
                            </p>
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
                            입력 금액이 Vault 잔액을 초과했습니다.
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

