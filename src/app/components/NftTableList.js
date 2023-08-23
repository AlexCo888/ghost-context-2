import { useState, useEffect, useContext, useRef,useLayoutEffect } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import NftDescription from './NftDescription';
import { useAccount } from 'wagmi';
import { EnsContext } from './context/EnsContext';
import { KindredButtonContext } from './context/KindredButtonContext';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

import Modal from 'react-modal';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

Modal.setAppElement('#root'); 

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
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const {
    setSelectedNFTsContext,
    setTriggerKindredSpirits,
    setOwnedNFTs,
    setShowKindredSpirits,
  } = useContext(KindredButtonContext);
  
  const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  const fetchNfts = async (addressToFetch, key) => {
    setIsLoadingModal(true);
    let ownedNfts = [];
    let seenAddresses = new Set(); // Track seen contract addresses
    let uniqueNfts = [];           // Store NFTs with unique contract addresses
    let currentPageKey = key;
    while (true) {
        try {
            const fetchedNfts = await alchemy.nft.getNftsForOwner(
                addressToFetch,
                { pageKey: currentPageKey }
            );
            ownedNfts = [...ownedNfts, ...fetchedNfts.ownedNfts];
            
            // Filter out NFTs with duplicated contract addresses
            for (let nft of fetchedNfts.ownedNfts) {
                const address = nft.contract['address'];
                if (!seenAddresses.has(address)) {
                    seenAddresses.add(address);
                    uniqueNfts.push(nft);
                }
            }
            
            if (!fetchedNfts.pageKey) {
                break;
            }
            currentPageKey = fetchedNfts.pageKey;
        } catch (err) {
            console.error("Error while fetching NFTs:", err);
        }
    }
    setPageKey(null);
    setTotalOwnedNFTs(uniqueNfts.length.toLocaleString());
    setTotalNfts(uniqueNfts);
    setNfts(uniqueNfts.slice(0, numNftsToShow));
    setIsLoadingModal(false);
};


useEffect(() => {
    const addressToFetch = ensAddress || (!ensAddress && address);
    if (addressToFetch) {
      setTotalNfts([]);  // reset the totalNfts state
      setNumNftsToShow(20);  // reset numNftsToShow state
      setPageKey(null);  // reset pageKey state
      fetchNfts(addressToFetch, null);
      setFilteredNfts([]);  // reset the filteredNfts state
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

  useEffect(() => {
    // Add or remove the class based on the isLoading state
    if (isLoadingModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isLoadingModal]);
  
  

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
    setOwnedNFTs(selectedNFTs)
    setTriggerKindredSpirits(true);
    setSelectedNFTs([])
    setShowKindredSpirits(true)
  }

  const handleSearchInputChange = (event) => {
    const nftQuery = event.target.value;
    setSearchQuery(nftQuery);
  
    if(nftQuery) {
      const newFilteredNfts = totalNfts.filter((nft) => {
        if (nft.rawMetadata && nft.rawMetadata['name']) {
          return nft.rawMetadata['name'].toLowerCase().includes(nftQuery.toLowerCase());
        }
        return false;
      });
  
      setFilteredNfts(newFilteredNfts);
      setIsFiltered(true);
    } else {
      setIsFiltered(false);
      setFilteredNfts(nfts);  // Reset filteredNfts to the original list
    }
  }
  
  const nftsToDisplay = isFiltered ? filteredNfts : nfts;


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
                <h2 className='text-mb-4 text-4xl text-center font-bold leading-none tracking-tight text-white md:text-3xl lg:text-4xl'>
                  Owned NFTs
                </h2>
                <p className='mt-2 text-md text-gray-200'>
                To summon a list of kindred spirits, please select the NFTs that you would like to analyze  👻✨
                </p>
                <p className='mt-2 mb-5 text-md text-gray-200'>
                  A list of <span className='font-bold'>{totalOwnedNFTs}</span> unique NFTs owned by this address. 
                  {/* Click the button to summon the kindred spirits of this address. */}
                </p>
                
                <div className='flex justify-center'>
                  <div className="mt-2 flex rounded-md shadow-sm">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <label
                    htmlFor="name"
                    className="absolute -top-2 left-2 inline-block rounded-sm bg-purple-700 px-1 text-xs font-medium text-white"
                  >
                    Filter by name
                  </label>
                      <div className="pointer-events-none text-xs absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 pt-1 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchQuery} 
                        onChange={handleSearchInputChange}
                        className="block w-full lg:min-w-md rounded-md border-0 py-1.5 mt-1 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 max-sm:text-xs sm:leading-6"
                        placeholder="CryptoPunk #1000"
                      />
                    </div>
                  </div>
                </div>
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
                    Summon Kindred Spirits
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
                      {nftsToDisplay.length === 0 ? (
                        <tr>
                        <td className='relative px-7 sm:w-12 sm:px-6'>No Results</td>
                        </tr>
                      ) : ( 
                      nftsToDisplay && !nftsToDisplay.metadataError &&
                        nftsToDisplay.map((nft, i) => {
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
                        }))}
                    </tbody>
                  </table>
                  <div className='flex mt-4 sm:ml-16 sm:mt-0 sm:flex-none items-center max-sm:justify-start md:justify-center'>
                  {!isFiltered && totalNfts && totalNfts.length > numNftsToShow && (
                <button
                  type='button'
                  className='ml-36 md:ml-0 block rounded-md bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-smfocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                  onClick={handleSeeMoreClick}
                >
                  {isLoadingModal ? 'Loading...' : 'See More'}
                </button>)}
              </div>
                </div>
              </div>
            </div>
            <Modal 
        isOpen={isLoadingModal} 
        style={{
          content : {
            display                 : 'flex',
            flexDirection           : 'column',
            justifyContent          : 'center',
            alignItems              : 'center',
            top                   : '50%',
            left                  : '50%',
            right                 : 'auto',
            bottom                : 'auto',
            marginRight           : '-50%',
            transform             : 'translate(-50%, -50%)',
          }
        }}
      >
        <h2 className="px-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center font-bold text-lg">Loading NFTs</h2>🥳
        <p className="px-10 text-center font-light text-slate-800 text-base">Please be patient, we are loading your NFTs</p>
        <button disabled type="button" className="mt-10 text-white bg-gradient-to-r from-purple-500 to-pink-600 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 items-center">
          <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
          </svg>
          Loading...
      </button>
      </Modal>
          </div>
          
        )}
      </div>
      
    );
  };
