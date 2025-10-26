import { atom } from 'jotai';
import { CURRENCY_MAP } from 'lib/config/currencyConfig';
import { Currency } from 'lib/types/common';

const CURRENCY_KEYS = Object.keys(CURRENCY_MAP) as Currency[];
const DEFAULT_FALLBACK_CURRENCY_KEY: Currency = CURRENCY_KEYS[0];


export const currencyAtom = atom<Currency>(DEFAULT_FALLBACK_CURRENCY_KEY);

export const currencySymbolAtom = atom((get) => {
    const currency = get(currencyAtom);

    return CURRENCY_MAP[currency] || CURRENCY_MAP[DEFAULT_FALLBACK_CURRENCY_KEY];
});
