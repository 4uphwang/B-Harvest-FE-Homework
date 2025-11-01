"use client";

import { SearchIcon } from "assets";
import { SkeletonCard } from "components/ui/Skeleton";
import { useAtomValue } from "jotai";
import { VAULT_LIST } from "lib/config/vaults";
import { useCoinPrices } from "lib/hooks/useCoinPrices";
import { useVaultAssets } from "lib/hooks/useValueAssets";
import { useVaultAprs } from "lib/hooks/useVaultAprs";
import { currencyAtom, currencySymbolAtom } from "lib/state/currency";
import { formatApr, formatCurrency } from "lib/utils/wallet";
import { useMemo, useState } from "react";
import { VaultCard } from "./VaultCard";

export default function VaultListContainer() {
    const { aprData, isLoadingApr, isErrorApr } = useVaultAprs();
    const { assetAmounts, isLoadingAssets, isErrorAssets, refetch: refetchAssets } = useVaultAssets();
    const currency = useAtomValue(currencyAtom);
    const { data: pricesData, isLoading: isLoadingPrices, isError: isErrorPrices, refetch: refetchPrices } = useCoinPrices(currency);
    const [searchQuery, setSearchQuery] = useState("");
    const currencySymbol = useAtomValue(currencySymbolAtom);

    // Filtered vault list by search query
    const filteredVaults = useMemo(() => {
        if (!searchQuery) return VAULT_LIST;

        const query = searchQuery.toLowerCase();
        return VAULT_LIST.filter(vault =>
            vault.symbol.toLowerCase().includes(query) ||
            vault.name.toLowerCase().includes(query) ||
            vault.underlyingToken.symbol.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const isError = isErrorApr || isErrorAssets || isErrorPrices;

    const formatVaultAPR = (vaultSymbol: string) => {
        if (!aprData || !aprData[vaultSymbol]) return "0.00";
        return formatApr(aprData[vaultSymbol]);
    };

    const handleRefetch = () => {
        refetchPrices();
        refetchAssets();
    };

    // Check if vault data is ready (individual check)
    const isVaultDataReady = (vault: typeof VAULT_LIST[0]) => {
        const hasApr = aprData && aprData[vault.symbol] !== undefined;
        const hasAssets = assetAmounts && assetAmounts[vault.symbol] !== undefined;
        const hasPrices = !!pricesData;
        return hasApr && hasAssets && hasPrices;
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
                {isError ? (
                    // Error state
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <p className="text-red-300 mb-2 text-sm font-medium">Failed to load data</p>
                        <p className="text-red-400/70 text-xs mb-3">Network or server error occurred. Please try again later.</p>
                        <button
                            onClick={handleRefetch}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredVaults.length === 0 ? (
                    <div className="text-center py-8 text-surfaces-on-4">
                        No vaults found
                    </div>
                ) : (
                    filteredVaults.map((vault) => {
                        // Show skeleton if this vault's data is not ready yet
                        if (!isVaultDataReady(vault)) {
                            return <SkeletonCard key={vault.symbol} />;
                        }

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