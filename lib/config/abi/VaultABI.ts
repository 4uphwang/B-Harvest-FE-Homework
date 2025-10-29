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
        name: 'totalAssets', // ERC 4626 기본 함수
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{
            name: '',
            type: 'uint256'
        }],
    },
] as const;