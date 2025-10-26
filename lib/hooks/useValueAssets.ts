// lib/hooks/useVaultAssets.ts
'use client';

import { useReadContracts, UseReadContractsReturnType } from 'wagmi';

import { VAULT_ABI } from 'lib/abi';
import { VAULT_LIST } from 'lib/config/vaults';
import { VaultAssetAmounts } from 'lib/types/common';

const vaultAssetContracts = VAULT_LIST.map((vault) => ({
    address: vault.vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'totalAssets' as const,
}));

/**
 * 모든 Vault의 totalAssets() 값을 조회하는 훅 (TVL 수량)
 * @returns {assetAmounts: VaultAssetAmounts | undefined, isLoadingAssets: boolean, ...}
 */
export function useVaultAssets() {
    const result = useReadContracts({
        contracts: vaultAssetContracts,
        query: {
            staleTime: 1000 * 60 * 1, // 1분 동안 데이터 유지
            refetchInterval: 1000 * 60 * 5, // 5분마다 백그라운드 업데이트
        }
    });

    const processedData: VaultAssetAmounts | undefined = (
        result.data as UseReadContractsReturnType['data']
    )?.reduce((acc, current, index) => {
        const symbol = VAULT_LIST[index].symbol;

        if (current.status === 'success' && typeof current.result === 'bigint') {
            acc[symbol] = current.result;
        } else {
            acc[symbol] = 0n;
        }

        return acc;
    }, {} as Record<string, bigint>);

    return {
        ...result,
        assetAmounts: processedData,
        isLoadingAssets: result.isLoading,
        isErrorAssets: result.isError,
    };
}