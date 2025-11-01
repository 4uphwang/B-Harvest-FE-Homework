// components/vaults/withdraw/WithdrawActionButton.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'components/ui/Button';
import { useTransactionModal } from 'components/ui/TransactionModalContext';
import { useAtomValue, useSetAtom } from 'jotai';
import { Vault } from 'lib/config/vaults';
import { useToast } from 'lib/hooks/useToast';
import { useWithdraw } from 'lib/hooks/useWithdraw';
import { userSummaryRefetchAtom } from 'lib/state/userSummaryRefetch';
import { withdrawInputAtom } from 'lib/state/withdrawInput';
import { getErrorMessage, isUserRejectedError } from 'lib/utils/error';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

// Withdraw logic hook
const useWithdrawLogic = (vault: Vault, amountString: string, showError: (message: string) => void) => {
    const { isConnected } = useAccount();
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const {
        withdrawAsync,
        isWriting: isWritingWithdraw,
        isConfirming: isConfirmingWithdraw,
        isSuccess: isWithdrawSuccess,
        isError: isWithdrawError,
        txHash: withdrawTxHash,
        error: withdrawError
    } = useWithdraw({ vault, amountString });

    useEffect(() => {
        if (isWithdrawSuccess) {
            // Success will be handled by parent component
            setIsWithdrawing(false);
        }
    }, [isWithdrawSuccess]);

    useEffect(() => {
        if (isWithdrawError && withdrawError) {
            // Error will be handled by parent component
            setIsWithdrawing(false);
        }
    }, [isWithdrawError, withdrawError]);

    const handleWithdraw = useCallback(async () => {
        // Prevent duplicate calls
        if (isWithdrawing || isWritingWithdraw || isConfirmingWithdraw) {
            return;
        }
        setIsWithdrawing(true);
        try {
            await withdrawAsync();
            // Success will be handled by useEffect
        } catch (e: any) {
            // Don't show error message for user rejection
            if (!isUserRejectedError(e)) {
                const errorMessage = getErrorMessage(e, 'Transaction failed due to an unexpected error');
                if (errorMessage) {
                    showError(errorMessage);
                }
            }
            setIsWithdrawing(false);
        }
    }, [isWithdrawing, isWritingWithdraw, isConfirmingWithdraw, withdrawAsync, showError]);

    const getExplorerUrl = useCallback((hash: `0x${string}` | undefined) => {
        if (!hash) return null;
        return `https://sepolia.basescan.org/tx/${hash}`;
    }, []);

    return {
        canWithdraw: isConnected,
        // isWithdrawing을 포함하여 handleWithdraw가 실행 중일 때도 버튼 비활성화
        isProcessing: isWithdrawing || isWritingWithdraw || isConfirmingWithdraw,
        isWritingWithdraw,
        isConfirmingWithdraw,
        withdrawTxHash,
        withdrawTxUrl: getExplorerUrl(withdrawTxHash),
        isWithdrawSuccess,
        isWithdrawError,
        withdrawError,
        handleWithdraw,
    };
};

interface WithdrawActionButtonProps {
    vault: Vault;
    maxAmount?: string; // Vault 잔액 (formatted)
    onProcessingChange?: (isProcessing: boolean) => void;
}

export const WithdrawActionButton: React.FC<WithdrawActionButtonProps> = ({ vault, maxAmount, onProcessingChange }) => {
    // All hooks must be called before any conditional returns (Rules of Hooks)
    const { isConnected } = useAccount();
    const inputAmount = useAtomValue(withdrawInputAtom);
    const setInputAmount = useSetAtom(withdrawInputAtom);
    const router = useRouter();
    const { open: openModal } = useTransactionModal();
    const queryClient = useQueryClient();
    const { showError: showErrorToast } = useToast();
    const withdrawErrorShownRef = useRef(false);
    const refetchUserSummary = useAtomValue(userSummaryRefetchAtom);

    const {
        canWithdraw,
        isProcessing,
        isWritingWithdraw,
        isConfirmingWithdraw,
        withdrawTxHash,
        withdrawTxUrl,
        isWithdrawSuccess,
        isWithdrawError,
        withdrawError,
        handleWithdraw
    } = useWithdrawLogic(vault, inputAmount, showErrorToast);

    // Notify parent of processing state change
    useEffect(() => {
        onProcessingChange?.(isProcessing);
    }, [isProcessing, onProcessingChange]);

    // Handle error callback - show only once, then ignore
    useEffect(() => {
        if (isWithdrawError && withdrawError && !withdrawErrorShownRef.current) {
            // Don't show error message for user rejection
            if (!isUserRejectedError(withdrawError)) {
                const errorMessage = getErrorMessage(withdrawError, 'Transaction failed due to an unexpected error');
                if (errorMessage) {
                    showErrorToast(errorMessage);
                    withdrawErrorShownRef.current = true;
                }
            } else {
                withdrawErrorShownRef.current = true;
            }
        }
    }, [isWithdrawError, withdrawError, showErrorToast]);

    // Reset error ref on success
    useEffect(() => {
        if (isWithdrawSuccess) {
            withdrawErrorShownRef.current = false;
        }
    }, [isWithdrawSuccess]);

    // Handle success callback
    useEffect(() => {
        if (isWithdrawSuccess && withdrawTxHash) {
            // Reset input
            setInputAmount('0.00');
            // Refetch balance data
            queryClient.invalidateQueries({ queryKey: ['balance'] });
            queryClient.invalidateQueries({ queryKey: ['vaultBalance'] });
            queryClient.invalidateQueries({ queryKey: ['userSummary'] });
            // Refetch user summary (vault 가치 업데이트)
            refetchUserSummary?.();
            // Open global modal
            openModal('withdraw', withdrawTxHash, withdrawTxUrl);
            // Navigate back immediately (modal stays open)
            router.back();
        }
    }, [isWithdrawSuccess, withdrawTxHash, withdrawTxUrl, setInputAmount, queryClient, openModal, router, refetchUserSummary]);

    const exceedsBalance = useMemo(() => {
        if (!maxAmount) return false;
        const inNum = Number(inputAmount || 0);
        const maxNum = Number(maxAmount || 0);
        if (isNaN(inNum) || isNaN(maxNum)) return false;
        return inNum > maxNum;
    }, [inputAmount, maxAmount]);

    const amountIsValid = useMemo(() => parseFloat(inputAmount) > 0, [inputAmount]);

    const withdrawButtonText = useMemo(() => {
        if (isProcessing) return 'Processing...';
        return 'Withdraw';
    }, [isProcessing]);

    // Conditional return after all hooks are called
    if (!isConnected) {
        return (
            <Button disabled variant="deposit" className="w-full">
                Connect Wallet
            </Button>
        );
    }

    return (
        <Button
            onClick={handleWithdraw}
            disabled={isProcessing || !canWithdraw || !amountIsValid || exceedsBalance}
            variant="deposit"
            className="w-full h-16 bg-primary-base hover:bg-yellow-400 text-black rounded-none font-medium disabled:opacity-70"
        >
            {withdrawButtonText}
        </Button>
    );
};

