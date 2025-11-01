import { SupplyPage } from 'components/vaults/supply/SupplyPage';
import { WithdrawPage } from 'components/vaults/withdraw/WithdrawPage';
import { VAULT_LIST } from 'lib/config/vaults';

interface VaultDetailPageProps {
    params: Promise<{
        vaultId: string;
    }>;
    searchParams: Promise<{
        action?: string;
    }>;
}

export default async function VaultDetailPage({ params, searchParams }: VaultDetailPageProps) {
    const { vaultId } = await params;
    const { action } = await searchParams;
    const vaultSymbol = vaultId.toUpperCase();

    const targetVault = VAULT_LIST.find(v => v.symbol === vaultSymbol);

    if (!targetVault) {
        return (
            <div className="p-10 text-red-500 text-center">
                Vault '{vaultSymbol}' not found.
            </div>
        );
    }

    if (action === 'withdraw') {
        return (
            <WithdrawPage targetVault={targetVault} />
        );
    }

    return (
        <SupplyPage targetVault={targetVault} />
    );
}
