'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Alchemy, Network } from 'alchemy-sdk';

const NFTs = () => {
  const [nfts, setNfts] = useState([]);
  const { address, isConnecting, isDisconnected } = useAccount();
  const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  useEffect(() => {
    const fetchNfts = async () => {
      // Get all NFTs
      const fetchedNfts = await alchemy.nft.getNftsForOwner('aronshelton.eth');
      setNfts(fetchedNfts);
    };

    if (address) {
      fetchNfts();
    }
          // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // console.log(nfts.ownedNfts);

  return (
    <div>
      {isConnecting ? (
        <></>
      ) : isDisconnected ? (
        <></>
      ) : (
        <div className='bg-gray-900'>
          <svg
            className='absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]'
            aria-hidden='true'
          >
            <defs>
              <pattern
                id='983e3e4c-de6d-4c3f-8d64-b9761d1534cc'
                width={200}
                height={200}
                x='50%'
                y={-1}
                patternUnits='userSpaceOnUse'
              >
                <path d='M.5 200V.5H200' fill='none' />
              </pattern>
            </defs>
            <svg x='50%' y={-1} className='overflow-visible fill-gray-800/20'>
              <path
                d='M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z'
                strokeWidth={0}
              />
            </svg>
            <rect
              width='100%'
              height='100%'
              strokeWidth={0}
              fill='url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)'
            />
          </svg>
          <div className='py-16 sm:py-24 lg:mx-auto lg:max-w-7xl lg:px-8'>
            <div className='flex items-center justify-between px-4 sm:px-6 lg:px-0'>
              <h2 className='text-2xl font-bold tracking-tight text-white'>
                Owned NFTs
              </h2>
            </div>

            <div className='relative mt-8'>
              <div className='relative -mb-6 w-full overflow-x-auto no-scrollbar pb-6 '>
                <ul
                  role='list'
                  className='mx-4 inline-flex space-x-8 sm:mx-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-8 lg:space-x-0'
                >
                  {nfts.ownedNfts &&
                    nfts.ownedNfts.map((nft, i) => {
                      if (
                        nft.media[0] &&
                        typeof nft.media[0]['thumbnail'] !== 'undefined'
                      ) {
                        return (
                          <li
                            key={nft.contract['deployedBlockNumber']}
                            className='inline-flex w-64 flex-col text-center lg:w-auto'
                          >
                            <div className='group relative'>
                              <div className='aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200'>
                                <img
                                  src={nft.media[0]['thumbnail']}
                                  alt={nft.rawMetadata['description']}
                                  className='h-full w-full object-cover object-center group-hover:opacity-75'
                                />
                              </div>
                              <div className='my-6'>
                                <h3 className='mt-1 font-semibold text-white'>
                                  {nft.rawMetadata['name']}
                                </h3>
                                <p className='mt-1 text-gray-200 text-xs'>
                                  {nft.rawMetadata['description']}
                                </p>
                                <a
                                  href={`https://etherscan.io/address/${nft.contract['address']}`}
                                  aria-hidden='true'
                                  className='inset-0 mt-1 font-bold	text-sm bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-300'
                                >
                                  Know More
                                </a>
                              </div>
                            </div>
                          </li>
                        );
                      } else {
                        return;
                      }
                    })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTs;
