'use client';

import { FAKE_TOKEN_ABI } from 'lib/config/abi/FakeTokenABI';
import { switchNetworkToTarget } from 'lib/utils/wallet';
import { parseUnits } from 'viem';
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

interface UseAllowanceParams {
    tokenAddress: `0x${string}` | undefined;
    spender: `0x${string}` | undefined;
    amountString: string;
    decimals: number;
}

export function useAllowance({ tokenAddress, spender, amountString, decimals }: UseAllowanceParams) {
    const { address, isConnected } = useAccount();

    const owner = address as `0x${string}` | undefined;

    const { data: allowanceData, isLoading: isLoadingAllowance, refetch } = useReadContracts({
        contracts: tokenAddress && owner && spender ? [
            {
                address: tokenAddress,
                abi: FAKE_TOKEN_ABI,
                functionName: 'allowance' as const,
                args: [owner, spender] as const,
            },
        ] : [],
        query: { enabled: isConnected && !!tokenAddress && !!owner && !!spender },
    });

    const currentAllowance: bigint = allowanceData?.[0]?.status === 'success' && typeof allowanceData[0].result === 'bigint'
        ? allowanceData[0].result
        : 0n;

    const requiredAmount: bigint = (() => {
        const cleanAmount = amountString && Number(amountString) > 0 ? amountString : '0';
        try { return parseUnits(cleanAmount, decimals); } catch { return 0n; }
    })();

    const needsApproval = isConnected && requiredAmount > currentAllowance;

    const { writeContractAsync, data: approveHash, isPending: isWriting, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError, error: confirmError } = useWaitForTransactionReceipt({ hash: approveHash });

    const approveAsync = async () => {
        if (!tokenAddress || !spender) throw new Error('Invalid token or spender');
        await switchNetworkToTarget();
        await writeContractAsync({
            abi: FAKE_TOKEN_ABI,
            address: tokenAddress,
            functionName: 'approve',
            args: [spender, requiredAmount],
        });
        // 승인 후 최신 allowance를 재조회
        setTimeout(() => refetch(), 800);
    };

    return {
        needsApproval,
        currentAllowance,
        requiredAmount,
        isLoadingAllowance,
        approveAsync,
        approveHash,
        isWriting,
        isConfirming,
        isSuccess,
        isError: isError || !!writeError,
        error: writeError || confirmError,
    };
}


