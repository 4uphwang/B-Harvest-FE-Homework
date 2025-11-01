/**
 * Check if error is user rejection (transaction cancelled by user)
 */
export function isUserRejectedError(error: any): boolean {
    if (!error) return false;

    // Wagmi/Viem error codes
    const code = error?.code;
    const name = error?.name;
    const message = error?.message?.toLowerCase() || '';
    const shortMessage = error?.shortMessage?.toLowerCase() || '';
    const reason = error?.reason?.toLowerCase() || '';
    const combinedMessage = `${message} ${shortMessage} ${reason}`;

    // Common user rejection patterns
    if (
        code === 4001 || // MetaMask user rejection
        code === 'ACTION_REJECTED' || // WalletConnect
        name === 'UserRejectedRequestError' ||
        name === 'RejectedRequestError' ||
        combinedMessage.includes('user rejected') ||
        combinedMessage.includes('user denied') ||
        combinedMessage.includes('user cancelled') ||
        combinedMessage.includes('rejected') ||
        combinedMessage.includes('denied')
    ) {
        return true;
    }

    return false;
}

/**
 * Check if error is insufficient balance error
 */
export function isInsufficientBalanceError(error: any): boolean {
    if (!error) return false;

    const message = error?.message?.toLowerCase() || '';
    const shortMessage = error?.shortMessage?.toLowerCase() || '';
    const reason = error?.reason?.toLowerCase() || '';
    const data = error?.data?.message?.toLowerCase() || '';
    const combinedMessage = `${message} ${shortMessage} ${reason} ${data}`;

    // Common insufficient balance patterns
    if (
        combinedMessage.includes('insufficient balance') ||
        combinedMessage.includes('insufficient funds') ||
        combinedMessage.includes('balance too low') ||
        combinedMessage.includes('transfer amount exceeds balance') ||
        combinedMessage.includes('exceeds balance') ||
        combinedMessage.includes('erc20: transfer amount exceeds balance') ||
        (combinedMessage.includes('execution reverted') && (
            combinedMessage.includes('balance') ||
            combinedMessage.includes('insufficient')
        ))
    ) {
        return true;
    }

    return false;
}

/**
 * Get user-friendly error message
 * Always returns a generic message to avoid exposing technical details
 */
export function getErrorMessage(error: any, defaultMessage: string = 'Transaction failed due to an unexpected error'): string {
    if (!error) return defaultMessage;

    if (isUserRejectedError(error)) {
        // User rejection doesn't need an error message (user already cancelled it)
        return '';
    }

    if (isInsufficientBalanceError(error)) {
        return 'Insufficient balance';
    }

    // Always return generic message for all other errors
    return defaultMessage;
}

