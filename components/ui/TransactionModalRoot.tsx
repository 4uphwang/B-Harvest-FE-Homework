'use client';

import { TransactionModal } from './TransactionModal';
import { useTransactionModal } from './TransactionModalContext';

export function TransactionModalRoot() {
    const { state, close } = useTransactionModal();

    if (!state.type) return null;

    return (
        <TransactionModal
            isOpen={state.isOpen}
            onClose={close}
            type={state.type}
            txHash={state.txHash}
            explorerUrl={state.explorerUrl}
        />
    );
}

