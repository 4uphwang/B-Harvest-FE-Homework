'use client';

import { FAKE_TOKEN_ABI } from 'lib/config/abi/FakeTokenABI';
import { retryUntilCondition } from 'lib/utils/retry';
import { switchNetworkToTarget } from 'lib/utils/wallet';
import { parseUnits } from 'viem';
import { useAccount, usePublicClient, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

interface UseAllowanceParams {
    tokenAddress: `0x${string}` | undefined;
    spender: `0x${string}` | undefined;
    amountString: string;
    decimals: number;
}

export function useAllowance({ tokenAddress, spender, amountString, decimals }: UseAllowanceParams) {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();

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
    const { isLoading: isConfirming, isSuccess, isError, error: confirmError } = useWaitForTransactionReceipt({
        hash: approveHash,
        query: { enabled: !!approveHash }
    });

    const approveAsync = async () => {
        if (!tokenAddress || !spender) throw new Error('Invalid token or spender');
        if (!publicClient) throw new Error('Public client not available');

        await switchNetworkToTarget();

        // Step 1: Send approve transaction
        const hash = await writeContractAsync({
            abi: FAKE_TOKEN_ABI,
            address: tokenAddress,
            functionName: 'approve',
            args: [spender, requiredAmount],
        });

        // Step 2: Wait for transaction receipt with confirmations
        // confirmations: 1을 추가하여 블록 확인 후 상태가 확실히 반영되도록 대기
        const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 1,
        });

        // Step 3: Verify transaction was successful
        if (receipt.status === 'reverted') {
            throw new Error('Approve transaction failed');
        }

        // Step 4: Refetch allowance and verify it's updated
        await refetch();

        // Step 5: Verify allowance was actually updated by reading directly from chain
        // This ensures we don't proceed until allowance is confirmed
        // Sometimes RPC nodes need a moment to sync state, so we retry with a short delay
        if (!owner) {
            throw new Error('Owner address not available');
        }

        // Retry logic: Allowance 업데이트가 반영될 때까지 재시도
        await retryUntilCondition(
            async () => {
                const updatedAllowance = await publicClient.readContract({
                    address: tokenAddress,
                    abi: FAKE_TOKEN_ABI,
                    functionName: 'allowance',
                    args: [owner, spender],
                });
                return updatedAllowance >= requiredAmount;
            },
            {
                maxRetries: 5,
                retryDelay: 200,
                onRetry: (attempt) => {
                    console.log(`Allowance 확인 재시도 ${attempt}/5...`);
                },
            }
        );

        return hash;
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
        refetch: refetch,
    };
}


