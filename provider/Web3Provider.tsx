"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletModalProvider } from 'components/wallet/WalletModalContext';
import { WalletModalRoot } from 'components/wallet/WalletModalRoot';
import { WagmiProvider } from 'wagmi';
import { config } from './config';

const queryClient = new QueryClient()


export default function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <WalletModalProvider>
                    {children}
                    <WalletModalRoot />
                </WalletModalProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}