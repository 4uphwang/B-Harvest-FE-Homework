// components/vaults/supply/DepositActionButton.tsx
'use client';

import { Button } from 'components/ui/Button';
import { useAtomValue } from 'jotai';
import { decimalsMap } from 'lib/config/tokens';
import { Vault } from 'lib/config/vaults';
import { useAllowance } from 'lib/hooks/useAllowance';
import { useDeposit } from 'lib/hooks/useDeposit';
import { useToast } from 'lib/hooks/useToast';
import { supplyInputAtom } from 'lib/state/supplyInput';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAccount } from 'wagmi';

// 예치 로직 훅: allowance 확인 후 approve 또는 deposit 수행
const useDepositLogic = (vault: Vault, amountString: string) => {
    const { isConnected } = useAccount();
    const { depositAsync, isWriting: isWritingDeposit, isConfirming: isConfirmingDeposit } = useDeposit({ vault, amountString });
    const router = useRouter();
    const { showSuccess, showError } = useToast();

    const decimals = decimalsMap[vault.symbol] || 18;
    const {
        needsApproval,
        approveAsync,
        isWriting: isWritingApprove,
        isConfirming: isConfirmingApprove,
    } = useAllowance({
        tokenAddress: vault.underlyingToken.address,
        spender: vault.vaultAddress,
        amountString,
        decimals,
    });

    const handleSupply = async () => {
        try {
            const tx = await depositAsync();
            if (tx) {
                showSuccess('Supply 성공');
                setTimeout(() => router.back(), 1500);
            }
        } catch (e: any) {
            showError(e?.message || 'Supply 실패');
        }
    };

    return {
        needsApproval,
        canSupply: isConnected && !needsApproval,
        isProcessing: isWritingApprove || isConfirmingApprove || isWritingDeposit || isConfirmingDeposit,
        handleApprove: async () => {
            try {
                await approveAsync();
                showSuccess('Approve 성공');
                // 승인 후 바로 deposit 시도
                const tx = await depositAsync();
                if (tx) {
                    showSuccess('Supply 성공');
                    setTimeout(() => router.back(), 1500);
                }
            } catch (e: any) {
                showError(e?.message || '승인/예치 실패');
            }
        },
        handleSupply,
    };
};


interface DepositActionButtonProps {
    vault: Vault;
    maxAmount?: string; // 지갑 잔액 (formatted)
}

export const DepositActionButton: React.FC<DepositActionButtonProps> = ({ vault, maxAmount }) => {
    const { isConnected } = useAccount();
    const inputAmount = useAtomValue(supplyInputAtom);

    const {
        needsApproval,
        canSupply,
        isProcessing,
        handleApprove,
        handleSupply
    } = useDepositLogic(vault, inputAmount);

    const exceedsBalance = (() => {
        if (!maxAmount) return false;
        const inNum = Number(inputAmount || 0);
        const maxNum = Number(maxAmount || 0);
        if (isNaN(inNum) || isNaN(maxNum)) return false;
        return inNum > maxNum;
    })();

    const amountIsValid = parseFloat(inputAmount) > 0;

    // 연결 안 됨
    if (!isConnected) {
        return (
            <Button disabled variant="deposit" className="w-full">
                Connect Wallet
            </Button>
        );
    }

    if (needsApproval && amountIsValid) {
        return (
            <>
                <Button
                    onClick={handleApprove}
                    disabled={isProcessing || exceedsBalance}
                    variant="deposit"
                    className="w-full h-16 bg-primary-base hover:bg-yellow-400 text-black rounded-none font-medium"
                >
                    {isProcessing ? '⏳ 승인 진행 중...' : `Approve`}
                </Button>
            </>
        );
    }

    return (
        <>
            <Button
                onClick={handleSupply}
                disabled={isProcessing || !canSupply || !amountIsValid || exceedsBalance}
                variant="deposit"
                className="w-full h-16 bg-primary-base hover:bg-yellow-400 text-black rounded-none font-medium"
            >
                {isProcessing ? '⏳ 예치 진행 중...' : 'Supply'}
            </Button>
        </>
    );
};
