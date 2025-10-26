import JotaiProvider from "./JotaiProvider";
import Web3Provider from "./Web3Provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <JotaiProvider>
            <Web3Provider>
                {children}
            </Web3Provider>
        </JotaiProvider>
    );
}