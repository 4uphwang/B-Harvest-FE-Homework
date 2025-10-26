'use client';

import { useQuery } from '@tanstack/react-query';
import { CoinPrices, Currency } from 'lib/types/common';

async function fetchPricesFromServer(currency: Currency): Promise<CoinPrices> {
    const response = await fetch(`/api/prices?currency=${currency}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prices from server.');
    }

    return response.json() as Promise<CoinPrices>;
}


/**
 * 서버 API Route를 사용하는 CoinGecko 가격 조회 훅
 * @param currency 조회할 통화 ('usd' 또는 'krw')
 */
export function useCoinPrices(currency: Currency = 'usd') {
    return useQuery<CoinPrices, Error>({
        queryKey: ['coinPrices', currency],
        queryFn: () => fetchPricesFromServer(currency),

        staleTime: 5000,
        retry: 3,                       // 3번 재시도 로직
        refetchInterval: 1000 * 60 * 1, // 1분마다 백그라운드 업데이트
    });
}