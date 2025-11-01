'use client';

import { useAtomValue } from 'jotai';
import { VAULT_ABI } from 'lib/config/abi';
import { VAULT_LIST, Vault } from 'lib/config/vaults';
import { useCoinPrices } from 'lib/hooks/useCoinPrices';
import { useVaultAprs } from 'lib/hooks/useVaultAprs';
import { currencyAtom } from 'lib/state/currency';
import { formatApr, getPrice } from 'lib/utils/wallet';
import { formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

type PerVaultSupply = {
    vault: Vault;
    shares: bigint;
    assets: bigint;
    assetsFormatted: string;
    value: number;
    apr: number;
};

export function useUserSummary() {
    const { address, isConnected } = useAccount();
    const currency = useAtomValue(currencyAtom);
    const { aprData, isLoadingApr } = useVaultAprs();
    const { data: prices, isLoading: isLoadingPrices } = useCoinPrices(currency);

    const { data: balancesResult, isLoading: isLoadingBalances, refetch: refetchBalances } = useReadContracts({
        contracts: isConnected && address ? VAULT_LIST.map((vault) => ({
            address: vault.vaultAddress,
            abi: VAULT_ABI,
            functionName: 'balanceOf' as const,
            args: [address],
        })) : [],
        query: {
            enabled: isConnected && !!address,
            staleTime: 1000 * 30, // 30초 동안 데이터 유지 (사용자 잔고는 자주 변할 수 있음)
            refetchInterval: 1000 * 60 * 2, // 2분마다 백그라운드 업데이트
        },
    });

    const sharesArray: bigint[] = (balancesResult || []).map((r) => (
        r?.status === 'success' && typeof r.result === 'bigint' ? r.result : 0n
    ));

    const { data: assetsResult, isLoading: isLoadingAssets, refetch: refetchAssets } = useReadContracts({
        contracts: isConnected && address ? VAULT_LIST.map((vault, idx) => ({
            address: vault.vaultAddress,
            abi: VAULT_ABI,
            functionName: 'convertToAssets' as const,
            args: [sharesArray[idx] || 0n],
        })) : [],
        query: {
            enabled: isConnected && !!address && sharesArray.length === VAULT_LIST.length,
            staleTime: 1000 * 30, // 30초 동안 데이터 유지
            refetchInterval: 1000 * 60 * 2, // 2분마다 백그라운드 업데이트
        },
    });

    const perVault: PerVaultSupply[] = VAULT_LIST.map((vault, idx) => {
        const shares = sharesArray[idx] || 0n;
        const assets = assetsResult?.[idx]?.status === 'success' && typeof assetsResult[idx].result === 'bigint'
            ? assetsResult[idx].result
            : 0n;
        const assetsFormatted = assets > 0n ? formatUnits(assets, vault.underlyingToken.decimals) : '0.00';
        const price = getPrice(vault.underlyingToken.symbol, prices, currency) || 0;
        const value = parseFloat(assetsFormatted || '0') * price;
        const aprRaw = aprData?.[vault.symbol];
        const apr = aprRaw ? Number(formatApr(aprRaw)) : 0;

        return { vault, shares, assets, assetsFormatted, value, apr };
    });

    const totalValue = perVault.reduce((sum, v) => sum + (isFinite(v.value) ? v.value : 0), 0);

    const weightedApr = (() => {
        const numerator = perVault.reduce((sum, v) => sum + (v.value || 0) * (v.apr || 0), 0);
        if (totalValue <= 0) return 0;
        return numerator / totalValue;
    })();

    const isLoading = (isConnected && (isLoadingBalances || isLoadingAssets)) || isLoadingApr || isLoadingPrices;

    // Refetch 함수: 사용자 vault 잔액을 다시 조회
    const refetch = async () => {
        // balances를 먼저 refetch하고, 그 다음 assets를 refetch
        await refetchBalances();
        // sharesArray가 업데이트되면 assets도 자동으로 refetch될 수 있지만,
        // 명시적으로 호출하여 확실히 업데이트
        await refetchAssets();
    };

    return {
        isConnected,
        perVault,
        totalValue,
        totalApr: weightedApr,
        isLoading,
        refetch,
    };
}


