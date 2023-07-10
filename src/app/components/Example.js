const KindredSpiritsList = () => {
  const [sortedResult, setSortedResult] = useState({});
  const [modalAddress, setModalAddress] = useState("");
  const [countForModal, setCountForModal] = useState(null);
  const [contractsInCommonModal, setContractsInCommonModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredContractsForModal, setFilteredContractsForModal] = useState({});
  const [totalWallets, setTotalWallets] = useState(0);
  const { ensAddress } = useContext(EnsContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Download Kindred Spirits");


  const openModal = (address) => {
    const { count, contractsInCommon } = filteredContractsForModal[address];
    setModalAddress(address);
    setCountForModal(count);
    setContractsInCommonModal(contractsInCommon);
    setIsModalOpen(true);
  }

  return (
    <div>
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
                You have{" "}
                <span className="text-gray-400">{count}</span> connections
                with this address.
              </p>
              <a
                href={`https://etherscan.io/address/${address}`}
                className="inline-block mx-2 text-indigo-400 bg-indigo-400/10 max-w-button ring-indigo-400/30 rounded-full flex-none my-2 py-1 px-2 text-xs font-medium ring-1 ring-inset ml-auto"
              >
                View on Etherscan
              </a>
              <button onClick={() => downloadCsv(contractsInCommon)} className="inline-block mx-2 text-purple-400 bg-purple-400/10 max-w-button ring-purple-400/30 rounded-full flex-none my-2 py-1 px-2 text-xs font-medium ring-1 ring-inset ml-auto">
                Download CSV
              </button>
              <button onClick={() => openModal(address)} className="inline-block mx-2 text-pink-400 bg-pink-400/10 max-w-button ring-pink-400/30 rounded-full flex-none my-2 py-1 px-2 text-xs font-medium ring-1 ring-inset ml-auto">
                View More
              </button>
              {isModalOpen && <NftModal address={modalAddress} count={countForModal} contractsInCommon={contractsInCommonModal} onClose={() => setIsModalOpen(false)} noClose={() => setIsModalOpen(true)} />}
            </li>
          ))}
        </ul>
      </div>
  );
};

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
        data || address
      )}
    </>
  );
};

export default KindredSpiritsList;

And the second one:

import { Fragment, useState, useEffect   } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useEnsName } from 'wagmi'
import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

export default function NftModal({ onClose, address, count, contractsInCommon, noClose }) {
  const [open, setOpen] = useState(true);
  const [contractsList, setContractsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const modalContracts = async () => {
    const result = []
    for (const contract of contractsInCommon) {
      const response = await alchemy.nft.getContractMetadata(contract)
      result.push(response.name)
    }
    return result
  }

  useEffect(() => {
    const fetchContracts = async () => {
        setLoading(true);
        const contracts = await modalContracts();
        setContractsList(contracts);
        setLoading(false);
        };
        fetchContracts();
    }, [contractsInCommon]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose} static noClose={noClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-60"
          leave="ease-in duration-200"
          leaveFrom="opacity-60"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800/5  transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-60 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-60 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
               <div className="bg-white px-4 py-5 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src="/kindredSpirit.png"
                        alt=""
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        <a href={`https://etherscan.io/address/${address}`} className="hover:underline">
                          <Address address={address} />
                        </a>
                      </p>
                      <p className="text-sm text-gray-500">
                        <a href={`https://etherscan.io/address/${address}`} className="hover:underline">
                        <ShortAddress address={address} />
                        </a>
                      </p>
                    </div>
                    {/* <button onClick={downloadCsv}
                      type="button"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-1.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <CloudArrowDownIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                      Download CSV
                    </button> */}
                  </div>
                </div>
               <div className="text-gray-700 px-4 py-5 sm:px-6">
                  <h2 className='pb-2'>You have <span className='font-semibold'>{count}</span> contracts in common with <span className='font-semibold'>{<Address address={address} />}</span></h2>
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <ul>
                      {contractsList.map((contract, i) => (
                        <li key={i} className="flex justify-around items-center align-middle pt-1">
                          <span>{contract}</span>
                          <a
                            href={`https://etherscan.io/address/${address}`}
                            className="ml-3 inline-block mx-2 text-purple-500 bg-purple-500/10 max-w-button ring-purple-500/30 rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset"
                          >
                            View on Etherscan
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
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
        data || address
      )}
    </>
  );
}

const ShortAddress = ({address}) => {
    const prefix = address.slice(0, 4);
    const suffix = address.slice(-4);
    const shortAddress = `${prefix}...${suffix}`;
  
    return (
      <p>{shortAddress}</p>
    )
  }
 