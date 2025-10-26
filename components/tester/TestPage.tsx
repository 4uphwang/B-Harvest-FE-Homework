import FaucetAndBalanceTester from "components/tester/FaucetAndBalanceTester";
import VaultPriceTester from "components/tester/VaultPriceTester";

export default function TestPage() {
    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* 💡 컨테이너 크기 증가 */}
            <h1 className="text-3xl font-bold mb-8">Web3 과제 통합 테스트 페이지</h1>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Vault 가격 및 TVL 시각화</h2>
                <VaultPriceTester />
            </div>

            {/* 기존 Faucet 섹션 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-3">토큰 Faucet 및 잔액</h3>
                <FaucetAndBalanceTester />
            </div>
        </div>
    );
}

