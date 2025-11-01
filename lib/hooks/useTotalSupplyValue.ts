'use client';

import { useAtomValue } from 'jotai';
import { VAULT_LIST } from 'lib/config/vaults';
import { useCoinPrices } from 'lib/hooks/useCoinPrices';
import { useVaultAssets } from 'lib/hooks/useValueAssets';
import { currencyAtom } from 'lib/state/currency';
import { getPrice } from 'lib/utils/wallet';
import { useMemo } from 'react';

export function useTotalSupplyValue() {
    const currency = useAtomValue(currencyAtom);
    const { data: prices, isLoading: isLoadingPrices, isError: isErrorPrices } = useCoinPrices(currency);
    const { assetAmounts, isLoadingAssets, isErrorAssets } = useVaultAssets();

    const totalSupplyValue = useMemo(() => {
        if (!assetAmounts || !prices) return 0;
        return VAULT_LIST.reduce((sum, v) => {
            const amountStr = assetAmounts[v.symbol] || '0';
            const amount = Number(amountStr);
            if (!isFinite(amount) || amount <= 0) return sum;
            const price = getPrice(v.underlyingToken.symbol, prices, currency) || 0;
            return sum + amount * price;
        }, 0);
    }, [assetAmounts, prices, currency]);

    return {
        totalSupplyValue,
        isLoading: isLoadingAssets || isLoadingPrices,
        isError: isErrorAssets || isErrorPrices,
    };
}


