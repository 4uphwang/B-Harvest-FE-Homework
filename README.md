# B-Harvest Frontend Homework

Web3 기반 Vault 애플리케이션 프론트엔드 프로젝트입니다. Base Sepolia 테스트넷에서 ERC-4626 Vault 상품을 통해 사용자가 토큰을 예치하고 출금할 수 있는 기능을 제공합니다.

## 📋 프로젝트 개요

이 프로젝트는 다음과 같은 기능을 구현합니다:

1. **볼트 가격 시각화**: CoinGecko API를 통해 각 토큰(ETH, BTC, USDT, USDC)의 가격을 조회하고, 각 Vault의 Total Supply Value를 표시합니다.
2. **지갑 연결**: MetaMask, OKX Wallet, Backpack Wallet 세 가지 지갑 연결을 지원합니다.
3. **Deposit/Withdraw**: ERC-4626 표준을 따르는 Vault에 토큰을 예치하고 출금할 수 있습니다.

## 🛠 기술 스택

### Core
- **Next.js** 15.3.2 (App Router)
- **React** 19.0.0
- **TypeScript** 5.x

### Styling
- **Tailwind CSS** 3.4.17

### State Management
- **Jotai** 2.15.0: 로컬 상태 관리 (currency, input 값 등)
- **TanStack Query** 5.90.5: 서버 상태 관리 (가격 데이터, 블록체인 데이터)
- **Context API**: 모달 상태 관리 (지갑 연결, 트랜잭션 모달)

### Web3
- **Wagmi** 2.18.2: React Hooks for Ethereum
- **Viem** 2.x: TypeScript Ethereum 라이브러리
- **RainbowKit** 2.2.9: 지갑 연결 UI 컴포넌트

### Deployment
- **SST** 3.17.21: AWS 배포를 위한 인프라 코드

### Additional
- **React Icons** 5.x: 아이콘 라이브러리
- **SVGR**: SVG를 React 컴포넌트로 변환

## 📁 프로젝트 구조

```
b-harvest-fe/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── prices/          # CoinGecko API 프록시
│   ├── vaults/              # Vault 관련 페이지
│   │   ├── [vaultId]/       # 개별 Vault 상세 페이지
│   │   └── my/              # 내 Vault 목록 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 홈 페이지 (리다이렉트)
│
├── components/              # React 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── BottomNav.tsx   # 하단 네비게이션
│   │   └── EarnHeader.tsx  # 상단 헤더
│   ├── ui/                  # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Skeleton.tsx
│   │   ├── ToastContainer.tsx
│   │   └── TransactionModal*.tsx
│   ├── vaults/              # Vault 관련 컴포넌트
│   │   ├── supply/          # 예금 기능
│   │   │   ├── SupplyPage.tsx
│   │   │   ├── DepositActionButton.tsx
│   │   │   └── NumericKeypad.tsx
│   │   ├── withdraw/        # 출금 기능
│   │   │   ├── WithdrawPage.tsx
│   │   │   ├── WithdrawActionButton.tsx
│   │   │   └── WithdrawNumericKeypad.tsx
│   │   ├── VaultCard.tsx
│   │   ├── VaultListContainer.tsx
│   │   └── UserSummaryCard.tsx
│   └── wallet/              # 지갑 연결 관련
│       ├── ConnectWallet.tsx
│       └── WalletModal*.tsx
│
├── lib/                      # 비즈니스 로직 및 유틸리티
│   ├── config/              # 설정 파일
│   │   ├── abi/             # 스마트 컨트랙트 ABI
│   │   │   ├── VaultABI.ts
│   │   │   └── FakeTokenABI.ts
│   │   ├── tokens.ts        # 토큰 설정
│   │   ├── vaults.ts        # Vault 설정
│   │   ├── coingecko.ts     # CoinGecko 설정
│   │   └── currencyConfig.ts
│   ├── hooks/               # 커스텀 훅
│   │   ├── useCoinPrices.ts      # 가격 조회
│   │   ├── useVaultAssets.ts     # Vault 자산 조회
│   │   ├── useVaultAprs.ts       # APR 조회
│   │   ├── useVaultBalance.ts   # Vault 잔액 조회
│   │   ├── useDeposit.ts        # 예금 처리
│   │   ├── useWithdraw.ts       # 출금 처리
│   │   ├── useAllowance.ts      # Approve 처리
│   │   └── useUserSummary.ts    # 사용자 요약 정보
│   ├── state/               # Jotai atoms
│   │   ├── currency.ts
│   │   ├── supplyInput.ts
│   │   ├── withdrawInput.ts
│   │   └── userSummaryRefetch.ts
│   └── utils/               # 유틸리티 함수
│       ├── error.ts         # 에러 처리
│       ├── gas.ts           # 가스 계산
│       ├── retry.ts         # 재시도 로직
│       └── wallet.ts        # 지갑 관련 유틸
│
├── provider/                # React Provider 설정
│   ├── Web3Provider.tsx    # Wagmi + TanStack Query
│   ├── JotaiProvider.tsx   # Jotai
│   └── config.ts           # Wagmi 설정
│
└── assets/                  # 정적 자원
    ├── icons/              # SVG 아이콘
    └── image/              # 이미지 파일
```

## 🚀 시작하기

### Prerequisites

- Node.js 18.x 이상
- yarn 또는 npm
- MetaMask, OKX Wallet, 또는 Backpack Wallet (Base Sepolia 테스트넷 지원)

### 설치

```bash
# 의존성 설치
yarn install
# 또는
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정합니다:

```env
# CoinGecko API Key
COINGECKO_API_KEY=your_api_key_here
```

### 개발 서버 실행

```bash
yarn dev
# 또는
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 프로덕션 빌드

```bash
yarn build
yarn start
```

## 📝 주요 기능

### 1. 볼트 가격 시각화

- **CoinGecko API 연동**: 서버 API Route를 통해 CoinGecko API를 프록시하여 CORS 문제를 해결하고 API 키를 보호합니다.
- **Total Supply Value**: 각 Vault의 `totalAssets()`를 조회하고 토큰 가격을 곱하여 총 공급 가치를 계산합니다.
- **자동 업데이트**: TanStack Query의 `refetchInterval`을 사용하여 주기적으로 가격을 업데이트합니다.
- **Skeleton UI**: 로딩 중 Skeleton UI를 표시하여 부드러운 사용자 경험을 제공합니다.

```typescript
// 가격 조회 예시
const { data: prices, isLoading, isError } = useCoinPrices(currency);

// Total Supply Value 계산
const { totalSupplyValue, isLoading: isLoadingSupply } = useTotalSupplyValue();
```

### 2. 지갑 연결

- **지원 지갑**: MetaMask, OKX Wallet, Backpack Wallet
- **네트워크 자동 전환**: Base Sepolia 네트워크가 아닌 경우 자동으로 전환을 요청합니다.
- **커스텀 모달**: RainbowKit 기반의 커스텀 지갑 선택 모달을 구현했습니다.

```typescript
// 지갑 연결 예시
const { isConnected, address } = useAccount();
const { connectAsync, connectors } = useConnect();
```

### 3. Deposit (예금)

- **ERC-20 Approve**: Vault에 토큰을 전송하기 전에 `approve` 트랜잭션을 먼저 처리합니다.
- **ERC-4626 Deposit**: `deposit` 함수를 호출하여 토큰을 예치합니다.
- **가스 계산**: 가스 비용을 고려한 최대 입금 가능 금액을 계산합니다.
- **트랜잭션 모니터링**: 트랜잭션 상태를 실시간으로 추적하고 사용자에게 피드백을 제공합니다.

```typescript
// Deposit 예시
const { depositAsync, isWriting, isConfirming, isSuccess } = useDeposit({
  vault: targetVault,
  amountString: inputAmount
});
```

### 4. Withdraw (출금)

- **ERC-4626 Withdraw**: `withdraw` 함수를 호출하여 예치된 토큰을 출금합니다.
- **Assets 변환**: Vault Shares를 Assets로 변환하여 실제 받을 수 있는 토큰 양을 계산합니다.
- **가스 계산**: 출금 시에도 가스 비용을 고려합니다.

```typescript
// Withdraw 예시
const { withdrawAsync, isWriting, isConfirming, isSuccess } = useWithdraw({
  vault: targetVault,
  amountString: inputAmount
});
```

## 🏗 설계 결정 사항

### 1. API 오류 재시도 방식

#### TanStack Query의 내장 재시도 기능 활용
- **이유**: 서버 상태 관리와 재시도 로직을 함께 처리할 수 있어 코드가 간결하고 유지보수가 용이합니다.
- **구현**: `retry: 3`, `staleTime: 5000`, `refetchInterval: 60000` 등으로 설정하여 적절한 업데이트 주기와 재시도를 관리합니다.

```typescript
// lib/hooks/useCoinPrices.ts
export function useCoinPrices(currency: Currency = 'usd') {
  return useQuery<CoinPrices, Error>({
    queryKey: ['coinPrices', currency],
    queryFn: () => fetchPricesFromServer(currency),
    staleTime: 5000,
    retry: 3,                       // 3번 재시도
    refetchInterval: 1000 * 60 * 1, // 1분마다 백그라운드 업데이트
  });
}
```

#### 서버 API Route를 통한 CoinGecko API 프록시
- **이유**: 
  - CORS 문제 해결
  - API 키 보안 강화 (클라이언트에 노출 방지)
  - 서버에서 캐싱 및 에러 처리 가능

```typescript
// app/api/prices/route.ts
export async function GET(request: NextRequest) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cg-demo-api-key': COINGECKO_API_KEY,
    },
    next: { revalidate: 60 } // 60초마다 데이터 갱신
  });
  // ...
}
```

### 2. 상태 관리 방식

#### Jotai (로컬 상태)
- **사용 범위**: currency 선택, 입력 값, UI 상태 등
- **이유**: 
  - 간단한 API로 빠른 개발
  - TypeScript와의 좋은 통합
  - 컴포넌트별로 필요한 atom만 구독하여 불필요한 리렌더링 최소화

```typescript
// lib/state/currency.ts
export const currencyAtom = atom<Currency>('usd');
export const currencySymbolAtom = atom((get) => 
  CURRENCY_MAP[get(currencyAtom)]
);
```

#### TanStack Query (서버 상태)
- **사용 범위**: 가격 데이터, 블록체인 데이터 등
- **이유**:
  - 캐싱, 재시도, 백그라운드 업데이트 등이 자동으로 처리됨
  - 서버 상태의 로딩, 에러 상태를 일관되게 관리 가능

#### Context API (모달 상태)
- **사용 범위**: 지갑 연결 모달, 트랜잭션 모달
- **이유**: 모달의 열림/닫힘 상태와 같은 단순한 전역 상태는 Context API로 충분

### 3. 컴포넌트 구조

#### 기능별 폴더 분리
- **supply/**, **withdraw/**: 예금/출금 관련 컴포넌트를 별도 폴더로 분리하여 관심사 분리
- **각 기능의 독립성**: 예금과 출금 기능이 서로 독립적으로 개발 및 유지보수 가능

#### 재사용 가능한 UI 컴포넌트
- **components/ui/**: Button, Skeleton, Toast 등 재사용 가능한 컴포넌트 분리
- **일관된 디자인 시스템**: 공통 컴포넌트를 통해 일관된 UI 제공

#### 커스텀 훅으로 비즈니스 로직 분리
- **lib/hooks/**: 비즈니스 로직을 커스텀 훅으로 분리하여 컴포넌트를 단순하게 유지
- **테스트 용이성**: 훅 단위로 테스트 가능

```typescript
// 컴포넌트는 UI에 집중
export const SupplyPage = ({ targetVault }) => {
  const { aprData } = useVaultAprs();
  const { data: prices } = useCoinPrices(currency);
  // ... UI 렌더링
};

// 비즈니스 로직은 훅에 분리
export function useVaultAprs() {
  // ... 복잡한 로직
}
```

### 4. 에러 처리

#### 사용자 친화적인 에러 메시지
- **사용자 거부 에러**: 사용자가 트랜잭션을 거부한 경우 에러 메시지를 표시하지 않음
- **잔액 부족 에러**: 명확한 에러 메시지 제공
- **기타 에러**: 기술적인 상세 내용을 노출하지 않고 일반적인 메시지 제공

```typescript
// lib/utils/error.ts
export function getErrorMessage(error: any): string {
  if (isUserRejectedError(error)) {
    return ''; // 사용자 거부는 메시지 없음
  }
  if (isInsufficientBalanceError(error)) {
    return 'Insufficient balance';
  }
  return 'Transaction failed due to an unexpected error';
}
```

### 5. 가스 비용 관리

#### 가스 계산 유틸리티
- **최대 입금/출금 가능 금액 계산**: 가스 비용을 고려하여 사용자가 실제로 사용 가능한 금액을 계산
- **가스 버퍼**: 가스 가격 변동을 고려하여 20% 버퍼 적용

```typescript
// lib/utils/gas.ts
export function calculateMaxAmountWithGas(
  balance: string,
  nativeBalance: bigint | undefined,
  gasEstimate: string = '0.002'
): string {
  // 가스 비용을 고려한 최대 금액 계산
}
```

## 🔗 컨트랙트 주소

### Fake ERC-20 Tokens (Base Sepolia)
- **Fake BTC**: `0x1cd5282989188818db1422a5a14244bc690a400c`
- **Fake USDT**: `0x0866b8dea93e8db261a23a6ffef8d089a6886208`
- **Fake USDC**: `0xdc0aeb396f79dfbedbe9c72dceda5d6d9295c085`

### ERC-4626 Vaults (Base Sepolia)
- **BTC Vault**: `0x194956e5805f85502ab05bcb1106cbe0252cd868`
- **USDT Vault**: `0x69a7b931d874a0ef05a377c73cee3e530b0b1c58`
- **USDC Vault**: `0x815c0eb6846c0ca9da7c41aa93f60fe5277114d0`

### Custom ABI Functions

#### Fake Token (ERC-20)
```solidity
function faucet(address to, uint256 amount) external;
```

#### Vault (ERC-4626)
```solidity
function getAPR() view returns (uint256);
```

## 🚢 배포

### AWS Lambda 배포 (SST 사용)

```bash
# 프로덕션 배포
yarn sst:deploy

# 배포 제거
yarn sst:remove
```

SST는 Next.js 앱을 AWS Lambda에 자동으로 배포합니다. `next.config.ts`에서 `output: 'standalone'`을 설정하여 Lambda 최적화 빌드를 생성합니다.

## 🎨 UX/UI 개선 사항

### 1. Skeleton UI
- 데이터 로딩 중 Skeleton UI를 표시하여 사용자가 로딩 상태를 명확히 인지할 수 있도록 했습니다.

### 2. 트랜잭션 상태 피드백
- 트랜잭션 전송, 확인, 완료 단계별로 명확한 피드백을 제공합니다.
- Toast 메시지를 통해 성공/실패를 알립니다.

### 3. 입력 검증
- 잔액 초과 입력 시 즉시 에러 메시지를 표시합니다.
- 숫자 키패드를 통한 직관적인 입력 방식을 제공합니다.

### 4. 반응형 디자인
- 모바일 우선 디자인으로 구현했습니다.
- 375px 기준으로 최적화된 레이아웃을 제공합니다.

## 🧪 테스트 컴포넌트

개발 중 기능 테스트를 위해 제공되는 테스트 컴포넌트들입니다. 프로젝트의 `components/tester/` 디렉토리에 위치하며, 다양한 기능을 독립적으로 테스트할 수 있습니다.

### TestPage (통합 테스트 페이지)
모든 테스트 컴포넌트를 한 곳에서 확인할 수 있는 통합 테스트 페이지입니다.

**주요 기능:**
- Vault 가격 및 TVL 시각화 테스트
- 토큰 Faucet 및 잔액 테스트

**사용 방법:**
개발 중에 `/test` 라우트를 추가하여 TestPage를 렌더링할 수 있습니다.

```typescript
// app/test/page.tsx 예시
import TestPage from 'components/tester/TestPage';

export default function Test() {
  return <TestPage />;
}
```

### VaultPriceTester
Vault 가격 시각화 및 TVL 계산 기능을 테스트하는 컴포넌트입니다.

**주요 기능:**
- CoinGecko API를 통한 실시간 가격 조회
- 각 Vault의 `totalAssets()` 조회 및 TVL 계산
- APR 조회 및 표시
- 통화 선택 (USD/KRW)
- Skeleton UI 및 에러 처리
- 수동 재시도 기능

**컴포넌트 구조:**
```typescript
<VaultPriceTester />
  ├─ CurrencySelector  // 통화 선택
  ├─ VaultPriceCard    // 각 Vault별 정보 카드
  │  ├─ 토큰 가격 표시
  │  ├─ TVL (Total Value Locked) 계산
  │  └─ APR 표시
  └─ 에러 처리 및 재시도 UI
```

### FaucetAndBalanceTester
Fake 토큰의 Faucet 기능과 잔액 조회를 테스트하는 컴포넌트입니다.

**주요 기능:**
- 각 Fake 토큰(BTC, USDT, USDC)의 잔액 조회
- Faucet 기능 테스트 (토큰 발급)
- 실시간 잔액 업데이트

**컴포넌트 구조:**
```typescript
<FaucetAndBalanceTester />
  ├─ TokenRow (각 토큰별)
  │  ├─ TokenBalance        // 잔액 조회 및 표시
  │  └─ Faucet 버튼        // 토큰 발급
  └─ Web3Status            // 지갑 연결 상태
```

### TokenRow
개별 토큰의 잔액 및 Faucet 기능을 제공하는 컴포넌트입니다.

**주요 기능:**
- 실시간 잔액 조회 (4초마다 자동 업데이트)
- Faucet 금액 입력 및 실행
- 트랜잭션 상태 표시 (진행 중, 성공, 실패)

**사용 예시:**
```typescript
<TokenRow 
  token={fakeBTCToken}
  isConnected={isConnected}
/>
```

### Web3Status
Web3 연결 상태를 확인하고 지갑을 연결할 수 있는 컴포넌트입니다.

**주요 기능:**
- 지갑 연결 상태 표시
- 지원되는 지갑 목록 표시 (MetaMask, OKX Wallet, Backpack Wallet)
- 현재 연결된 지갑 정보 (주소, Chain ID)
- 지갑 연결/해제 기능
- ENS 이름 및 아바타 표시 (지원되는 경우)

**표시 정보:**
- 연결 상태 (✅ 연결됨 / ❌ 연결 필요)
- 지갑 이름
- 지갑 주소 (truncated)
- Chain ID
- 총 커넥터 수

### CurrencySelector
통화 선택 기능을 테스트하는 컴포넌트입니다.

**주요 기능:**
- USD/KRW 통화 전환
- 선택된 통화에 따른 가격 표시 업데이트

### 테스트 컴포넌트 사용 목적

1. **개발 중 기능 검증**: 각 기능을 독립적으로 테스트하여 버그를 조기 발견
2. **API 연동 확인**: CoinGecko API, 블록체인 데이터 조회 기능 검증
3. **UX 확인**: 로딩 상태, 에러 처리, 사용자 피드백 확인
4. **통합 테스트**: 여러 기능을 함께 테스트하여 상호작용 확인

### 테스트 시나리오

1. **지갑 연결 테스트**
   - Web3Status 컴포넌트에서 MetaMask, OKX Wallet, Backpack Wallet 연결 시도
   - Base Sepolia 네트워크 자동 전환 확인

2. **Faucet 테스트**
   - 각 Fake 토큰에 대해 Faucet 기능 실행
   - 잔액 실시간 업데이트 확인

3. **가격 조회 테스트**
   - CoinGecko API를 통한 가격 조회 확인
   - 통화 전환 (USD ↔ KRW) 테스트
   - 에러 발생 시 재시도 로직 확인

4. **Vault 데이터 조회 테스트**
   - 각 Vault의 `totalAssets()` 조회 확인
   - APR 조회 확인
   - TVL 계산 정확성 확인

## 📚 주요 커스텀 훅

### useCoinPrices
CoinGecko API를 통해 토큰 가격을 조회합니다.

```typescript
const { data: prices, isLoading, isError } = useCoinPrices('usd');
```

### useVaultAssets
모든 Vault의 `totalAssets()`를 조회하고 포맷팅합니다.

```typescript
const { assetAmounts, isLoadingAssets } = useVaultAssets();
```

### useVaultAprs
모든 Vault의 APR을 조회합니다.

```typescript
const { aprData, isLoadingApr } = useVaultAprs();
```

### useDeposit
Vault에 토큰을 예치합니다.

```typescript
const { depositAsync, isWriting, isConfirming, isSuccess } = useDeposit({
  vault: targetVault,
  amountString: inputAmount
});
```

### useWithdraw
Vault에서 토큰을 출금합니다.

```typescript
const { withdrawAsync, isWriting, isConfirming, isSuccess } = useWithdraw({
  vault: targetVault,
  amountString: inputAmount
});
```

## 🐛 트러블슈팅

### 지갑 연결이 안 되는 경우
1. Base Sepolia 네트워크가 추가되어 있는지 확인
2. 지갑이 Base Sepolia 네트워크로 전환되어 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 가격 데이터가 표시되지 않는 경우
1. `.env.local`에 `COINGECKO_API_KEY`가 설정되어 있는지 확인
2. API 키가 유효한지 확인
3. 네트워크 탭에서 API 요청 상태 확인

### 트랜잭션이 실패하는 경우
1. Base Sepolia 테스트넷 ETH가 충분한지 확인
2. 토큰 Approve가 완료되었는지 확인
3. Vault에 충분한 유동성이 있는지 확인

## 🚀 향후 개선 사항 및 추가 구현 제안

개발 중 제안된 UI/UX 개선 사항 및 추가 기능들을 정리했습니다.

### 1. 통화 선택 기능 개선

#### 1.1 헤더에 통화 선택 버튼 추가
**현재 상태**: 테스트 컴포넌트에만 통화 선택 기능이 있음  
**제안 사항**:
- `EarnHeader`의 메뉴 버튼을 클릭하면 설정 모달이 열리고 통화 선택 포함
- 통화 선택 시 부드러운 애니메이션 적용
- 현재 선택된 통화를 헤더에 작은 배지로 표시

#### 1.2 더 많은 통화 지원
**현재**: USD, KRW만 지원  
**제안**: EUR, JPY, GBP, CAD, AUD 등 주요 통화 추가

**구현 고려사항**:
- CoinGecko API에서 지원하는 통화 확인 필요
- API 호출 시 다중 통화 지원 여부 확인

#### 1.3 사용자 선호 통화 저장
**제안 사항**:
- localStorage에 사용자 선호 통화 저장
- 페이지 로드 시 자동 적용
- 위치 기반 자동 선택 (브라우저 언어 설정 기반)

### 2. 가격 정보 시각화 개선

#### 2.1 24시간 가격 변화 표시
**제안 사항**:
- 각 Vault의 24시간 가격 변화율 표시
- 상승(초록) / 하락(빨강) 색상으로 구분
- 코인 가격 변화도 함께 표시

**기술 고려사항**:
- CoinGecko API에서 24h change 데이터 조회 필요
- `price_change_percentage_24h` 필드 활용

#### 2.2 가격 차트 (간단한 스파크라인)
**제안 사항**:
- 각 Vault의 TVL 변화 추이를 미니 차트로 표시
- Recharts 또는 Chart.js 사용
- 클릭 시 상세 차트 모달 열기

**필요 라이브러리**:
- `recharts` 또는 `chart.js` 설치 필요
- Vault TVL 히스토리 데이터 저장 및 관리

#### 2.3 환율 정보 표시
**제안 사항**:
- 통화 전환 시 실시간 환율 정보 표시
- 예: "1 USD ≈ 1,350 KRW"
- 통화 선택 모달에 환율 정보 표시

**기술 고려사항**:
- CoinGecko API의 실시간 환율 데이터 활용

### 3. 메뉴 모달 구현

#### 3.1 설정 메뉴 모달
**제안 사항**: 헤더의 메뉴 버튼 클릭 시 다음 기능 제공

**기능 목록**:
- ✅ 통화 선택 (Currency Selection)
- 📝 언어 선택 (Language Selection) - 다국어 지원 준비
- 🌐 네트워크 정보 (Base Sepolia)
- 💾 설정 저장
- 🌓 테마 토글 (다크/라이트 모드)

**모달 상태 관리**:
- Context API 또는 Jotai atom으로 모달 상태 관리
- 열림/닫힘 애니메이션 구현

### 4. 사용자 경험 개선

#### 4.1 통화 전환 애니메이션
**제안 사항**:
- 통화 변경 시 숫자 카운팅 애니메이션
- 페이드 인/아웃 효과
- 부드러운 숫자 변화 애니메이션

**추천 라이브러리**:
- `@react-spring/web`: 스프링 애니메이션
- `framer-motion`: 모션 라이브러리
- `react-countup`: 카운팅 애니메이션

#### 4.2 포트폴리오 총 가치 개선
**제안 사항**:
- My Total Supply에 통화 전환 적용 (이미 구현됨)
- 변화율 표시 (예: +2.5% (24h))
- 차트 버튼 추가 (클릭 시 상세 차트 모달)

**기능**:
- 24시간 변화율 계산 및 표시
- 클릭 가능한 차트 아이콘 추가

#### 4.3 Vault 상세 정보 개선
**제안 사항**:
- Vault 페이지에 통화별 총 공급량 표시 (이미 구현됨)
- 통화 전환 시 모든 금액 자동 업데이트 (이미 구현됨)
- 가격 히스토리 (7일/30일) 차트 추가

### 5. 추가 기능

#### 5.1 정렬 및 필터 기능
**제안 사항**:
- Vault 목록 정렬 옵션
  - APY 높은순
  - TVL 높은순
  - 이름순
  - 최근 업데이트순
- 필터 옵션
  - 특정 토큰 기반 Vault만 표시
  - APY 범위 필터

#### 5.2 즐겨찾기 기능
**제안 사항**:
- 사용자가 선호하는 Vault 즐겨찾기
- 즐겨찾기된 Vault를 상단에 표시
- localStorage에 저장
- 즐겨찾기 아이콘 추가

**기능**:
- 하트 또는 별 아이콘으로 즐겨찾기 표시
- 즐겨찾기된 Vault는 리스트 상단에 고정
- 페이지 새로고침 시에도 유지

#### 5.3 알림 설정 (선택)
**제안 사항**:
- APY 변경 알림
- 특정 Vault TVL 임계값 알림
- Web3 네이티브 알림 또는 Toast로 표시

**알림 타입**:
- APY가 특정 퍼센트 이상 변경 시
- TVL이 임계값 도달 시
- 새 Vault 추가 시

#### 5.4 다크/라이트 모드 토글
**제안 사항**:
- 현재 다크 모드만 지원
- 라이트 모드 추가
- 사용자 선호 설정 저장
- 시스템 테마 자동 감지

**기능**:
- 설정 모달에서 테마 전환
- localStorage에 저장
- 시스템 테마 자동 감지 (`prefers-color-scheme`)

### 6. 성능 및 접근성 개선

#### 6.1 통화 변환 최적화
**제안 사항**:
- 환율 캐싱 (CoinGecko API 호출 최소화)
- 계산 결과 메모이제이션
- 배치 환율 조회

**최적화 방법**:
- React Query의 캐싱 전략 활용
- `staleTime`, `cacheTime` 최적화
- 환율 데이터 로컬 캐싱

#### 6.2 키보드 접근성
**제안 사항**:
- 통화 선택 키보드 네비게이션 지원
- Tab, Enter, Arrow keys 지원
- 포커스 표시 명확화

#### 6.3 반응형 개선
**제안 사항**:
- 현재 375px 고정
- 태블릿/데스크톱 반응형 레이아웃 추가
- 브레이크포인트별 최적화

**구현 고려사항**:
- Tailwind의 반응형 클래스 활용
- 모바일 우선 → 데스크톱 확장 방식

## 📄 라이선스

이 프로젝트는 과제 제출용으로 작성되었습니다.

## 👤 작성자

Generated by Jihwang

---

## 📝 추가 참고 사항

### 개발 환경
- **Node.js**: 18.x 이상 권장
- **Package Manager**: yarn 사용 권장

### 브라우저 지원
- Chrome/Edge (권장)
- Firefox
- Safari

### 네트워크
- **Chain**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
