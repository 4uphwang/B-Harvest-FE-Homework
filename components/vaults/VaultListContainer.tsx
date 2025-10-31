"use client";

import { SearchIcon } from "assets";
import { SkeletonCard } from "components/ui/Skeleton";
import { useAtomValue } from "jotai";
import { VAULT_LIST } from "lib/config/vaults";
import { useVaultAssets } from "lib/hooks/useValueAssets";
import { useVaultAprs } from "lib/hooks/useVaultAprs";
import { currencySymbolAtom } from "lib/state/currency";
import { formatApr, formatCurrency } from "lib/utils/wallet";
import { useMemo, useState } from "react";
import { VaultCard } from "./VaultCard";

export default function VaultListContainer() {
    const { aprData, isLoadingApr } = useVaultAprs();
    const { assetAmounts, isLoadingAssets } = useVaultAssets();
    const [searchQuery, setSearchQuery] = useState("");
    const currencySymbol = useAtomValue(currencySymbolAtom);

    // 검색 필터링된 vault 목록
    const filteredVaults = useMemo(() => {
        if (!searchQuery) return VAULT_LIST;

        const query = searchQuery.toLowerCase();
        return VAULT_LIST.filter(vault =>
            vault.symbol.toLowerCase().includes(query) ||
            vault.name.toLowerCase().includes(query) ||
            vault.underlyingToken.symbol.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const isLoading = isLoadingApr || isLoadingAssets;


    const formatVaultAPR = (vaultSymbol: string) => {
        if (!aprData || !aprData[vaultSymbol]) return "0.00";
        return formatApr(aprData[vaultSymbol]);
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-lg font-medium text-surfaces-on-surface">All Vaults</h2>

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
                <div className="text-sm text-surfaces-on-3">APY</div>
            </div>

            {/* Vault List */}
            <div className="flex flex-col gap-2 pb-[20vh]">
                {isLoading ? (
                    // Loading skeleton
                    <>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </>
                ) : filteredVaults.length === 0 ? (
                    <div className="text-center py-8 text-surfaces-on-4">
                        No vaults found
                    </div>
                ) : (
                    filteredVaults.map((vault) => {
                        const rawAmount = assetAmounts?.[vault.symbol];
                        const displayAmount = formatCurrency(rawAmount, 2);
                        const aprValue = formatVaultAPR(vault.symbol);

                        return (
                            <VaultCard
                                key={vault.symbol}
                                vault={vault}
                                tvlValue={displayAmount}
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