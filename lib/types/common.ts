export type Currency = 'usd' | 'krw';

export interface CoinPrices {
    bitcoin: Record<Currency, number>;
    'usd-coin': Record<Currency, number>;
    tether: Record<Currency, number>;
}

export type VaultAssetAmounts = Record<string, bigint>;
