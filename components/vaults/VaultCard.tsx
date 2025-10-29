// components/vaults/VaultCard.tsx
'use client';

import { AprIcon, BtcImage, UsdcImage, UsdtImage } from 'assets';
import { Vault } from 'lib/config/vaults';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface VaultCardProps {
    vault: Vault;
    tvlValue: string;
    aprValue: string;
    currencySymbol: string;
}

export const VaultCard: React.FC<VaultCardProps> = ({
    vault,
    tvlValue,
    aprValue,
    currencySymbol
}) => {

    // 토큰별 이미지 반환
    const getTokenImage = () => {
        if (vault.symbol.includes('BTC')) return BtcImage;
        if (vault.symbol.includes('USDT')) return UsdtImage;
        if (vault.symbol.includes('USDC')) return UsdcImage;
        return BtcImage;
    };

    const isUsdt = vault.symbol.includes('USDT');

    return (
        <Link
            href={`/vaults/${vault.symbol}`}
            className="flex items-center justify-between py-[6px] rounded-xl font-medium "
        >
            {/* 왼쪽: 토큰 정보 */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Image
                        src={getTokenImage()}
                        alt={vault.symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                    />
                </div>
                <div className="flex flex-col ">
                    <div className="flex items-center gap-1 ">
                        <span className="text-md text-white">
                            {vault.symbol}
                        </span>
                        <span className='text-surfaces-on-5 '>Vault</span>
                    </div>
                    <span className="text-xs text-surfaces-on-2">
                        {currencySymbol}{tvlValue}
                    </span>
                </div>
            </div>

            {/* 오른쪽: APY */}
            <div className="text-right flex items-center">
                <span className={`text-lg font leading-none  ${isUsdt ? 'text-id-ap' : 'text-white'}`}>
                    {aprValue}%
                </span>
                {isUsdt && (
                    <AprIcon className="w-4 h-4 text-id-ap" />
                )}
            </div>
        </Link>
    );
};
