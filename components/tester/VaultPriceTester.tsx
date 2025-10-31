'use client';

import { CurrencySelector } from 'components/tester/CurrencySelector';
import { useAtom, useAtomValue } from 'jotai';
import { COINGECKO_ID_MAP } from 'lib/config/coingecko';
import { VAULT_LIST, Vault } from 'lib/config/vaults';
import { useCoinPrices } from 'lib/hooks/useCoinPrices';
import { useVaultAssets } from 'lib/hooks/useValueAssets';
import { useVaultAprs } from 'lib/hooks/useVaultAprs';
import { currencyAtom, currencySymbolAtom } from 'lib/state/currency';
import { CoinPrices, Currency } from 'lib/types/common';
import { formatApr } from 'lib/utils/wallet';

const getPrice = (symbol: string, prices: CoinPrices | undefined, currency: Currency): number => {
    if (!prices) return 0;

    const coingeckoId = COINGECKO_ID_MAP[symbol];

    if (!coingeckoId) {
        console.warn(`[PriceLookup] No CoinGecko ID defined for symbol: ${symbol}`);
        return 0;
    }

    const priceRecord = prices[coingeckoId];

    return priceRecord?.[currency] || 0;
};

interface VaultPriceCardProps {
    vault: Vault;
    priceUsd: number;
    currencySymbol: string;
    assetAmount: string; // formatted token amount string
    aprValue: bigint;
}

// 💡 Vault별 TVL은 Vault의 totalAssets()와 가격을 곱해야 하지만,
//    여기서는 테스트를 위해 임의의 TVL 값과 가격을 조합하여 시뮬레이션합니다.
const MOCK_TVL_ASSETS = {
    BTC: 12.50, // 12.5 BTC 토큰이 Vault에 예치됨
    USDT: 50000.00,
    USDC: 75000.00,
};

// 뼈대(Skeleton) UI 컴포넌트
const SkeletonCard = () => (
    <div className="bg-white p-4 rounded-xl shadow-lg animate-pulse h-40">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
    </div>
);


const VaultPriceCard = ({ vault, priceUsd, currencySymbol, assetAmount, aprValue }: VaultPriceCardProps) => {
    const { symbol: tokenSymbol } = vault.underlyingToken;

    const tokenAmountString = assetAmount;
    const tokenAmount = Number(tokenAmountString);
    const tvl = tokenAmount * priceUsd;

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-2xl">
            <h4 className="text-xl font-bold mb-3 text-indigo-700">{vault.name} ({vault.symbol})</h4>
            <div className="space-y-2 text-gray-700">
                <p>기반 토큰: {tokenSymbol}</p>
                <p className="text-lg font-mono">
                    토큰 가격:
                    <span className="text-green-600 font-semibold">
                        {currencySymbol}{priceUsd.toLocaleString(undefined, { maximumFractionDigits: tokenSymbol.includes('BTC') ? 2 : 4 })}
                    </span>
                </p>
                <p className="text-2xl font-extrabold text-gray-800 pt-2 border-t mt-2">
                    총 가치 (TVL):
                    <span className="text-indigo-600 ml-2">
                        {currencySymbol}{tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                </p>

                <p className="text-xl font-extrabold text-purple-600 pt-2 border-t mt-2">
                    현재 APR:
                    <span className="ml-2 font-mono font-bold">
                        {formatApr(aprValue)}%
                    </span>
                </p>
            </div>
        </div>
    );
};


// 3. 메인 컴포넌트
export default function VaultPriceTester() {
    const [currency, setCurrency] = useAtom(currencyAtom);
    const currencySymbol = useAtomValue(currencySymbolAtom);

    const { data: prices, isLoading: isLoadingPrices, isError: isErrorPrices, refetch: refetchPrices } = useCoinPrices(currency);
    const { aprData, isLoadingApr, isErrorApr, refetch: refetchApr } = useVaultAprs();
    const { assetAmounts, isLoadingAssets, isErrorAssets, refetch: refetchAssets } = useVaultAssets();

    // 로딩 상태 통합
    const isLoading = isLoadingPrices || isLoadingApr || isLoadingAssets;
    // 💡 오류 상태 통합: assetAmounts 데이터 누락 시 오류 처리
    const isError = isErrorPrices || isErrorApr || isErrorAssets || !prices || !aprData || !assetAmounts;

    const handleRefetch = () => {
        refetchPrices();
        refetchApr();
        refetchAssets(); // 💡 자산 총량도 재시도
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
        );
    }

    if (isError || !prices) {
        return (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <h4 className="font-bold mb-2">❌ 가격 데이터 로딩 실패</h4>
                <p className="text-sm">API 서버 또는 네트워크 오류가 발생했습니다. (자동 재시도 로직 활성화)</p>
                <button
                    onClick={() => handleRefetch()}
                    className="mt-3 px-4 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                    수동 재시도
                </button>
            </div>
        );
    }

    return (
        <div>
            <CurrencySelector />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {VAULT_LIST.map((vault) => {
                    const tokenSymbol = vault.underlyingToken.symbol as keyof typeof MOCK_TVL_ASSETS;
                    const priceUsd = getPrice(tokenSymbol, prices, currency);

                    return (
                        <VaultPriceCard
                            key={vault.vaultAddress}
                            vault={vault}
                            priceUsd={priceUsd}
                            currencySymbol={currencySymbol}
                            assetAmount={assetAmounts[vault.symbol] || '0'}
                            aprValue={aprData[vault.symbol] || 0n}
                        />
                    );
                })}
            </div>
        </div>
    );
}