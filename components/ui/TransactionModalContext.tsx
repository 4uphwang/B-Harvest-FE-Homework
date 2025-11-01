'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TransactionType = 'supply' | 'withdraw' | 'approve';

interface TransactionModalState {
    isOpen: boolean;
    type: TransactionType | null;
    txHash?: `0x${string}`;
    explorerUrl?: string | null;
}

interface TransactionModalContextValue {
    state: TransactionModalState;
    open: (type: TransactionType, txHash?: `0x${string}`, explorerUrl?: string | null) => void;
    close: () => void;
}

const TransactionModalContext = createContext<TransactionModalContextValue | null>(null);

export function TransactionModalProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<TransactionModalState>({
        isOpen: false,
        type: null,
    });

    const open = useCallback((type: TransactionType, txHash?: `0x${string}`, explorerUrl?: string | null) => {
        setState({ isOpen: true, type, txHash, explorerUrl });
    }, []);

    const close = useCallback(() => {
        setState({ isOpen: false, type: null });
    }, []);

    const value = useMemo(() => ({ state, open, close }), [state, open, close]);

    return (
        <TransactionModalContext.Provider value={value}>
            {children}
        </TransactionModalContext.Provider>
    );
}

export function useTransactionModal() {
    const ctx = useContext(TransactionModalContext);
    if (!ctx) throw new Error('useTransactionModal must be used within TransactionModalProvider');
    return ctx;
}

