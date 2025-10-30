'use client';

import { BackpackWallet, MetaMaskWallet, OkxWallet } from 'assets';
import { useToast } from 'lib/hooks/useToast';
import { truncateAddress } from 'lib/utils/wallet';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiChevronRight, FiCopy, FiLogOut, FiX } from 'react-icons/fi';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useWalletModalContext } from './WalletModalContext';

export function WalletModalRoot() {
    const { isOpen, close } = useWalletModalContext();
    const { showSuccess } = useToast();
    const { address, isConnected, chain, connector: activeConnector } = useAccount();
    const { connectAsync, connectors, isPending, error } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { switchChainAsync, chains: switchableChains, isPending: isSwitching } = useSwitchChain();
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false); // for entry animation
    const [isVisible, setIsVisible] = useState(false); // keep mounted during exit
    const panelRef = useRef<HTMLDivElement | null>(null);

    const availableConnectors = useMemo(() => {
        const allowNames = new Set(['MetaMask', 'Backpack', 'OKX Wallet']);
        const order = ['MetaMask', 'Backpack', 'OKX Wallet'];
        const filtered = (connectors ?? []).filter((c) => allowNames.has(c.name));
        const uniqueByName = Array.from(new Map(filtered.map((c) => [c.name, c])).values());
        uniqueByName.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
        return uniqueByName;
    }, [connectors]);

    // Handle mount/unmount with animation
    useEffect(() => {
        const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (isOpen) {
            setIsVisible(true);
            if (reduce) {
                setIsMounted(true);
                return;
            }
            const id = requestAnimationFrame(() => setIsMounted(true));
            return () => cancelAnimationFrame(id);
        } else {
            if (reduce) {
                setIsMounted(false);
                setIsVisible(false);
                return;
            }
            // play exit then unmount after duration
            setIsMounted(false);
            const t = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // ESC to close
    useEffect(() => {
        if (!isVisible) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isVisible, close]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${isMounted ? 'opacity-100' : 'opacity-0'}`}
                onClick={close}
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                className={`relative z-[1001] w-full max-w-[calc(100vw-40px)] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-[16px] bg-surfaces-base-2 p-5 shadow-2xl transition-all duration-200 ease-out ${isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
            >
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-[15px] font-semibold text-surfaces-on-surface">Select a wallet</h3>
                    </div>
                    <button type="button" onClick={close} className="-m-2 rounded-lg p-1 w-8 h-8 text-surfaces-on-5 hover:bg-surfaces-on-surface/10 hover:text-surfaces-on-surface flex justify-center items-center">
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                {isConnected && (
                    <div className="mb-3 rounded-xl border border-darker p-3 bg-surfaces-on-surface/[0.06]">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-surfaces-on-4">Connected</div>
                            <div className="text-sm text-surfaces-on-surface">{activeConnector?.name || 'Unknown'}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                                <div className="font-mono text-sm text-surfaces-on-surface truncate">{truncateAddress(address as `0x${string}`, 4, 4)}</div>
                                <button
                                    type="button"
                                    aria-label="Copy address"
                                    className="h-7 w-7 rounded-md text-surfaces-on-6 hover:text-surfaces-on-surface hover:bg-surfaces-on-surface/10 flex items-center justify-center"
                                    onClick={async () => { try { await navigator.clipboard.writeText(address || ''); showSuccess('Copied!'); } catch { } }}
                                >
                                    <FiCopy className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                type="button"
                                aria-label="Disconnect"
                                className="h-8 w-8 rounded-md text-surfaces-on-6 hover:text-surfaces-on-surface hover:bg-surfaces-on-surface/10 flex items-center justify-center"
                                onClick={async () => { try { await disconnectAsync(); } catch { } }}
                            >
                                <FiLogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {availableConnectors.map((connector) => (
                        <button
                            key={connector.id}
                            type="button"
                            disabled={(isPending && pendingId !== connector.id)}
                            onClick={async () => {
                                try {
                                    setPendingId(connector.id);
                                    await connectAsync({ connector });
                                    close();
                                } catch (_) {
                                } finally {
                                    setPendingId(null);
                                }
                            }}
                            className={`group w-full rounded-xl border px-4 py-3 text-left transition-all hover:bg-surfaces-on-surface/10 hover:shadow-sm disabled:opacity-60 ${activeConnector?.id === connector.id ? 'border-primary-base/60 bg-primary-base/[0.06]' : 'border-darker'}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surfaces-on-surface/10">
                                        {connector.name === 'MetaMask' && <MetaMaskIcon />}
                                        {connector.name === 'Backpack' && <BackpackIcon />}
                                        {connector.name === 'OKX Wallet' && <OkxIcon />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-surfaces-on-surface">{connector.name}</span>
                                        {activeConnector?.id === connector.id && (
                                            <span className="text-[11px] text-primary-base">Connected</span>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-auto flex items-center gap-2 text-[12px] text-surfaces-on-5">
                                    {pendingId === connector.id ? (
                                        <Spinner />
                                    ) : (
                                        activeConnector?.id === connector.id ? (
                                            <FiCheck className="h-4 w-4 text-primary-base" />
                                        ) : (
                                            <FiChevronRight className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
                                        )
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                        {error.message}
                    </div>
                )}
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500" />
    );
}

function MetaMaskIcon() {
    return (
        <Image src={MetaMaskWallet} alt="MetaMask" className="h-6 w-6" />
    );
}

function BackpackIcon() {
    return (
        <Image src={BackpackWallet}
            alt="Backpack"
            className="h-6 w-6"
        />
    );
}

function OkxIcon() {
    return (
        <Image src={OkxWallet} alt="OKX" className="h-6 w-6" />
    );
}


