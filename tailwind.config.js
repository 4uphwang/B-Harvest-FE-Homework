/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './providers/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',

                'primary-base': '#E6F5AA',
                'id-ap': '#E0FF63',
                'primary-on-base': '#17330D',

                surfaces: {
                    'on-2': '#7A817A',
                    'on-3': '#8C938C',
                    'on-4': '#9DA59D',
                    'on-5': '#AFB6AF',
                    'on-6': '#C2C8C2',
                    'on-8': '#DFE2DF',
                    'on-surface': '#ECEFEC',
                    'on-background': '#ffffff',

                    'base-2': '#1C1D1C'
                },

                darker: '#2F332F'
            },
            fontSize: {
                md: '16px',
            }
        },
    },
    plugins: [],
}