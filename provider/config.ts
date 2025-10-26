import { metaMask } from "@wagmi/connectors";
import { baseSepolia } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

export const chains = [baseSepolia] as const;

export const CONNECTOR_IDS = {
    METAMASK: 'metaMaskSDK',
    OKX: 'OKXWallet',
    BACKPACK: 'backpack',
} as const;

const okxWallet = () => injected({
    target: {
        id: CONNECTOR_IDS.OKX,
        name: 'OKX Wallet',
        provider: (typeof window !== 'undefined' ? (window as any).okxwallet : undefined),
    }
});

const backpack = () => injected({
    target: {
        id: CONNECTOR_IDS.BACKPACK,
        name: 'Backpack Wallet',
        provider: () => {
            if (typeof window === 'undefined') return;
            const backpackProvider = (window as any).backpack;

            // Backpack은 솔라나와 EVM 체인을 지원하는 멀티체인 지갑
            // EVM용 EIP-1193 Provider는 window.backpack 객체 내의 'ethereum' 속성을 통해 주입
            // 이는 솔라나 프로바이더(window.backpack.solana)와 명시적으로 구분
            if (backpackProvider && backpackProvider.ethereum) {
                return backpackProvider.ethereum;
            }
            return backpackProvider;
        },
    }
});

export const config = createConfig({
    chains,
    ssr: true,
    transports: {
        [baseSepolia.id]: http(),
    },
    connectors: [
        metaMask(),
        okxWallet(),
        backpack(),
    ],
})
