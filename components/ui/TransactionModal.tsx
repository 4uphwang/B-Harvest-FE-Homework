'use client';

import React from 'react';
import { FiCheckCircle, FiExternalLink, FiX } from 'react-icons/fi';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'supply' | 'withdraw' | 'approve';
    txHash?: `0x${string}`;
    explorerUrl?: string | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    type,
    txHash,
    explorerUrl,
}) => {
    if (!isOpen) return null;

    const getTitle = () => {
        switch (type) {
            case 'supply':
                return 'Supply Successful!';
            case 'withdraw':
                return 'Withdraw Successful!';
            case 'approve':
                return 'Approval Successful!';
            default:
                return 'Transaction Successful!';
        }
    };

    const getMessage = () => {
        switch (type) {
            case 'supply':
                return 'Your tokens have been successfully supplied to the vault.';
            case 'withdraw':
                return 'Your tokens have been successfully withdrawn from the vault.';
            case 'approve':
                return 'Token approval has been successfully completed.';
            default:
                return 'Transaction has been successfully completed.';
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5">
            <div
                className="absolute inset-0 bg-black/60 transition-opacity duration-200"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                className="relative z-[1001] w-full max-w-md rounded-[16px] bg-surfaces-base-2 p-6 shadow-2xl"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-lg p-1 w-8 h-8 text-surfaces-on-5 hover:bg-surfaces-on-surface/10 hover:text-surfaces-on-surface flex justify-center items-center"
                >
                    <FiX className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    {/* icon */}
                    <div className="w-16 h-16 rounded-full bg-primary-base/20 flex items-center justify-center">
                        <FiCheckCircle className="h-8 w-8 text-primary-base" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-surfaces-on-surface">
                        {getTitle()}
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-surfaces-on-5 max-w-sm">
                        {getMessage()}
                    </p>

                    {/* Transaction hash and explorer link */}
                    {txHash && explorerUrl && (
                        <div className="w-full pt-2 border-t border-darker">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 justify-center">
                                    <span className="text-xs text-surfaces-on-4 font-mono">
                                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                    </span>
                                </div>
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surfaces-on-surface/10 hover:bg-surfaces-on-surface/20 text-sm text-primary-base transition-colors"
                                >
                                    View on BaseScan
                                    <FiExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="mt-4 px-8 py-3 rounded-lg bg-primary-base hover:bg-yellow-400 text-black font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
