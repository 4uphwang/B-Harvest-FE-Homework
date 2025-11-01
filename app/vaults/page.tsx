// app/vaults/page.tsx
'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { useTotalSupplyValue } from 'lib/hooks/useTotalSupplyValue';
import { useUserSummary } from 'lib/hooks/useUserSummary';
import { currencySymbolAtom } from 'lib/state/currency';
import { userSummaryRefetchAtom } from 'lib/state/userSummaryRefetch';
import { formatCompactCurrency } from 'lib/utils/wallet';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import RightIcon from 'assets/icons/RightArrow.svg';
import { EarnHeader } from 'components/layout/EarnHeader';
import { UserSummaryCard } from 'components/vaults/UserSummaryCard';
import VaultListContainer from 'components/vaults/VaultListContainer';
import Link from 'next/link';

export default function VaultListPage() {
    const [isMounted, setIsMounted] = useState(false);
    const { isConnected } = useAccount();
    const currencySymbol = useAtomValue(currencySymbolAtom);
    const { totalValue, perVault, refetch } = useUserSummary();
    const { totalSupplyValue, isLoading: isLoadingSupply, isError: isErrorSupply } = useTotalSupplyValue();
    const setUserSummaryRefetch = useSetAtom(userSummaryRefetchAtom);

    // 클라이언트 마운트 확인 (Hydration 에러 방지)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 서버 렌더링 시 안전한 기본값 사용 (Hydration 에러 방지)
    const myVaultsCount = isMounted ? perVault.filter(v => v.assets > 0n).length : 0;

    // refetch 함수를 전역 atom에 등록
    useEffect(() => {
        if (refetch) {
            setUserSummaryRefetch(() => refetch);
        }
        return () => {
            setUserSummaryRefetch(null);
        };
    }, [refetch, setUserSummaryRefetch]);

    return (
        <div>
            <EarnHeader />
            <div className="flex flex-col gap-10 px-4">

                <div className='flex flex-col'>
                    <div className="py-2 h-14 flex justify-between items-center">
                        <h1 className="text-[32px] text-surfaces-on-background font-medium">Vault</h1>

                        <div className='flex py-2 px-5 rounded-full border border-darker gap-x-[6px] h-fit'>
                            <span className='text-xs text-surfaces-on-3 leading-none h-fit'>
                                Total Supply
                            </span>
                            {isLoadingSupply ? (
                                <div className='w-16 h-4 bg-surfaces-on-surface/20 rounded animate-pulse'></div>
                            ) : isErrorSupply ? (
                                <span className='text-sm text-red-500 font-medium leading-none h-fit'>Error</span>
                            ) : (
                                <span className='text-sm text-surfaces-on-surface font-medium leading-none h-fit'>
                                    {formatCompactCurrency(currencySymbol, totalSupplyValue || 0, 2)}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-surfaces-on-4 text-sm font-normal">
                        Supply your tokens into a secure Vault to effortlessly earn optimized yield
                    </p>
                </div>

                <div className="flex flex-col gap-y-4 ">

                    <Link href="/vaults/my" className='flex items-center'>
                        <div className='flex items-center gap-x-1'>
                            <h2 className='text-surfaces-on-surface text-lg font-medium'>View My Vaults</h2>
                            <span className='text-md text-surfaces-on-3'>
                                {isMounted ? `(${myVaultsCount})` : '(0)'}
                            </span>
                        </div>
                        <RightIcon width={18} height={18} className="text-surfaces-on-surface" />
                    </Link>
                    <UserSummaryCard isConnected={isMounted ? isConnected : false} />
                </div>

                {/* 3. All Vaults List */}
                <VaultListContainer />
            </div>
        </div>
    );
}
