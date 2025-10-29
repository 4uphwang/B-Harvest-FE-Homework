import { CoinPrices } from "lib/types/common";

export const COINGECKO_ID_MAP: Record<string, keyof CoinPrices> = {
    BTC: 'bitcoin',
    USDC: 'usd-coin',
    USDT: 'tether',
};

export const COIN_IDS = Object.values(COINGECKO_ID_MAP).join(',');
