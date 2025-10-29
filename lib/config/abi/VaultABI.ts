export const VAULT_ABI = [
    {
        name: 'getAPR',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{
            internalType: 'uint256',
            name: '',
            type: 'uint256'
        }],
    }, {
        name: 'totalAssets', // ERC 4626 기본 함수 (TVL 수량)
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{
            name: '',
            type: 'uint256'
        }],
    },
    {
        name: 'balanceOf', // ERC-20 표준: Shares 잔액 조회
        type: 'function',
        stateMutability: 'view',
        inputs: [{
            internalType: 'address',
            name: 'account',
            type: 'address'
        }],
        outputs: [{
            internalType: 'uint256',
            name: '',
            type: 'uint256'
        }],
    },
    {
        name: 'convertToAssets', // ERC-4626 표준: Shares를 Assets로 환산
        type: 'function',
        stateMutability: 'view',
        inputs: [{
            internalType: 'uint256',
            name: 'shares',
            type: 'uint256'
        }],
        outputs: [{
            internalType: 'uint256',
            name: 'assets',
            type: 'uint256'
        }],
    },
    {
        name: 'deposit',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{
            internalType: 'uint256',
            name: 'assets',
            type: 'uint256'
        }, {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
        }],
        outputs: [{
            internalType: 'uint256',
            name: 'shares',
            type: 'uint256'
        }],
    },
] as const;