"use client";

import { SearchIcon } from "assets";
import { SkeletonCard } from "components/ui/Skeleton";
import { useAtomValue } from "jotai";
import { useCoinPrices } from "lib/hooks/useCoinPrices";
import { useUserSummary } from "lib/hooks/useUserSummary";
import { useVaultAprs } from "lib/hooks/useVaultAprs";
import { currencyAtom, currencySymbolAtom } from "lib/state/currency";
import { formatApr, getPrice } from "lib/utils/wallet";
import { useMemo, useState } from "react";
import { MyVaultCard } from "./MyVaultCard";

export default function MyVaultListContainer() {
    const { aprData, isLoadingApr } = useVaultAprs();
    const { perVault } = useUserSummary();
    const [searchQuery, setSearchQuery] = useState("");
    const currencySymbol = useAtomValue(currencySymbolAtom);
    const currency = useAtomValue(currencyAtom);
    const { data: pricesData, isLoading: isLoadingPrices } = useCoinPrices(currency);

    // 공급한 Vault만 필터링 (assets > 0)
    const suppliedVaults = useMemo(() => {
        return perVault.filter(v => v.assets > 0n);
    }, [perVault]);

    // 검색 필터링된 vault 목록
    const filteredVaults = useMemo(() => {
        if (!searchQuery) return suppliedVaults;

        const query = searchQuery.toLowerCase();
        return suppliedVaults.filter(vault =>
            vault.vault.symbol.toLowerCase().includes(query) ||
            vault.vault.name.toLowerCase().includes(query) ||
            vault.vault.underlyingToken.symbol.toLowerCase().includes(query)
        );
    }, [searchQuery, suppliedVaults]);

    const formatVaultAPR = (vaultSymbol: string) => {
        if (!aprData || !aprData[vaultSymbol]) return "0.00";
        return formatApr(aprData[vaultSymbol]);
    };

    if (isLoadingApr || isLoadingPrices) {
        return (
            <div className="flex flex-col gap-2 pb-[20vh]">
                {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        );
    }

    if (suppliedVaults.length === 0) {
        return (
            <div className="text-center py-8 text-surfaces-on-4">
                No vaults supplied yet
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-lg font-medium text-surfaces-on-surface">My Supplied Vaults</h2>

            {/* Search Input */}
            <div className='bg-surfaces-on-surface/[12%] h-10 w-full rounded-full flex p-3 gap-x-[6px] group focus-within:ring-1 focus-within:ring-white'>
                <SearchIcon width={18} height={18} className="text-surfaces-on-3" />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder:text-surfaces-on-surface/[40%] focus:border-none focus:outline-none focus:cursor-white caret-white"
                />
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-surfaces-on-3">Vault</div>
                <div className="text-sm text-surfaces-on-3">My Supply</div>
            </div>

            {/* Vault List */}
            <div className="flex flex-col gap-2 pb-[20vh]">
                {filteredVaults.length === 0 ? (
                    <div className="text-center py-8 text-surfaces-on-4">
                        No vaults found
                    </div>
                ) : (
                    filteredVaults.map((vaultData) => {
                        const aprValue = formatVaultAPR(vaultData.vault.symbol);
                        const tokenPrice = pricesData ? getPrice(vaultData.vault.underlyingToken.symbol, pricesData, currency) || 0 : 0;
                        const value = parseFloat(vaultData.assetsFormatted || '0') * tokenPrice;

                        return (
                            <MyVaultCard
                                key={vaultData.vault.symbol}
                                vault={vaultData.vault}
                                suppliedAmount={vaultData.assetsFormatted}
                                suppliedValue={value.toFixed(2)}
                                aprValue={aprValue}
                                currencySymbol={currencySymbol}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

