'use client';

import { BackIcon } from 'assets';
import { useAtom } from 'jotai';
import { supplyInputAtom } from 'lib/state/supplyInput';
import React from 'react';

interface NumericKeypadProps {
    decimals?: number;
    disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ decimals = 6, disabled = false }) => {
    const [input, setInput] = useAtom(supplyInputAtom);

    const handleKeyClick = (value: string) => {
        // 입력 값이 null이거나 '0.00'일 경우 '0'으로 초기화
        const cleanInput = (input === '0.00' || input === '0') ? '' : input;

        if (value === 'DEL') {
            // 한 글자 삭제
            setInput(prev => {
                const next = prev.slice(0, -1);
                if (next === '' || next === '0' || next === '0.') return '0.00';
                // 끝이 '.'이면 제거
                return next.endsWith('.') ? next.slice(0, -1) : next;
            });
        } else if (value === '.') {
            // .이 없으면 추가
            if (!input.includes('.')) {
                setInput(prev => prev + (prev === '' ? '0.' : '.'));
            }
        } else {
            // 숫자 입력
            const newRawValue = cleanInput + value;
            // 선행 0 제거 (01 -> 1, 0.1 -> 0.1)
            const newValue = newRawValue.startsWith('0') && newRawValue.length > 1 && !newRawValue.includes('.')
                ? newRawValue.slice(1)
                : newRawValue;

            // 소수 자릿수 제한
            const parts = newValue.split('.');
            if (parts.length === 2 && parts[1].length > decimals) {
                setInput(parts[0] + '.' + parts[1].slice(0, decimals));
                return;
            }

            setInput(newValue);
        }
    };

    // 키보드 레이아웃 (Figma 참고)
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'];

    return (
        <div className={`grid grid-cols-3 py-[6px] bg-black text-surfaces-on-8 mb-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {keys.map(key => (
                <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    disabled={disabled}
                    className="h-16 text-2xl p-[10px] font-normal rounded-lg active:bg-surfaces-on-background active:text-black transition disabled:cursor-not-allowed"
                >
                    {key === 'DEL' ? <BackIcon className="w-6 h-6 mx-auto" /> : key}
                </button>
            ))}
        </div>
    );
};
