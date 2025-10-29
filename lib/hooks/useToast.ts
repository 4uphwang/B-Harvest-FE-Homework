'use client';

import { useSetAtom } from 'jotai';
import { addToastAtom } from 'lib/state/toast';

export function useToast() {
    const add = useSetAtom(addToastAtom);

    const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        add({ message, type });
    };

    return {
        showSuccess: (message: string) => show(message, 'success'),
        showError: (message: string) => show(message, 'error'),
        showInfo: (message: string) => show(message, 'info'),
    };
}


