'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'deposit';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    let baseStyles = "px-4 py-2 font-semibold rounded-lg transition duration-200 shadow-md";

    switch (variant) {
        case 'primary':
            baseStyles += " bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400";
            break;
        case 'secondary':
            baseStyles += " bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-400";
            break;
        case 'deposit':
            baseStyles += " bg-primary-base text-black hover:bg-green-600 text-lg disabled:bg-gray-600";
            break;
        default: // ghost
            baseStyles += " bg-transparent text-indigo-600 hover:bg-indigo-50 disabled:text-gray-400";
            break;
    }

    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};
