'use client';

import { useAtom, useSetAtom } from 'jotai';
import { removeToastAtom, toastsAtom } from 'lib/state/toast';
import React, { useEffect } from 'react';

export const ToastContainer: React.FC = () => {
    const [toasts] = useAtom(toastsAtom);
    const remove = useSetAtom(removeToastAtom);

    useEffect(() => {
        const timers = toasts.map(t => setTimeout(() => remove(t.id), 2000));
        return () => { timers.forEach(clearTimeout); };
    }, [toasts, remove]);

    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-4 py-2 rounded-lg text-sm shadow-lg ${t.type === 'success' ? 'bg-green-500 text-black' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'
                        }`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
};


