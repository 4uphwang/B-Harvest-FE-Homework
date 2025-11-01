import { COINGECKO_ID_MAP } from "lib/config/coingecko";
import { CURRENCY_MAP } from "lib/config/currencyConfig";
import { CoinPrices, Currency } from "lib/types/common";
import { chains, config } from "provider/config";
import { formatUnits } from "viem";
import { switchChain } from "wagmi/actions";

/**
 * 주소 문자열을 좌우 지정된 길이로 자르고 가운데를 "..."으로 생략.
 * @param address 원본 주소 문자열 (예: "0x1234567890abcdef1234567890abcdef12345678")
 * @param startLength 주소 시작 부분에서 유지할 길이 (예: 6)
 * @param endLength 주소 끝 부분에서 유지할 길이 (예: 4)
 * @returns 자르기 처리된 주소 문자열 (예: "0x1234...5678")
 */
export const truncateAddress = (
    address: `0x${string}`,
    startLength: number,
    endLength: number,
): string => {
    if (!address || typeof address !== 'string' || address.length === 0) {
        return '';
    }

    const totalLength = address.length;
    const requiredLength = startLength + endLength + 3;

    if (totalLength <= requiredLength) {
        return address;
    }

    const start = address.substring(0, startLength);
    const end = address.substring(totalLength - endLength);

    return `${start}...${end}`;
};

/**
 * float 문자열을 사용자 친화적인 통화(숫자) 형식으로 포매팅합니다.
 * (예: "50.14700807632599406" -> "50,147,008.076")
 * * @param amountString useVaultAssets에서 받은 포매팅된 문자열
 * @param maxDecimals 표시할 최대 소수점 자릿수 (기본값: 4)
 * @returns 쉼표가 포함된 포매팅된 문자열
 */
export const formatCurrency = (
    amountString: string | undefined,
    maxDecimals: number = 4
): string => {
    // 1. 입력 유효성 검사 및 0 처리
    if (!amountString || amountString === '0' || Number(amountString) === 0) {
        return '0';
    }

    const value = Number(amountString);

    // 2. Intl.NumberFormat을 사용하여 로케일 기반으로 쉼표(,) 및 소수점 처리
    return new Intl.NumberFormat('en-US', {
        // useGrouping: true 는 쉼표를 사용하도록 합니다. (기본값 true)
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
    }).format(value);
};



export const getPrice = (symbol: string, prices: CoinPrices | undefined, currency: Currency): number => {
    if (!prices) return 0;

    const coingeckoId = COINGECKO_ID_MAP[symbol];

    if (!coingeckoId) {
        console.warn(`[PriceLookup] No CoinGecko ID defined for symbol: ${symbol}`);
        return 0;
    }

    const priceRecord = prices[coingeckoId];

    return priceRecord?.[currency] || 0;
};

// 축약 숫자 포매터 (통화 인지형):
//  - USD: 1,200 -> 1.2k, 7,450,000 -> 7.45m
//  - KRW: 12,000 -> 1.2만, 74,500,000 -> 7.45억
type CompactFormatOptions = { currency?: Currency };

const COMPACT_UNITS: Record<Currency, Array<{ threshold: number; unit: string }>> = {
    usd: [
        { threshold: 1e12, unit: 't' },
        { threshold: 1e9, unit: 'b' },
        { threshold: 1e6, unit: 'm' },
        { threshold: 1e3, unit: 'k' },
    ],
    krw: [
        { threshold: 1e12, unit: '조' },
        { threshold: 1e8, unit: '억' },
        { threshold: 1e4, unit: '만' },
    ],
};

export const formatCompactNumber = (
    value: number,
    decimals: number = 2,
    options?: CompactFormatOptions,
): string => {
    if (!isFinite(value)) return '0';

    const currency: Currency | undefined = options?.currency;
    const units = currency ? COMPACT_UNITS[currency] : COMPACT_UNITS.usd;

    const abs = Math.abs(value);
    let unit = '';
    let divisor = 1;

    for (const { threshold, unit: u } of units) {
        if (abs >= threshold) {
            divisor = threshold;
            unit = u;
            break;
        }
    }

    const compact = value / divisor;
    const fixed = divisor === 1 ? value.toFixed(decimals) : compact.toFixed(decimals);
    // 불필요한 0과 소수점 제거
    const trimmed = fixed.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/g, '');
    return `${trimmed}${unit}`;
};

export const formatCompactCurrency = (currencySymbol: string, value: number, decimals: number = 2): string => {
    // 심볼로부터 통화 키를 역탐색 (미스매치 시 기본 USD)
    const currencyEntry = Object.entries(CURRENCY_MAP).find(([_, sym]) => sym === currencySymbol);
    const currencyKey = (currencyEntry?.[0] as Currency) || 'usd';
    return `${currencySymbol}${formatCompactNumber(value, decimals, { currency: currencyKey })}`;
};

/**
 * Vault APR 값을 퍼센트 형식으로 포맷팅합니다.
 * APR은 컨트랙트에서 이미 퍼센트 단위로 반환됩니다 (예: 500 = 5.00%).
 * @param aprBigInt BigInt 타입의 APR 값
 * @returns 포맷팅된 APR 문자열 (예: "5.00")
 */
export const formatApr = (aprBigInt: bigint | undefined): string => {
    if (!aprBigInt || aprBigInt === 0n) return '0.00';
    try {
        // APR은 decimals=0으로 저장되므로 formatUnits(aprBigInt, 0) 사용
        const formattedApr = formatUnits(aprBigInt, 0);
        // 소수점 2자리로 포맷팅
        return Number(formattedApr).toFixed(2);
    } catch {
        return '0.00';
    }
};


/**
 * 사용자에게 Base Sepolia 네트워크로 전환하도록 요청하는 순수 비동기 함수.
 * @returns {boolean} 전환 요청 성공 여부
 */
export async function switchNetworkToTarget(): Promise<boolean> {
    try {
        console.log(`Base Sepolia (ID: ${chains[0].id})로 전환 요청 중...`);

        await switchChain(config, { chainId: chains[0].id });

        console.log("네트워크 전환 요청 성공.");
        return true;
    } catch (error) {
        // 사용자가 팝업을 거절하거나, 네트워크를 추가해야 하는 경우 등의 에러 처리
        console.error("네트워크 전환 실패:", error);

        // 🚨 참고: 원하는 체인이 MetaMask에 등록되어 있지 않은 경우,
        // EIP-3085를 사용하여 wallet_addEthereumChain을 먼저 요청해야 할 수 있습니다.
        return false;
    }
}