import { useEffect, useState, useContext, useRef } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import NftModal from "./NftModal";
import { useEnsName } from "wagmi";
import { ethers } from "ethers";
import { saveAs } from 'file-saver';
import { useAccount } from 'wagmi';
import Modal from 'react-modal';
import { EnsContext } from './context/EnsContext';
import { KindredButtonContext } from './context/KindredButtonContext';


const provider = ethers.getDefaultProvider();

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

Modal.setAppElement('#root'); 

const KindredSpiritsList = () => {
  const [sortedResult, setSortedResult] = useState({});
  const [modalAddress, setModalAddress] = useState("");
  const [countForModal, setCountForModal] = useState(null);
  const [contractsInCommonModal, setContractsInCommonModal] = useState(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredContractsForModal, setFilteredContractsForModal] = useState({});
  const [totalWallets, setTotalWallets] = useState(0);
  const { ensAddress } = useContext(EnsContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [totalOwnedNFTs, setTotalOwnedNFTs] = useState(null);
  const [totalNfts, setTotalNfts] = useState([]);
  const [totalContracts, setTotalContracts] = useState(null);
  const [buttonText, setButtonText] = useState("Download Kindred Spirits");
  const [scrollRequested, setScrollRequested] = useState(false);
  const scrollToRef = useRef(null);
  const {
    selectedNFTsContext,
    setSelectedNFTsContext,
    triggerKindredSpirits,
    setTriggerKindredSpirits,
    ownedNFTs,
    showKindredSpirits
  } = useContext(KindredButtonContext);
  const [selectedModal, setSelectedModal] = useState(null);

  const openModal = (address) => {
    const { count, contractsInCommon } = filteredContractsForModal[address];
    setModalAddress(address);
    setCountForModal(count);
    setContractsInCommonModal(contractsInCommon);
    setSelectedModal(address);
  };

  const downloadCsv = async (contractsInCommon, address) => {
    let contractsInCsv = [];
    let ensNames = [];
    const walletAddress = address;
    const ensContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
    const nfts = await alchemy.nft.getNftsForOwner(walletAddress, {
      contractAddresses: [ensContractAddress],
    });
  
    for (const contract of contractsInCommon) {
      const response = await alchemy.nft.getContractMetadata(contract);
      contractsInCsv.push(response.name || contract); // Use contract address if name is undefined
    }
  
    for (const nft of nfts.ownedNfts) {
      ensNames.push(nft.title);
    }
  
    const csvRows = contractsInCsv.map((contract, i) => {
      const commonContract = i < ensNames.length ? ensNames[i] : "";
      return `"${commonContract || address}",${Number(i) + 1},"${contract.replace(/"/g, '""')}"`; // Escape double quotes and encode as UTF-8
    });
  
    const header = "Contracts in Common with,NFT,Contract Name";
    const csvContent = `${header}\n${csvRows.join("\n")}`;
    const csvData = "\uFEFF" + csvContent; // Add UTF-8 BOM (Byte Order Mark)
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "contracts-in-common.csv");
  };
  
  

  
  async function downloadKindredCSV() {
    setButtonText("Downloading...");
    const dataPromises = Object.entries(filteredContractsForModal).slice(0, 20).map(async ([address, contract]) => {
        const count = contract.count || 0;
        const contractsInCommon = contract.contractsInCommon || [];

        // Initiate all requests at once, then wait for all to finish
        const contractResponses = await Promise.all(contractsInCommon.map(c => alchemy.nft.getContractMetadata(c).catch(error => {
            console.error(`Error getting contract metadata for ${c}: ${error.message}`);
            return { name: 'Unknown' };
        })));
        const contractsInCsv = contractResponses.map(response => response.name);

        // Try to resolve the ENS name for the address. If it doesn't exist, use the original address.
        let ensName = address;
        try {
            ensName = await provider.lookupAddress(address) || address;
        } catch (error) {
            console.error(`No ENS name found for address: ${address}`);
        }

        return [ensName, count, contractsInCsv.join(';')];
    });

    const data = await Promise.all(dataPromises);
    const csv = 'EnsName | Address,Number of Connections,Contracts in Common\n' + data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'kindred-spirits.csv');
    setButtonText("Download Kindred Spirits");
}

useEffect(() => {
  // Add or remove the class based on the isLoading state
  if (isLoading) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
}, [isLoading]);


  
  
  useEffect(() => {
    const getOwnersForContracts = async (nftAddressesArray, addressOrEns) => {
      let targetAddress;
      setIsLoading(true); // show the modal
      setTotalContracts(nftAddressesArray.length);
      if (!addressOrEns.startsWith("0x")) {
        targetAddress = await alchemy.core.resolveName(addressOrEns);
    } else {
      targetAddress = addressOrEns;
    }
      let ownersCount = {};
      let contractsInCommon = {};
      // Local variable for total wallets
      let totalWalletsLocal = 0;
  
      for (const nftAddress of nftAddressesArray) {
        let owners = [];
        let response = await alchemy.nft.getOwnersForContract(nftAddress);
        owners = owners.concat(response.owners);
    
        while (response.pageKey) {
            response = await alchemy.nft.getOwnersForContract(nftAddress, { pageKey: response.pageKey });
            if (owners.length > 150000) {
                break;  // break out of the loop entirely
            }
            owners = owners.concat(response.owners);
        }
        totalWalletsLocal += owners.length;
    
        owners.forEach((owner) => {
          ownersCount[owner] = ownersCount[owner] ? ownersCount[owner] + 1 : 1;
          if (contractsInCommon[owner]) {
            contractsInCommon[owner].count++;
            contractsInCommon[owner].contractsInCommon.push(nftAddress);
          } else {
            contractsInCommon[owner] = { count: 1, contractsInCommon: [nftAddress] };
          }
        });
        // clear owners array
        owners = null;
    }
    
  
      // Set the state variable here once with the total wallets count
      setTotalWallets(totalWalletsLocal);
  
      const filteredResult = Object.fromEntries(
        Object.entries(ownersCount)
        // .filter(([_, value]) => value >= 10)
        .slice(0, 50)
      );
  
      const filteredContractsInCommon = Object.fromEntries(
        Object.entries(contractsInCommon)
          // .filter(([_, value]) => value.count >= 10)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 50)
      );
  
      delete filteredResult[
        targetAddress.toLocaleLowerCase()
      ];
      delete filteredContractsInCommon[
        targetAddress.toLocaleLowerCase()
      ];
  
      const sortedResult = Object.entries(filteredResult)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
      const sortedResultContractsInCommon = Object.entries(filteredContractsInCommon)
        .sort((a, b) => b[1].count - a[1].count)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
      setSortedResult(sortedResult);
      setFilteredContractsForModal(sortedResultContractsInCommon);
      setIsLoading(false); // hide the modal
      setScrollRequested(true);
      setSelectedNFTsContext([])
    };
  
    const getNftsForOwners = async (addressOrEns) => {
      let nftAddressesArray = [];
      // let ownedNfts = [];
      // let currentPageKey = null;
        
      // do {
      //   try {
      //     const fetchedNfts = await alchemy.nft.getNftsForOwner(addressOrEns, {
      //       pageKey: currentPageKey,
      //     });
    
      //     ownedNfts = [...ownedNfts, ...fetchedNfts.ownedNfts];
      //     currentPageKey = fetchedNfts.pageKey;
      //   } catch (error) {
      //     console.error("Error while fetching NFTs:", error);
      //     break;
      //   }
      // } while (currentPageKey);
    
      setTotalOwnedNFTs(selectedNFTsContext.length.toLocaleString());
      setTotalNfts(selectedNFTsContext);    
      // Extract the contract addresses from the ownedNfts array
      nftAddressesArray = selectedNFTsContext.map((nft) => nft.contract.address);
    
      if(nftAddressesArray.length) {
        await getOwnersForContracts(nftAddressesArray, addressOrEns);
      } else {
        console.log("No NFT Addresses found for the owner");
      }
    };
    
  
    const runGetOwnersForContracts = async (ensOrAddress) => {
      try {
        await getNftsForOwners(ensOrAddress);
      } catch (error) {
        // console.log(error);
      }
    };
  
    if (triggerKindredSpirits && (ensAddress || address)) { // Ensure address or ensAddress is not empty
      runGetOwnersForContracts(ensAddress || address);
      setTriggerKindredSpirits(false); // Reset the trigger after using it
    }
    
  }, [triggerKindredSpirits, ensAddress, address, selectedNFTsContext]);


  useEffect(() => {
    if (scrollRequested && scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: "smooth" });
      setScrollRequested(false); // Reset the request
    }
  }, [scrollRequested, setScrollRequested, scrollToRef]);


  return (
    <div>
         {isDisconnected && !ensAddress || isConnecting && !ensAddress || !showKindredSpirits && selectedNFTsContext ? (
          <div></div>
        ) : (
    <div ref={scrollToRef} className="bg-gray-900">
      <h2 className="mb-4 text-4xl text-center font-bold leading-none tracking-tight text-white md:text-3xl lg:text-4xl">
        Kindred Spirits
      </h2>
      <h3 className="mb-4 text-2xl text-center font-semibold leading-none tracking-tight text-gray-300 md:text-xl sm:px-15 lg:px-32">
        We analyzed {totalWallets.toLocaleString()} unique wallet addresses across the {ownedNFTs.length} NFTs owned by this address and summoned {Object.entries(filteredContractsForModal).slice(0, 20).length} kindred spirits 👻✨
      </h3>
      <div className="flex justify-center ">
        <button onClick={downloadKindredCSV} className="mx-2 text-teal-200 bg-teal-200/10 max-w-button ring-teal-200/30 rounded-xl flex-none mb-4 py-2 px-4 text-sm font-medium ring-1 ring-inset">
          {buttonText}
        </button>
      </div>
      <div className="flex justify-center">
        <ul role="list" className="divide-y">
          {Object.entries(filteredContractsForModal).slice(0, 20).map(([address, { count, contractsInCommon }]) => (
            <li key={address} className="py-4">
              <div className="flex items-center gap-x-3">
                <img
                  src="/kindredSpirit.png"
                  alt={`Kindred Spirit with ${count} connections`}
                  className="h-6 w-6 flex-none rounded-full bg-gray-800"
                />
                <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-white">
                  <Address address={address} />
                </h3>
              </div>
              <p className="mt-3 truncate text-sm text-gray-500">
              This address holds{" "}
                <span className="text-gray-400">{count}</span> out of the <span className="text-gray-400">{ownedNFTs.length}</span>
                {" "}NFTs in common.
              </p>
              <a
                href={`https://etherscan.io/address/${address}`}
                className="inline-block mx-2 text-indigo-400 bg-indigo-400/10 max-w-button ring-indigo-400/30 rounded-full flex-none my-2 py-1 px-2 text-xs font-medium ring-1 ring-inset ml-auto"
              >
                View on Etherscan
              </a>
              <button onClick={() => downloadCsv(contractsInCommon, address)} className="inline-block mx-2 text-purple-400 bg-purple-400/10 max-w-button ring-purple-400/30 rounded-full flex-none my-2 py-1 px-2 text-xs font-medium ring-1 ring-inset ml-auto">
                Download CSV
              </button>
              <button onClick={() => openModal(address)} className="inline-block mx-2 text-pink-400 bg-pink-400/10 max-w-button ring-pink-400/30 rounded-full flex-none my-2 py-1 px-2 text-xs font-medium ring-1 ring-inset ml-auto">
                View More
              </button>
              {selectedModal === address && (
              <NftModal
                address={modalAddress}
                count={countForModal}
                contractsInCommon={contractsInCommonModal}
                onClose={() => setSelectedModal(null)}
              />
            )}
          </li>
          ))}
        </ul>
      </div>
      <Modal 
        isOpen={isLoading} 
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
        <h2 className="px-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center font-bold text-lg">Summoning Kindred Spirits</h2>🪬
        <p className="px-10 text-center font-light text-slate-800 text-base">Please be patient, we promise not to ghost you.</p>
        <p className="px-10 text-center font-light text-slate-800 text-base">The app may take a while to return results depending on the number of contracts and holders being analyzed. 👻</p>
        <button disabled type="button" className="mt-10 text-white bg-gradient-to-r from-purple-500 to-pink-600 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 items-center">
          <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
          </svg>
          Loading...
      </button>
      </Modal>
    </div>)}
    </div>
  );
};

const ShortAddress = ({address}) => {
  const prefix = address.slice(0, 4);
  const suffix = address.slice(-4);
  const shortAddress = `${prefix}...${suffix}`;

  return (
    <div>{shortAddress}</div>
  )
}

const Address = ({ address }) => {
  const { data, isError, isLoading } = useEnsName({
    address: address,
    chainId: 1,
  });

  return (
    <>
      {isLoading ? (
        address
      ) : isError ? (
        address
      ) : (
        data || <ShortAddress address={address} />
      )}
    </>
  );
};



export default KindredSpiritsList;