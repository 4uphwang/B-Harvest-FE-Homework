import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { backpackWallet, metaMaskWallet, okxWallet as okxWalletKit } from '@rainbow-me/rainbowkit/wallets';
import { baseSepolia } from "viem/chains";
import { createConfig, http } from "wagmi";

export const chains = [baseSepolia] as const;

export const CONNECTOR_IDS = {
    METAMASK: 'metaMaskSDK',
    OKX: 'OKXWallet',
    BACKPACK: 'backpack',
} as const;

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, backpackWallet, okxWalletKit],
        },
    ],
    {
        projectId: 'YOUR_PROJECT_ID',
        appName: 'B-Harvest-FE',
    }
);

export const config = createConfig({
    chains,
    ssr: true,
    transports: {
        [baseSepolia.id]: http(),
    },
    connectors: connectors
})