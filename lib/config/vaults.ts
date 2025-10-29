import { VAULT_ABI } from 'lib/config/abi/VaultABI';
import { Abi } from 'viem';
import { getTokenBySymbol, Token } from './tokens';

export type Vault = {
    name: string;
    symbol: string;
    vaultAddress: `0x${string}`;
    vaultAbi: Abi;
    underlyingToken: Token;
};

const ADDRESSES = {
    BTC_VAULT: '0x194956e5805f85502ab05bcb1106cbe0252cd868',
    USDT_VAULT: '0x69a7b931d874a0ef05a377c73cee3e530b0b1c58',
    USDC_VAULT: '0x815c0eb6846c0ca9da7c41aa93f60fe5277114d0',
} as const;

export const VAULT_LIST: Vault[] = [
    {
        name: 'BTC Vault',
        symbol: 'BTC',
        vaultAddress: ADDRESSES.BTC_VAULT,
        vaultAbi: VAULT_ABI as Abi,
        underlyingToken: getTokenBySymbol('BTC')!,
    },
    {
        name: 'USDT Vault',
        symbol: 'USDT',
        vaultAddress: ADDRESSES.USDT_VAULT,
        vaultAbi: VAULT_ABI as Abi,
        underlyingToken: getTokenBySymbol('USDT')!,
    },
    {
        name: 'USDC Vault',
        symbol: 'USDC',
        vaultAddress: ADDRESSES.USDC_VAULT,
        vaultAbi: VAULT_ABI as Abi,
        underlyingToken: getTokenBySymbol('USDC')!,
    },
];