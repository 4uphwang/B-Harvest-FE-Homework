'use client';

import { Token } from 'lib/config/tokens';
import { useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useBalance, useWriteContract } from 'wagmi';

const TokenBalance = ({ token }: { token: Token }) => {
    const { address, isConnected } = useAccount();

    const { data, isLoading, isError } = useBalance({
        address,
        token: token.address,
        query: {
            enabled: isConnected,
            refetchInterval: 4_000,
        }
    });

    const balance = data?.formatted || '0.00';
    const symbol = data?.symbol || token.symbol;

    if (!address) return <span className="text-gray-500">지갑 연결 필요</span>;
    if (isLoading) return <span className="text-gray-500">로딩...</span>;
    if (isError) return <span className="text-red-500">잔액 오류!</span>;

    return <span className="font-mono">{balance} {symbol}</span>;
};


// 💡 TokenRow 컴포넌트 정의
type TokenRowProps = {
    token: Token;
    isConnected: boolean;
};

export const TokenRow = ({ token, isConnected }: TokenRowProps) => {
    const { address } = useAccount();
    const [faucetAmount, setFaucetAmount] = useState('0.05');
    const { writeContract, isPending } = useWriteContract();

    // Faucet 실행 핸들러
    const handleFaucet = () => {
        if (!address || !faucetAmount) return;

        try {
            // Viem parseUnits를 사용하여 입력 금액을 BigInt로 변환
            const amountBigInt = parseUnits(faucetAmount as `${number}`, token.decimals);

            writeContract(
                {
                    address: token.address,
                    abi: token.abi,
                    functionName: 'faucet',
                    args: [address, amountBigInt],
                },
                {
                    onSuccess: () => {
                        alert(`${token.symbol} Faucet 성공!`);
                        // useBalance (watch: true)가 자동 업데이트 처리
                    },
                    onError: (error) => {
                        console.error('Faucet 실패:', error);
                        alert(`Faucet 실패: ${error.message}`);
                    }
                }
            );
        } catch (e: any) {
            alert(`입력 오류: ${e.message}`);
        }
    };

    return (
        <div className="flex justify-between items-center p-3 border rounded">
            <div className="flex-1">
                <p className="font-medium">{token.name} ({token.symbol})</p>
                <p className="text-sm text-gray-600">잔액: <TokenBalance token={token} /></p>
            </div>
            <div className='flex flex-col mr-5'>
                <label className="font-medium">Faucet Amount:</label>
                <input
                    type="number"
                    value={faucetAmount}
                    onChange={(e) => setFaucetAmount(e.target.value)}
                    placeholder="100.0"
                    className="p-2 border rounded min-w-16"
                    min="0.01"
                />
            </div>
            <button
                onClick={handleFaucet}
                disabled={!isConnected || isPending || !faucetAmount || parseFloat(faucetAmount) <= 0}
                className={`px-4 py-2 rounded transition 
                    ${isConnected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
                {isPending ? `⏳ Faucet 진행 중...` : 'Faucet 받기'}
            </button>
        </div>
    );
};