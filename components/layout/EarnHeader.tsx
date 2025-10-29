'use client';

import { DownArrowIcon, HeaderLogoImage, MenuIcon, ReloadIcon } from 'assets';
import { truncateAddress } from 'lib/utils/wallet';
import Image from 'next/image';
import { useAccount } from 'wagmi';

export const EarnHeader = () => {
    const { address } = useAccount();
    const headerStyle = {
        backgroundImage: 'linear-gradient(180deg, #000000 90%, rgba(0, 0, 0, 0) 100%)',
    };

    return (
        <header
            style={headerStyle}
            className="flex justify-between items-center h-16 px-4 sticky top-0"
        >
            <div className="flex items-center">
                <Image
                    src={HeaderLogoImage}
                    alt="Affluent Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                />
            </div>

            <div className="flex items-center space-x-[6px]">

                {/* 1. 새로고침/재시도 버튼 */}
                <button
                    type="button"
                    aria-label="Reload data"
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                >
                    <ReloadIcon className='w-6 h-6 text-primary-base' />
                </button>

                {/* 2. 주소/지갑 상태 버튼 */}
                <div className="flex items-center h-8 rounded-full bg-surfaces-on-surface/[12%] px-[6px] gap-x-[5px] cursor-pointer">


                    {address
                        ? <>
                            <span className={`text-sm font-medium text-surfaces-on-6 overflow-hidden whitespace-nowrap px-[5px]`} >
                                {truncateAddress(address, 5, 3)}
                            </span>
                            <DownArrowIcon className={`w-[14px] h-[14px] text-surfaces-on-6`} />
                        </>
                        : <span className={`text-sm font-medium text-surfaces-on-surface `} >
                            Connect Wallet
                        </span>
                    }
                </div>

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
