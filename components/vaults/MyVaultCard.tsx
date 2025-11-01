// components/vaults/MyVaultCard.tsx
'use client';

import { AprIcon } from 'assets';
import { Vault } from 'lib/config/vaults';
import { getTokenImage } from 'lib/utils/tokenImage';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface MyVaultCardProps {
    vault: Vault;
    suppliedAmount: string;
    suppliedValue: string;
    aprValue: string;
    currencySymbol: string;
}

export const MyVaultCard: React.FC<MyVaultCardProps> = ({
    vault,
    suppliedAmount,
    suppliedValue,
    aprValue,
    currencySymbol
}) => {

    const isUsdt = vault.symbol.includes('USDT');

    return (
        <Link
            href={`/vaults/${vault.symbol}?action=withdraw`}
            className="flex items-center justify-between py-[6px] rounded-xl font-medium "
        >
            {/* Left: Token info */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Image
                        src={getTokenImage(vault.symbol)}
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
                        {currencySymbol}{suppliedValue}
                    </span>
                </div>
            </div>

            {/* Right: APY */}
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

