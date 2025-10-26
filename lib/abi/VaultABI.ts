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
        name: 'totalAssets',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{
            name: '',
            type: 'uint256'
        }],
    },
] as const;