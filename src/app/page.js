'use client';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { arbitrum, mainnet, polygon } from 'wagmi/chains';
// import { useAccount } from 'wagmi';
import Hero from './components/Hero';

export default function App() {
  const chains = [arbitrum, mainnet, polygon];
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains }),
    publicClient,
  });
  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  // const { address, isConnecting, isDisconnected } = useAccount();
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Hero />
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
