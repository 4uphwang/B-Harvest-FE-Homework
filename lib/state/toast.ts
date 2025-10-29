'use client';

import { atom } from 'jotai';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}

export const toastsAtom = atom<ToastItem[]>([]);

export const addToastAtom = atom(null, (get, set, toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: ToastItem = { id, ...toast };
    set(toastsAtom, [...get(toastsAtom), next]);
});

export const removeToastAtom = atom(null, (get, set, id: string) => {
    set(toastsAtom, get(toastsAtom).filter(t => t.id !== id));
});


