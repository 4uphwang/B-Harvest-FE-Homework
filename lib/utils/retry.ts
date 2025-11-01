'use client';

/**
 * Promise 기반으로 일정 시간 대기하는 유틸 함수
 * 유틸 함수로 분리되었으므로 setTimeout 사용
 * @param ms 대기할 시간 (밀리초)
 * @returns Promise
 */
export async function delay(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

/**
 * 재시도 옵션 타입
 */
export interface RetryOptions {
    /** 최대 재시도 횟수 */
    maxRetries?: number;
    /** 재시도 간 대기 시간 (밀리초) */
    retryDelay?: number;
    /** 재시도 간 지연 시간을 점진적으로 증가시킬지 여부 */
    exponentialBackoff?: boolean;
    /** 재시도 전 실행할 로그 함수 */
    onRetry?: (attempt: number, error?: any) => void;
}

/**
 * 조건을 만족할 때까지 재시도하는 함수
 * @param condition 조건 함수 (true를 반환하면 성공)
 * @param options 재시도 옵션
 * @returns Promise<void> - 조건이 만족되면 resolve
 * @throws 마지막 시도에서도 조건을 만족하지 못하면 에러를 throw
 */
export async function retryUntilCondition(
    condition: () => Promise<boolean> | boolean,
    options: RetryOptions = {}
): Promise<void> {
    const {
        maxRetries = 5,
        retryDelay = 200,
        exponentialBackoff = false,
        onRetry,
    } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await condition();

        if (result) {
            // 조건을 만족했으므로 성공
            return;
        }

        // 마지막 시도가 아니면 대기 후 재시도
        if (attempt < maxRetries - 1) {
            // Exponential backoff: 각 재시도마다 대기 시간을 2배로 증가
            const currentDelay = exponentialBackoff
                ? retryDelay * Math.pow(2, attempt)
                : retryDelay;

            onRetry?.(attempt + 1);
            await delay(currentDelay);
        }
    }

    // 모든 재시도 후에도 조건을 만족하지 못함
    throw new Error(`Condition not met after ${maxRetries} attempts`);
}

/**
 * 함수를 재시도하는 헬퍼 함수
 * @param fn 실행할 함수
 * @param options 재시도 옵션
 * @returns 함수 실행 결과
 * @throws 모든 재시도 실패 시 마지막 에러를 throw
 */
export async function retryFunction<T>(
    fn: () => Promise<T> | T,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 5,
        retryDelay = 200,
        exponentialBackoff = false,
        onRetry,
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // 마지막 시도가 아니면 대기 후 재시도
            if (attempt < maxRetries - 1) {
                // Exponential backoff: 각 재시도마다 대기 시간을 2배로 증가
                const currentDelay = exponentialBackoff
                    ? retryDelay * Math.pow(2, attempt)
                    : retryDelay;

                onRetry?.(attempt + 1, error);
                await delay(currentDelay);
            }
        }
    }

    // 모든 재시도 실패
    throw lastError || new Error(`Function failed after ${maxRetries} attempts`);
}

