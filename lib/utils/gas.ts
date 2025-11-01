import { formatUnits, parseUnits } from 'viem';

/**
 * Estimate gas fee with buffer (multiplier for safety)
 */
const GAS_BUFFER = 1.2; // 20% buffer for gas price fluctuation
const DEFAULT_GAS_ESTIMATE_ETH = '0.002'; // Default: 0.002 ETH (covers approve + deposit/withdraw)

/**
 * Calculate max amount considering gas fee
 * For ERC20 tokens: gas is paid in native token (ETH), so we can use full balance
 * But we should check if user has enough ETH for gas
 * @param balance Token balance in formatted string (e.g., "100.0")
 * @param nativeBalance Native token (ETH) balance in wei
 * @param gasEstimate Estimated gas in ETH (optional, defaults to 0.002 ETH)
 * @param decimals Token decimals
 * @returns Max amount that can be used considering gas fee
 */
export function calculateMaxAmountWithGas(
    balance: string,
    nativeBalance: bigint | undefined,
    gasEstimate: string = DEFAULT_GAS_ESTIMATE_ETH,
    decimals: number = 18
): string {
    if (!balance || balance === '0.00' || balance === '0') {
        return '0.00';
    }

    try {
        const balanceNum = parseFloat(balance);
        if (isNaN(balanceNum) || balanceNum <= 0) {
            return '0.00';
        }

        // For ERC20 tokens, gas is paid in native token (ETH)
        // So we can use the full token balance
        // But if user doesn't have enough ETH for gas, they should know
        if (!nativeBalance || nativeBalance === 0n) {
            // User has no ETH for gas, but still return balance
            // The transaction will fail if gas is insufficient
            return balance;
        }

        // Check if user has enough ETH for gas
        const gasEstimateWei = parseUnits(gasEstimate, 18);
        const gasWithBuffer = (gasEstimateWei * BigInt(Math.round(GAS_BUFFER * 1000))) / 1000n;
        
        if (nativeBalance < gasWithBuffer) {
            // User doesn't have enough ETH for gas
            // Still return balance, but transaction will fail
            // This is handled by the error handling logic
            return balance;
        }

        // User has enough ETH for gas, return full token balance
        return balance;
    } catch (e) {
        console.error('Error calculating max amount with gas:', e);
        return '0.00';
    }
}

/**
 * Calculate max amount for native token (ETH) considering gas fee
 * @param balance Balance in formatted string (e.g., "1.0")
 * @param nativeBalance Native token balance in wei
 * @param gasEstimate Estimated gas in ETH string (optional, defaults to 0.002 ETH)
 * @returns Max amount that can be used considering gas fee
 */
export function calculateMaxNativeAmountWithGas(
    balance: string,
    nativeBalance: bigint | undefined,
    gasEstimate: string = DEFAULT_GAS_ESTIMATE_ETH
): string {
    if (!balance || balance === '0.00' || balance === '0') {
        return '0.00';
    }

    if (!nativeBalance || nativeBalance === 0n) {
        return '0.00';
    }

    try {
        const balanceNum = parseFloat(balance);
        if (isNaN(balanceNum) || balanceNum <= 0) {
            return '0.00';
        }

        // Add buffer to gas estimate
        const gasEstimateWei = parseUnits(gasEstimate, 18);
        const gasWithBuffer = (gasEstimateWei * BigInt(Math.round(GAS_BUFFER * 1000))) / 1000n;
        
        // Convert native balance to formatted string for comparison
        const nativeBalanceFormatted = formatUnits(nativeBalance, 18);
        const nativeBalanceNum = parseFloat(nativeBalanceFormatted);
        
        // If balance is less than gas estimate, return 0
        if (nativeBalanceNum <= 0) {
            return '0.00';
        }

        const gasEstimateFormatted = formatUnits(gasWithBuffer, 18);
        const gasEstimateNum = parseFloat(gasEstimateFormatted);

        // Subtract gas estimate from balance
        const maxAmount = Math.max(0, nativeBalanceNum - gasEstimateNum);
        
        // Format according to the balance's decimal places
        const balanceDecimalPlaces = balance.split('.')[1]?.length || 6;
        return maxAmount.toFixed(Math.min(balanceDecimalPlaces, 6));
    } catch (e) {
        console.error('Error calculating max native amount with gas:', e);
        return '0.00';
    }
}

