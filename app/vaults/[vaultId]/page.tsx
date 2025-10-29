import { SupplyPage } from 'components/vaults/supply/SupplyPage';
import { VAULT_LIST } from 'lib/config/vaults';

interface SupplyDetailPageProps {
    params: {
        vaultId: string;
    };
}

export default function SupplyDetailPage({ params }: SupplyDetailPageProps) {
    const vaultSymbol = params.vaultId.toUpperCase();

    const targetVault = VAULT_LIST.find(v => v.symbol === vaultSymbol);

    if (!targetVault) {
        return (
            <div className="p-10 text-red-500 text-center">
                Vault '{vaultSymbol}'을 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <SupplyPage targetVault={targetVault} />
    );
}
