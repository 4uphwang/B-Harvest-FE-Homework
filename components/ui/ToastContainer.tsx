'use client';

import { useAtom, useSetAtom } from 'jotai';
import { removeToastAtom, toastsAtom } from 'lib/state/toast';
import React, { useEffect } from 'react';
import { FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

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
                    className={`group pointer-events-auto flex items-center gap-3 rounded-xl border px-3 py-2 shadow-2xl backdrop-blur transition-all duration-200
                        ${t.type === 'success' ? 'border-primary-base/40 bg-primary-base/[0.08]' : t.type === 'error' ? 'border-red-500/40 bg-red-500/10' : 'border-darker bg-surfaces-on-surface/[0.06]'}
                    `}
                >
                    <div className="shrink-0">
                        {t.type === 'success' && <FiCheckCircle className="h-5 w-5 text-primary-base" />}
                        {t.type === 'error' && <FiXCircle className="h-5 w-5 text-red-400" />}
                        {t.type === 'info' && <FiInfo className="h-5 w-5 text-surfaces-on-5" />}
                    </div>
                    <div className="text-sm text-surfaces-on-surface">
                        {t.message}
                    </div>
                </div>
            ))}
        </div>
    );
};


