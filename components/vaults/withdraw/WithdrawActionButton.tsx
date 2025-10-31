// components/vaults/withdraw/WithdrawActionButton.tsx
'use client';

import { Button } from 'components/ui/Button';
import { useAtomValue } from 'jotai';
import { Vault } from 'lib/config/vaults';
import { useWithdraw } from 'lib/hooks/useWithdraw';
import { useToast } from 'lib/hooks/useToast';
import { withdrawInputAtom } from 'lib/state/withdrawInput';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAccount } from 'wagmi';

// 출금 로직 훅
const useWithdrawLogic = (vault: Vault, amountString: string) => {
    const { isConnected } = useAccount();
    const { withdrawAsync, isWriting: isWritingWithdraw, isConfirming: isConfirmingWithdraw } = useWithdraw({ vault, amountString });
    const router = useRouter();
    const { showSuccess, showError } = useToast();

    const handleWithdraw = async () => {
        try {
            const tx = await withdrawAsync();
            if (tx) {
                showSuccess('Withdraw 성공');
                setTimeout(() => router.back(), 1500);
            }
        } catch (e: any) {
            showError(e?.message || 'Withdraw 실패');
        }
    };

    return {
        canWithdraw: isConnected,
        isProcessing: isWritingWithdraw || isConfirmingWithdraw,
        handleWithdraw,
    };
};

interface WithdrawActionButtonProps {
    vault: Vault;
    maxAmount?: string; // Vault 잔액 (formatted)
}

export const WithdrawActionButton: React.FC<WithdrawActionButtonProps> = ({ vault, maxAmount }) => {
    const { isConnected } = useAccount();
    const inputAmount = useAtomValue(withdrawInputAtom);

    const {
        canWithdraw,
        isProcessing,
        handleWithdraw
    } = useWithdrawLogic(vault, inputAmount);

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

    return (
        <>
            <Button
                onClick={handleWithdraw}
                disabled={isProcessing || !canWithdraw || !amountIsValid || exceedsBalance}
                variant="deposit"
                className="w-full h-16 bg-primary-base hover:bg-yellow-400 text-black rounded-none font-medium"
            >
                {isProcessing ? '⏳ 출금 진행 중...' : 'Withdraw'}
            </Button>
        </>
    );
};

