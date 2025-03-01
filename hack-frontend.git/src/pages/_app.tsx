import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "react-hot-toast";
import { PrivyProvider } from "@privy-io/react-auth";
import DataContextProvider from "@/context/DataContext";
import { wagmiConfig } from "@/utils/wallet-utils";
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
              // Customize Privy's appearance in your app
              appearance: {
                theme: "light",
                accentColor: "#676FFF",
                logo: "https://docs.privy.io/privy-logo-dark.png",
              },
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                createOnLogin: "all-users",
              },
            }}
          >
            <DataContextProvider>
              <Component {...pageProps} />
            </DataContextProvider>
          </PrivyProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
      <Toaster />
    </WagmiConfig>
  );
}
