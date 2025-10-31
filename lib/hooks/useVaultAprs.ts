'use client';

import { VAULT_ABI } from 'lib/config/abi';
import { VAULT_LIST } from 'lib/config/vaults';
import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';

export type VaultAprs = Record<string, bigint>;
/**
 * 모든 Vault의 getAPR() 값을 조회하는 훅
 * @returns {aprData: VaultAprs | undefined, isLoadingApr: boolean, ...}
 */
export function useVaultAprs() {
    const contracts = useMemo(() =>
        VAULT_LIST.map((vault) => ({
            address: vault.vaultAddress as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'getAPR' as const,
        })), []
    );

    const result = useReadContracts({
        contracts,
        query: {
            staleTime: 1000 * 60 * 5,
            refetchInterval: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        }
    });

    const processedData: VaultAprs | undefined = result.data?.reduce((acc, current, index) => {
        const vault = VAULT_LIST[index];
        if (!vault) return acc; // 안전성 체크 추가

        const symbol = vault.symbol;
        if (current.status === 'success' && typeof current.result === 'bigint') {
            acc[symbol] = current.result;
        } else {
            acc[symbol] = 0n;
            if (current.status === 'failure') {
                console.warn(`Failed to fetch APR for ${symbol} (${vault.vaultAddress}):`, current.error);
            }
        }
        return acc;
    }, {} as Record<string, bigint>);
    return {
        ...result,
        aprData: processedData,

        isLoadingApr: result.isLoading,
        isErrorApr: result.isError,
    };
}