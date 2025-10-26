'use client';

import { VAULT_ABI } from 'lib/abi';
import { VAULT_LIST } from 'lib/config/vaults';
import { useReadContracts } from 'wagmi';

/**
 * 모든 Vault의 심볼을 키로, BigInt 타입의 APR 값을 값으로 가지는 맵
 * APR 값은 컨트랙트에서 반환되는 스케일링된 값입니다 (예: 10^18)
 */
export type VaultAprs = Record<string, bigint>;

// useReadContracts에 필요한 계약 호출 정보 배열 생성
const vaultAprContracts = VAULT_LIST.map((vault) => ({
    address: vault.vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getAPR' as const,
}));



/**
 * 모든 Vault의 getAPR() 값을 조회하는 훅
 * @returns {aprData: VaultAprs | undefined, isLoadingApr: boolean, ...}
 */
export function useVaultAprs() {
    const result = useReadContracts({ contracts: vaultAprContracts });

    const processedData: VaultAprs | undefined = result.data?.reduce((acc, current, index) => {
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
        aprData: processedData,

        isLoadingApr: result.isLoading,
        isErrorApr: result.isError,
    };
}