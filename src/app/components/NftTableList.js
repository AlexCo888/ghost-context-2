import { useState, useEffect, useContext, useRef,useLayoutEffect } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import NftDescription from './NftDescription';
import { useAccount } from 'wagmi';
import { EnsContext } from './context/EnsContext';
import { KindredButtonContext } from './context/KindredButtonContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function NftTableList() {
  const [totalNfts, setTotalNfts] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [numNftsToShow, setNumNftsToShow] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [totalOwnedNFTs, setTotalOwnedNFTs] = useState(null);
  const [pageKey, setPageKey] = useState(null); // Add this
  const { ensAddress } = useContext(EnsContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const checkbox = useRef()
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState(false)
  const [selectedNFTs, setSelectedNFTs] = useState([])
  const {
    selectedNFTsContext,
    setSelectedNFTsContext,
    triggerKindredSpirits,
    setTriggerKindredSpirits,
  } = useContext(KindredButtonContext);
  
  const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  const fetchNfts = async (addressToFetch, key) => {
    setIsLoading(true);
    let ownedNfts = [];
    let currentPageKey = key;
    while(true) {
      try {
        const fetchedNfts = await alchemy.nft.getNftsForOwner(
          addressToFetch,
          {pageKey: currentPageKey}
        );
        ownedNfts = [...ownedNfts, ...fetchedNfts.ownedNfts];
        if(!fetchedNfts.pageKey) {
          break;
        }
        currentPageKey = fetchedNfts.pageKey;
      } catch (err) {
        console.error("Error while fetching NFTs:", err);
      }
    }
    setPageKey(null);
    setTotalOwnedNFTs(ownedNfts.length.toLocaleString());
    setTotalNfts(ownedNfts);
    setNfts(ownedNfts.slice(0, numNftsToShow));
    setIsLoading(false);
};


useEffect(() => {
    const addressToFetch = ensAddress || (!ensAddress && address);
    if (addressToFetch) {
      setTotalNfts([]);  // reset the totalNfts state
      setNumNftsToShow(20);  // reset numNftsToShow state
      setPageKey(null);  // reset pageKey state
      fetchNfts(addressToFetch, null);
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensAddress, address]);

  useEffect(() => {
    setNfts(totalNfts.slice(0, numNftsToShow));
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numNftsToShow]);

  const handleSeeMoreClick = () => {
    setIsLoading(true);
    if (totalNfts.length > numNftsToShow) {
      // If there are more NFTs fetched than shown, simply increase the shown NFTs
      setNumNftsToShow(numNftsToShow + 20);
    } else if (pageKey) {
      // If there are no more fetched NFTs to show, fetch more
      const addressToFetch = ensAddress || (!ensAddress && address);
      if (addressToFetch) {
        fetchNfts(addressToFetch, pageKey);
      }
    }
  };

  useLayoutEffect(() => {
    const isIndeterminate = selectedNFTs.length > 0 && selectedNFTs.length < nfts.length;
    setChecked(selectedNFTs.length === nfts.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
    setSelectedNFTsContext(selectedNFTs)
  }, [selectedNFTs, nfts.length]);
  

  function toggleAll() {
    setSelectedNFTs(checked || indeterminate ? [] : totalNfts)
    setChecked(!checked && !indeterminate)
    setIndeterminate(false)
  }
  
  const handleButtonClick = () => {
    setTriggerKindredSpirits(true);
  }
  

    return (
      <div>
        {isDisconnected && !ensAddress || isConnecting && !ensAddress ? (
          <div>
            {/* <p>There is nothing here :)</p> */}
          </div>
        ) : (
          <div className='px-4 sm:px-6 lg:px-8 bg-gray-900 pb-8'>
            <div className='sm:flex sm:items-center justify-center text-center'>
              <div className='sm:flex-auto'>
                <h2 className='pt-20 text-mb-4 text-4xl text-center font-bold leading-none tracking-tight text-white md:text-3xl lg:text-4xl'>
                  Owned NFTs
                </h2>
                <p className='mt-2 text-md text-gray-200'>
                  A list of <span className='font-bold'>{totalOwnedNFTs}</span> NFTs owned by this address. 
                  {/* Click the button to summon the kindred spirits of this address. */}
                </p>
                {/* <button
                  type='button'
                  className='rounded-md bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-2 mt-4 text-center text-sm font-semibold text-white shadow-smfocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                  onClick={handleSeeMoreClick}
                >
                  Show my Kindred Spirits
                </button> */}
              </div>
            </div>
            <div className='relative mt-8 flow-root'>
              <div className='-mx-4 -my-2 sm:-mx-6 lg:-mx-8 no-scrollbar overflow-x-auto'>
                <div className=' inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                {selectedNFTs.length > 0 && (
                <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-gray-900 sm:left-12">
                  <button
                    onClick={handleButtonClick}
                    type="button"
                    className="inline-flex items-center rounded bg-gradient-to-r from-purple-500 to-pink-600 px-2 py-1 text-center text-sm font-semibold text-white shadow-smfocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Summon the Kindred Spirits
                  </button>
                </div>
              )}
                  <table className='min-w-full divide-y divide-gray-300 '>
                    <thead>
                      <tr>
                        <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                            <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                            ref={checkbox}
                            checked={checked}
                            onChange={toggleAll}
                          />
                        </th>
                        <th
                          scope='col'
                          className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0'
                        >
                          Name
                        </th>
                        <th
                          scope='col'
                          className='px-3 py-3.5 text-left text-sm font-semibold text-white'
                        >
                          Token Type
                        </th>
                        <th
                          scope='col'
                          className='px-3 py-3.5 text-left text-sm font-semibold text-white'
                        >
                          Etherscan
                        </th>
                        <th
                          scope='col'
                          className='px-3 py-3.5 text-left text-sm font-semibold text-white '
                        >
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-gray-900'>
                      {nfts && !nfts.metadataError &&
                        nfts.map((nft, i) => {
                          if (
                            nft.media[0] &&
                            typeof nft.media[0]['thumbnail'] !== 'undefined'
                          ) {
                            return (
                              <tr key={nft.contract['address']+i} className={selectedNFTs.includes(nft) ? 'bg-gray-800' : undefined}>
                                <td className="relative px-7 sm:w-12 sm:px-6">
                                {selectedNFTs.includes(nft) && (
                                  <div className="absolute inset-y-0 left-0 w-0.5 bg-purple-500" />
                                )}
                                  <input
                                    type="checkbox"
                                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                                    value={nft.contract['address']}
                                    checked={selectedNFTs.includes(nft)}
                                    onChange={(e) =>
                                      setSelectedNFTs(
                                        e.target.checked
                                          ? [...selectedNFTs, nft]
                                          : selectedNFTs.filter((p) => p !== nft)
                                      )
                                    }
                                  />
                                </td>
                                <td 
                                 className={classNames(
                                  'whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0',
                                  selectedNFTs.includes(nft) ? 'text-purple-600' : 'text-gray-900'
                                   )}>
                                  <div className='flex items-center'>
                                    <div className='h-11 w-11 flex-shrink-0'>
                                      <img
                                        className='h-11 w-11 rounded-full'
                                        src={nft.media[0]['thumbnail'] || nft.media[0]['gateway']}
                                        alt={nft.rawMetadata['name']}
                                      />
                                    </div>
                                    <div className='ml-4'>
                                      <div className='font-medium text-white'>
                                        {nft.rawMetadata['name']}
                                      </div>
                                      <div className='mt-1 text-gray-500 text-xsm'>
                                        {nft.contract['address']}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className='whitespace-nowrap px-3 py-5 text-sm text-gray-500'>
                                  <div className='text-white'>{nft.tokenType}</div>
                                </td>
                                <td className='whitespace-nowrap px-3 py-5 text-sm text-gray-500'>
                                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
          
                                    <a href={`https://etherscan.io/address/${nft.contract['address']}`}>
                                      View on Etherscan
                                    </a>
                                </span>
                                </td>
                                <td className='whitespace-nowrap max-w-xs px-3 py-5 text-sm text-gray-500'>
                                  <NftDescription nft={nft}/>
                                </td>
                              </tr>
                            );
                          } else {
                            return (
                              <>

                              </>
                            )
                          }
                        })}
                    </tbody>
                  </table>
                  <div className='flex mt-4 sm:ml-16 sm:mt-0 sm:flex-none items-center max-sm:justify-start md:justify-center'>
                  {totalNfts && totalNfts.length > numNftsToShow && (
                <button
                  type='button'
                  className='ml-36 md:ml-0 block rounded-md bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-smfocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                  onClick={handleSeeMoreClick}
                >
                  {isLoading ? 'Loading...' : 'See More'}
                </button>)}
              </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
