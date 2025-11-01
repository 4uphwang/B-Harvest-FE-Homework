// components/vaults/supply/DepositActionButton.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'components/ui/Button';
import { useTransactionModal } from 'components/ui/TransactionModalContext';
import { useAtomValue, useSetAtom } from 'jotai';
import { decimalsMap } from 'lib/config/tokens';
import { Vault } from 'lib/config/vaults';
import { useAllowance } from 'lib/hooks/useAllowance';
import { useDeposit } from 'lib/hooks/useDeposit';
import { useToast } from 'lib/hooks/useToast';
import { supplyInputAtom } from 'lib/state/supplyInput';
import { userSummaryRefetchAtom } from 'lib/state/userSummaryRefetch';
import { getErrorMessage, isUserRejectedError } from 'lib/utils/error';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

const useDepositLogic = (vault: Vault, amountString: string) => {
    const { isConnected } = useAccount();
    const [isApproving, setIsApproving] = useState(false);
    const depositErrorShownRef = useRef(false);
    const approveErrorShownRef = useRef(false);
    const {
        depositAsync,
        isWriting: isWritingDeposit,
        isConfirming: isConfirmingDeposit,
        isSuccess: isDepositSuccess,
        isError: isDepositError,
        txHash: depositTxHash,
        error: depositError
    } = useDeposit({ vault, amountString });
    const { showSuccess, showError } = useToast();

    const decimals = decimalsMap[vault.symbol] || 18;
    const {
        needsApproval,
        approveAsync,
        isWriting: isWritingApprove,
        isConfirming: isConfirmingApprove,
        isSuccess: isApproveSuccess,
        isError: isApproveError,
        approveHash: approveTxHash,
        error: approveError,
        refetch: refetchAllowance,
    } = useAllowance({
        tokenAddress: vault.underlyingToken.address,
        spender: vault.vaultAddress,
        amountString,
        decimals,
    });

    useEffect(() => {
        if (isDepositSuccess) {
            // Success will be handled by parent component
            setIsApproving(false);
            depositErrorShownRef.current = false;
        }
    }, [isDepositSuccess]);

    // Handle error callback - show only once, then ignore
    useEffect(() => {
        if (isDepositError && depositError && !depositErrorShownRef.current) {
            // Don't show error message for user rejection (they already cancelled it)
            if (!isUserRejectedError(depositError)) {
                const errorMessage = getErrorMessage(depositError, 'Transaction failed due to an unexpected error');
                if (errorMessage) {
                    showError(errorMessage);
                    depositErrorShownRef.current = true;
                }
            } else {
                depositErrorShownRef.current = true;
            }
            setIsApproving(false);
        }
    }, [isDepositError, depositError, showError]);

    // Handle error callback - show only once, then ignore
    useEffect(() => {
        if (isApproveError && approveError && !approveErrorShownRef.current) {
            // Don't show error message for user rejection (they already cancelled it)
            if (!isUserRejectedError(approveError)) {
                const errorMessage = getErrorMessage(approveError, 'Transaction failed due to an unexpected error');
                if (errorMessage) {
                    showError(errorMessage);
                    approveErrorShownRef.current = true;
                }
            } else {
                approveErrorShownRef.current = true;
            }
            setIsApproving(false);
        }
    }, [isApproveError, approveError, showError]);

    const handleSupply = useCallback(async () => {
        // Prevent duplicate calls
        if (isApproving || isWritingApprove || isConfirmingApprove || isWritingDeposit || isConfirmingDeposit) {
            return;
        }
        try {
            await depositAsync();
            // Success will be handled by useEffect
        } catch (e: any) {
            // Don't show error message for user rejection
            if (!isUserRejectedError(e)) {
                const errorMessage = getErrorMessage(e, 'Transaction failed due to an unexpected error');
                if (errorMessage) {
                    showError(errorMessage);
                }
            }
            // Error will be handled by useEffect
        }
    }, [isApproving, isWritingApprove, isConfirmingApprove, isWritingDeposit, isConfirmingDeposit, depositAsync, showError]);

    const getExplorerUrl = useCallback((hash: `0x${string}` | undefined) => {
        if (!hash) return null;
        return `https://sepolia.basescan.org/tx/${hash}`;
    }, []);

    return {
        needsApproval,
        canSupply: isConnected && !needsApproval,
        // isApproving을 포함하여 handleApprove가 실행 중일 때도 버튼 비활성화
        isProcessing: isApproving || isWritingApprove || isConfirmingApprove || isWritingDeposit || isConfirmingDeposit,
        isWritingApprove,
        isConfirmingApprove,
        isWritingDeposit,
        isConfirmingDeposit,
        approveTxHash,
        depositTxHash,
        approveTxUrl: getExplorerUrl(approveTxHash),
        depositTxUrl: getExplorerUrl(depositTxHash),
        isDepositSuccess,
        isApproveSuccess,
        depositAsync,
        handleApprove: useCallback(async () => {
            // Prevent duplicate calls
            if (isApproving || isWritingApprove || isConfirmingApprove || isWritingDeposit || isConfirmingDeposit) {
                return;
            }
            setIsApproving(true);
            try {
                // Step 1: Approve transaction and wait for confirmation
                // approveAsync handles: approve -> wait for receipt -> refetch allowance -> verify allowance updated
                await approveAsync();

                // Step 2: Proceed to deposit (allowance is confirmed to be updated in approveAsync)
                await depositAsync();
                // Note: depositAsync가 완료되어도 deposit receipt를 기다리는 동안에는
                // isWritingDeposit/isConfirmingDeposit이 true이므로 버튼은 계속 비활성화됨
                // deposit이 성공하면 useEffect에서 setIsApproving(false) 호출
            } catch (e: any) {
                // Don't show error message for user rejection
                if (!isUserRejectedError(e)) {
                    const errorMessage = getErrorMessage(e, 'Transaction failed due to an unexpected error');
                    if (errorMessage) {
                        showError(errorMessage);
                    }
                }
                setIsApproving(false);
            }
            // Note: 성공 시에는 useEffect(isDepositSuccess)에서 setIsApproving(false) 호출
            // 에러 시에는 catch에서 setIsApproving(false) 호출
        }, [isApproving, isWritingApprove, isConfirmingApprove, isWritingDeposit, isConfirmingDeposit, approveAsync, depositAsync, showError]),
        handleSupply,
    };
};


interface DepositActionButtonProps {
    vault: Vault;
    maxAmount?: string; // 지갑 잔액 (formatted)
    onProcessingChange?: (isProcessing: boolean) => void;
}

export const DepositActionButton: FC<DepositActionButtonProps> = ({ vault, maxAmount, onProcessingChange }) => {
    // All hooks must be called before any conditional returns (Rules of Hooks)
    const { isConnected } = useAccount();
    const inputAmount = useAtomValue(supplyInputAtom);
    const setInputAmount = useSetAtom(supplyInputAtom);
    const router = useRouter();
    const { open: openModal } = useTransactionModal();
    const queryClient = useQueryClient();
    const refetchUserSummary = useAtomValue(userSummaryRefetchAtom);

    const {
        needsApproval,
        canSupply,
        isProcessing,
        isWritingApprove,
        isConfirmingApprove,
        isWritingDeposit,
        isConfirmingDeposit,
        approveTxHash,
        depositTxHash,
        approveTxUrl,
        depositTxUrl,
        isDepositSuccess,
        isApproveSuccess,
        handleApprove,
        handleSupply
    } = useDepositLogic(vault, inputAmount);

    // Notify parent of processing state change
    useEffect(() => {
        onProcessingChange?.(isProcessing);
    }, [isProcessing, onProcessingChange]);

    // Handle deposit success
    useEffect(() => {
        if (isDepositSuccess && depositTxHash) {
            // Reset input
            setInputAmount('0.00');
            // Refetch balance data
            queryClient.invalidateQueries({ queryKey: ['balance'] });
            queryClient.invalidateQueries({ queryKey: ['vaultBalance'] });
            queryClient.invalidateQueries({ queryKey: ['userSummary'] });
            // Refetch user summary (vault 가치 업데이트)
            refetchUserSummary?.();
            // Open global modal
            openModal('supply', depositTxHash, depositTxUrl);
            // Navigate back immediately (modal stays open)
            router.back();
        }
    }, [isDepositSuccess, depositTxHash, depositTxUrl, setInputAmount, queryClient, openModal, router, refetchUserSummary]);

    const exceedsBalance = useMemo(() => {
        if (!maxAmount) return false;
        const inNum = Number(inputAmount || 0);
        const maxNum = Number(maxAmount || 0);
        if (isNaN(inNum) || isNaN(maxNum)) return false;
        return inNum > maxNum;
    }, [inputAmount, maxAmount]);

    const amountIsValid = useMemo(() => parseFloat(inputAmount) > 0, [inputAmount]);

    const approveButtonText = useMemo(() => {
        if (isProcessing) return 'Processing...';
        return 'Approve';
    }, [isProcessing]);

    const supplyButtonText = useMemo(() => {
        if (isProcessing) return 'Processing...';
        return 'Supply';
    }, [isProcessing]);

    // Conditional return after all hooks are called
    if (!isConnected) {
        return (
            <Button disabled variant="deposit" className="w-full">
                Connect Wallet
            </Button>
        );
    }

    if (needsApproval && amountIsValid) {
        return (
            <Button
                onClick={handleApprove}
                disabled={isProcessing || exceedsBalance}
                variant="deposit"
                className="w-full h-16 bg-primary-base hover:bg-yellow-400 text-black rounded-none font-medium disabled:opacity-70"
            >
                {approveButtonText}
            </Button>
        );
    }

    return (
        <Button
            onClick={handleSupply}
            disabled={isProcessing || !canSupply || !amountIsValid || exceedsBalance}
            variant="deposit"
            className="w-full h-16 bg-primary-base hover:bg-yellow-400 text-black rounded-none font-medium disabled:opacity-70"
        >
            {supplyButtonText}
        </Button>
    );
};
