'use client';

import { LeftArrowIcon } from 'assets';
import { EarnHeader } from 'components/layout/EarnHeader';
import { UserSummaryCard } from 'components/vaults/UserSummaryCard';
import MyVaultListContainer from 'components/vaults/MyVaultListContainer';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function MyVaultsPage() {
    const router = useRouter();
    const { isConnected } = useAccount();

    return (
        <div>
            <EarnHeader />
            <div className="flex flex-col gap-5 px-4">
                <div className='flex items-center gap-x-3'>
                    <button onClick={() => router.back()}>
                        <LeftArrowIcon className="text-white w-7 h-7" />
                    </button>
                    <h1 className="text-[32px] text-surfaces-on-background font-medium">My Vaults</h1>
                </div>

                <UserSummaryCard isConnected={isConnected} />

                <MyVaultListContainer />
            </div>
        </div>
    );
}

