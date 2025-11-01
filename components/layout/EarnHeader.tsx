'use client';

import { HeaderLogoImage, MenuIcon, ReloadIcon } from 'assets';
import { ConnectWallet } from 'components/wallet/ConnectWallet';
import Image from 'next/image';
import Link from 'next/link';

export const EarnHeader = () => {
    const headerStyle = {
        backgroundImage: 'linear-gradient(180deg, #000000 90%, rgba(0, 0, 0, 0) 100%)',
    };

    return (
        <header
            style={headerStyle}
            className="flex justify-between items-center h-16 px-4 sticky top-0"
        >
            <Link href={"/vaults"} className="flex items-center">
                <Image
                    src={HeaderLogoImage}
                    alt="Affluent Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                />
            </Link>

            <div className="flex items-center space-x-[6px] relative">

                {/* 1. 새로고침/재시도 버튼 */}
                <button
                    type="button"
                    aria-label="Reload data"
                    onClick={() => { window.location.reload() }}
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                >
                    <ReloadIcon className='w-6 h-6 text-primary-base' />
                </button>

                {/* 2. 주소/지갑 상태 버튼 */}
                <ConnectWallet />

                {/* 3. 메뉴 버튼 */}
                <button
                    type="button"
                    aria-label="Open menu"
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                >
                    <MenuIcon className='w-6 h-6 text-surfaces-on-surface' />
                </button>

            </div>
        </header >
    );
};
