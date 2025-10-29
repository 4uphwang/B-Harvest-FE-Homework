'use client';

import { formatUnits } from 'viem'; // BigInt 포매팅을 위해 viem 임포트
import { useReadContracts, UseReadContractsReturnType } from 'wagmi';

import { VAULT_ABI } from 'lib/config/abi';
import { decimalsMap } from 'lib/config/tokens';
import { VAULT_LIST } from 'lib/config/vaults';

type VaultFormattedAmounts = Record<string, string>;

const vaultAssetContracts = VAULT_LIST.map((vault) => ({
    address: vault.vaultAddress as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'totalAssets' as const,
}));

/**
 * 모든 Vault의 totalAssets() 값을 조회하고, 각 토큰의 decimals에 맞춰 포매팅합니다.
 * @returns {assetAmounts: Record<string, string> | undefined, isLoadingAssets: boolean, ...}
 */
export function useVaultAssets() {
    const result = useReadContracts({
        contracts: vaultAssetContracts,
        query: {
            staleTime: 1000 * 60 * 2, // 2분 동안 데이터 유지 (totalAssets는 자주 변하지 않음)
            refetchInterval: 1000 * 60 * 10, // 10분마다 백그라운드 업데이트
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
            refetchOnMount: false, // 마운트 시 자동 refetch 비활성화 (캐시된 데이터 사용)
        }
    });

    const processedData: VaultFormattedAmounts | undefined = (
        result.data as UseReadContractsReturnType['data']
    )?.reduce((acc, current, index) => {
        const symbol = VAULT_LIST[index].symbol;
        const decimals = decimalsMap[symbol];

        // ⚠️ decimals 정보가 없거나, 컨트랙트 호출이 실패하면 '0'으로 처리
        if (current.status !== 'success' || typeof current.result !== 'bigint' || !decimals) {
            acc[symbol] = '0';
        } else {
            try {
                // viem의 formatUnits를 사용하여 BigInt를 float 문자열로 포매팅
                acc[symbol] = formatUnits(current.result, decimals);
            } catch (e) {
                console.error(`Error formatting assets for ${symbol}:`, e);
                acc[symbol] = '0';
            }
        }

        return acc;
    }, {} as VaultFormattedAmounts);

    return {
        ...result,
        assetAmounts: processedData,
        isLoadingAssets: result.isLoading,
        isErrorAssets: result.isError,
    };
}