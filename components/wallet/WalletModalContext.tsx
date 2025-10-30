'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type WalletModalContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

const WalletModalContext = createContext<WalletModalContextValue | null>(null);

export function WalletModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);

    const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);
    return (
        <WalletModalContext.Provider value={value}>{children}</WalletModalContext.Provider>
    );
}

export function useWalletModalContext() {
    const ctx = useContext(WalletModalContext);
    if (!ctx) throw new Error('useWalletModalContext must be used within WalletModalProvider');
    return ctx;
}


