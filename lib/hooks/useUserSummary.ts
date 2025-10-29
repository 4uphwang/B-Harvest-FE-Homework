'use client';

import { useAtomValue } from 'jotai';
import { VAULT_ABI } from 'lib/config/abi';
import { VAULT_LIST, Vault } from 'lib/config/vaults';
import { useCoinPrices } from 'lib/hooks/useCoinPrices';
import { useVaultAprs } from 'lib/hooks/useVaultAprs';
import { currencyAtom } from 'lib/state/currency';
import { getPrice } from 'lib/utils/wallet';
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
    const { aprData } = useVaultAprs();
    const { data: prices } = useCoinPrices(currency);

    // 1) balanceOf for all vaults
    const { data: balancesResult } = useReadContracts({
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

    // 2) convertToAssets for all non-zero shares
    const { data: assetsResult } = useReadContracts({
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
        const apr = aprRaw ? Number(aprRaw) : 0; // 이미 퍼센트 스케일이라고 가정 (필요시 스케일 변환 추가)

        return { vault, shares, assets, assetsFormatted, value, apr };
    });

    const totalValue = perVault.reduce((sum, v) => sum + (isFinite(v.value) ? v.value : 0), 0);

    // 가중 평균 APY = sum(value_i * apr_i) / sum(value_i)
    const weightedApr = (() => {
        const numerator = perVault.reduce((sum, v) => sum + (v.value || 0) * (v.apr || 0), 0);
        if (totalValue <= 0) return 0;
        return numerator / totalValue;
    })();

    return {
        isConnected,
        perVault,
        totalValue,
        totalApr: weightedApr,
    };
}


