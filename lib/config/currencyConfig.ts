export const CURRENCY_MAP = {
    'usd': '$',
    'krw': '₩',
} as const;

export type Currency = keyof typeof CURRENCY_MAP;

export const VALID_CURRENCIES = Object.keys(CURRENCY_MAP) as Currency[];