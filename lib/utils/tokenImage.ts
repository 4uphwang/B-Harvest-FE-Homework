import { BtcImage, UsdcImage, UsdtImage } from 'assets';
import { StaticImageData } from 'next/image';

/**
 * Token symbol을 받아서 해당하는 이미지를 반환하는 매핑
 */
const TOKEN_IMAGE_MAP: Record<string, StaticImageData> = {
    BTC: BtcImage,
    USDT: UsdtImage,
    USDC: UsdcImage,
} as const;

/**
 * 토큰 심볼을 기반으로 이미지를 반환.
 * @param symbol 토큰 심볼 (예: 'BTC', 'USDT', 'USDC')
 * @returns 해당 토큰의 이미지 (StaticImageData), 없으면 BTC 이미지 반환
 */
export const getTokenImage = (symbol: string): StaticImageData => {
    const normalizedSymbol = symbol.toUpperCase();
    return TOKEN_IMAGE_MAP[normalizedSymbol] || BtcImage;
};

