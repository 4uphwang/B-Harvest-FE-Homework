'use client';

import { EarnIcon, HomeIcon, MarketIcon, PointIcon, PortfolioIcon } from 'assets';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, SVGProps, useMemo } from 'react';


interface NavItem {
    name: string;
    href: string;
    icon: FC<SVGProps<SVGElement>>;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Market', href: '/market', icon: MarketIcon },
    { name: 'Earn', href: '/vaults', icon: EarnIcon },
    { name: 'Portfolio', href: '/portfolio', icon: PortfolioIcon },
    { name: 'Points', href: '/points', icon: PointIcon },
];

const EXCLUDED_PATHS = [
    /^\/vaults\/[^/]+$/
];

export const BottomNav = () => {
    const pathname = usePathname();

    const isHidden = useMemo(() => {
        return EXCLUDED_PATHS.some(pattern => pattern.test(pathname));
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === '/vaults' && pathname.startsWith('/vaults')) {
            return true;
        }
        return pathname === href;
    };

    if (isHidden) {
        return null;
    }

    const iconSize = (tabName: string) => tabName === 'Earn' ? 28 : 24;
    return (
        <nav className=" h-[50px] bg-black border-t border-gray-800 z-10 shadow-lg">
            <div className="flex justify-around h-full items-start max-w-lg mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const IconComponent = item.icon;
                    const size = iconSize(item.name);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-end h-full w-1/5 transition-all `}
                        >
                            <div className={`
                                flex items-center justify-center relative flex-shrink-0
                                ${item.name === 'Earn' && 'w-10 h-10 rounded-full bg-primary-base shadow-lg z-30'} 
                            `}>
                                <IconComponent
                                    width={size}
                                    height={size}
                                    className={`${active ? (item.name === 'Earn' ? 'text-primary-on-base' : 'text-white') : 'text-surfaces-on-4'} `}
                                />
                            </div>

                            <span
                                className={`
                                    text-xs font-medium mb-2 leading-none  mt-[2px]
                                    ${active ? 'text-primary-base ' : 'text-surfaces-on-4'} 
                                `}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
