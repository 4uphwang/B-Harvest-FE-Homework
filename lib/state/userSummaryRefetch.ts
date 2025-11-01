'use client';

import { atom } from 'jotai';

type RefetchFunction = (() => Promise<void>) | null;

export const userSummaryRefetchAtom = atom<RefetchFunction>(null);

