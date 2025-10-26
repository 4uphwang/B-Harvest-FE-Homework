import { COIN_IDS } from 'lib/config/coingecko';
import { CURRENCY_MAP, VALID_CURRENCIES } from 'lib/config/currencyConfig';
import { Currency } from 'lib/types/common';
import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const CURRENCY_KEYS = Object.keys(CURRENCY_MAP) as Currency[];
const DEFAULT_FALLBACK_CURRENCY_KEY: Currency = CURRENCY_KEYS[0];

export async function GET(request: NextRequest) {
    if (!COINGECKO_API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedCurrency = searchParams.get('currency')?.toLowerCase() as Currency;

    let vsCurrency: Currency = DEFAULT_FALLBACK_CURRENCY_KEY;

    if (requestedCurrency && VALID_CURRENCIES.includes(requestedCurrency)) {
        vsCurrency = requestedCurrency;
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=${vsCurrency}&ids=${COIN_IDS}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-cg-demo-api-key': COINGECKO_API_KEY,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 60 } // 60초마다 데이터 갱신 시도
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: 'External API failure', details: errorData }, { status: response.status });
        }
        const data = await response.json();
        console.log(data)
        return NextResponse.json(data);

    } catch (error) {
        console.error('Server error fetching prices:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}