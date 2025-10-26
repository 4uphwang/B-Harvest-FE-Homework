"use client";
import { FAKE_TOKENS } from 'lib/config/tokens';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { TokenRow } from './TokenRow';

const Web3Status = dynamic(() => import('components/tester/Web3Status'), {
    ssr: false,
    loading: () => <p>Loading wallet status...</p>,
});

// 메인 테스트 컴포넌트
function FaucetAndBalanceTester() {
    const { isConnected } = useAccount();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4">토큰 Faucet 및 잔액</h2>

                <div className="space-y-4">
                    {FAKE_TOKENS.map((token) => (
                        <TokenRow
                            key={token.address}
                            token={token}
                            isConnected={isConnected} // props로 전달
                        />
                    ))}
                </div>
            </div>


            <div className="mb-8">
                <Web3Status />
            </div>
        </div>
    );
}

export default FaucetAndBalanceTester; // 동적 임포트로 감싸져서 사용됨

