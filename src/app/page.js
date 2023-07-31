'use client';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli, arbitrum, mainnet, polygon } from 'wagmi/chains';
import Hero from './components/Hero';
import TableList from './components/NftTableList';
import MintedNfts from './components/MintedNfts';
import KindredSpiritsList from './components/KindredSpiritsList';
import { EnsContext } from './components/context/EnsContext'; // Import the context
import { useState } from 'react'; // Import the context
import { FetchDataProvider } from './components/context/KindredButtonContext';


export default function App() {
  const chains = [goerli, arbitrum, mainnet, polygon];
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  const [ensAddress, setEnsAddress] = useState(null);

  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 2, chains }),
    publicClient,
  });
  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
      <EnsContext.Provider value={{ ensAddress, setEnsAddress }}>
        <Hero />
        <FetchDataProvider>
        <KindredSpiritsList />
        <TableList />
        </FetchDataProvider>
        {/* <MintedNfts /> */}
        </EnsContext.Provider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
