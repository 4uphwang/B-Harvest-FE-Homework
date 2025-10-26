import { FAKE_TOKEN_ABI } from 'lib/abi/FakeTokenABI';
import { Abi } from 'viem';

export interface Token {
    name: string;
    symbol: string;
    address: `0x${string}`;
    decimals: number;
    abi: Abi;
}

export const FAKE_TOKENS: Token[] = [
    {
        name: 'Fake Bitcoin',
        symbol: 'FBTC',
        address: '0x1cd5282989188818db1422a5a14244bc690a400c',
        decimals: 18,
        abi: FAKE_TOKEN_ABI,
    },
    {
        name: 'Fake USDT',
        symbol: 'FUSDT',
        address: '0x0866b8dea93e8db261a23a6ffef8d089a6886208',
        decimals: 6,
        abi: FAKE_TOKEN_ABI,
    },
    {
        name: 'Fake USDC',
        symbol: 'FUSDC',
        address: '0xdc0aeb396f79dfbedbe9c72dceda5d6d9295c085',
        decimals: 6,
        abi: FAKE_TOKEN_ABI,
    },
];

export const getTokenBySymbol = (symbol: string) => {
    return FAKE_TOKENS.find(token => token.symbol === symbol);
};