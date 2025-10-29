'use client';

import { VAULT_ABI } from 'lib/config/abi';
import { decimalsMap } from 'lib/config/tokens';
import { formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';


/**
 * 특정 Vault의 사용자 잔액을 조회하는 훅
 * @param vaultAddress Vault 컨트랙트 주소
 * @param vaultSymbol Vault 심볼 (BTC, USDT, USDC 등)
 */
export function useVaultBalance(vaultAddress: `0x${string}` | undefined, vaultSymbol: string) {
    const { address, isConnected } = useAccount();
    const decimals = decimalsMap[vaultSymbol] || 18;

    const { data: balanceOfResult, isLoading: isLoadingBalance, error: balanceError } = useReadContracts({
        contracts: address && vaultAddress ? [
            {
                address: vaultAddress,
                abi: VAULT_ABI,
                functionName: 'balanceOf' as const,
                args: [address] as const,
            },
        ] : [],
        query: { enabled: isConnected && !!address && !!vaultAddress },
    });

    const shares = balanceOfResult?.[0]?.status === 'success' && typeof balanceOfResult[0].result === 'bigint'
        ? balanceOfResult[0].result
        : 0n;

    // shares가 0보다 크면 convertToAssets 호출
    const { data: convertToAssetsResult, isLoading: isLoadingAssets, error: assetsError } = useReadContracts({
        contracts: (shares > 0n && vaultAddress) ? [
            {
                address: vaultAddress,
                abi: VAULT_ABI,
                functionName: 'convertToAssets' as const,
                args: [shares] as const,
            },
        ] : [],
        query: { enabled: isConnected && !!address && !!vaultAddress && shares > 0n },
    });

    const assets = convertToAssetsResult?.[0]?.status === 'success' && typeof convertToAssetsResult[0].result === 'bigint'
        ? convertToAssetsResult[0].result
        : 0n;

    const assetsFormatted = assets > 0n ? formatUnits(assets, decimals) : '0.00';

    return {
        shares,
        assets,
        assetsFormatted,
        isLoading: isLoadingBalance || isLoadingAssets,
        isError: !!balanceError || !!assetsError,
    };
}