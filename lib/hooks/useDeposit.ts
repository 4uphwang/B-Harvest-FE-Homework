'use client';

import { VAULT_ABI } from 'lib/config/abi';
import { decimalsMap } from 'lib/config/tokens';
import { Vault } from 'lib/config/vaults';
import { switchNetworkToTarget } from 'lib/utils/wallet';
import { parseUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

interface UseDepositParams {
    vault: Vault;
    amountString: string;
}

export function useDeposit({ vault, amountString }: UseDepositParams) {
    const { address } = useAccount();
    const { writeContractAsync, data: txHash, isPending: isWriting, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError, error: confirmError } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const decimals = decimalsMap[vault.symbol] || 18;

    const depositAsync = async () => {
        const cleanAmount = amountString && Number(amountString) > 0 ? amountString : '0';
        const assets = parseUnits(cleanAmount, decimals);

        if (!address) throw new Error('Wallet not connected');
        await switchNetworkToTarget();
        return await writeContractAsync({
            abi: VAULT_ABI,
            address: vault.vaultAddress,
            functionName: 'deposit',
            args: [assets, address],
        });
    };

    return {
        depositAsync,
        txHash,
        isWriting,
        isConfirming,
        isSuccess,
        isError: isError || !!writeError,
        error: writeError || confirmError,
    };
}


