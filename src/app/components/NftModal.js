import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useEnsName } from 'wagmi'


export default function NftModal({ onClose, address, count, contractsInCommon, noClose }) {
  const [open, setOpen] = useState(true);


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
                  <ul>
                      {Object.entries(contractsInCommon).map((value) => (
                        <div className="flex justify-around items-center align-middle pt-1">
                        <li className="flex text-sm text-gray-500" key={value}>
                        <ShortAddress address={value} />
                        <a
                          href={`https://etherscan.io/address/${value}`}
                          className="ml-3 inline-block mx-2 text-purple-500 bg-purple-500/10 max-w-button ring-purple-500/30 rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset"
                        >
                  View on Etherscan
                </a>
                        </li>
                        </div>
                      ))}
                    </ul>
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
 