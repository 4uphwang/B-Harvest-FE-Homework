'use client';

import { VAULT_ABI } from 'lib/config/abi';
import { decimalsMap } from 'lib/config/tokens';
import { Vault } from 'lib/config/vaults';
import { switchNetworkToTarget } from 'lib/utils/wallet';
import { parseUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

interface UseWithdrawParams {
    vault: Vault;
    amountString: string;
}

export function useWithdraw({ vault, amountString }: UseWithdrawParams) {
    const { address } = useAccount();
    const { writeContractAsync, data: txHash, isPending: isWriting, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError, error: confirmError } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const decimals = decimalsMap[vault.symbol] || 18;

    const withdrawAsync = async () => {
        const cleanAmount = amountString && Number(amountString) > 0 ? amountString : '0';
        const assets = parseUnits(cleanAmount, decimals);

        if (!address) throw new Error('Wallet not connected');
        await switchNetworkToTarget();
        return await writeContractAsync({
            abi: VAULT_ABI,
            address: vault.vaultAddress,
            functionName: 'withdraw',
            args: [assets, address, address], // assets, receiver, owner
        });
    };

    return {
        withdrawAsync,
        txHash,
        isWriting,
        isConfirming,
        isSuccess,
        isError: isError || !!writeError,
        error: writeError || confirmError,
    };
}

