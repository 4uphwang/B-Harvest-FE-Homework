'use client';

import { useAtom } from 'jotai';
import { VALID_CURRENCIES } from 'lib/config/currencyConfig';
import { currencyAtom } from 'lib/state/currency';

export const CurrencySelector = () => {
    const [currency, setCurrency] = useAtom(currencyAtom);

    return (
        <div className="flex space-x-3 mb-6 items-center">
            <h3 className="text-lg font-semibold">통화 선택:</h3>
            {VALID_CURRENCIES.map((c) => (
                <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-4 py-1 rounded-full transition ${currency === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {c.toUpperCase()}
                </button>
            ))}
        </div>
    );
};