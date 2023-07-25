  import { useEnsAddress, useEnsName } from 'wagmi';
  import { useState, useContext, useEffect } from 'react';
  import { EnsContext } from './EnsContext'; // Import the context


  export default function EnsInput() {
    const [ensNameOrAddress, setEnsNameOrAddress] = useState('');
    const { data, isError, isLoading } = useEnsAddress({
      name: ensNameOrAddress,
      chainId: 1,
    });
    const { data: dataAddress, isError: addressError, isLoading: isLoadingAddress } = useEnsName({
      address: ensNameOrAddress,
      chainId: 1,
    });
    const { setEnsAddress } = useContext(EnsContext); // Consume the context

    useEffect(() => {
      try {
        if (!isError && !isLoading && data && !ensNameOrAddress.startsWith('0x')) {
          console.log('Setting ENS address:', data);
          setEnsAddress(data);
        }
        if (!addressError && !isLoadingAddress && !data && dataAddress && ensNameOrAddress.startsWith('0x')) {
          console.log('Setting Ethereum address:', dataAddress);
          setEnsAddress(dataAddress);
        }
      } catch (error) {
        console.error('Error setting address:', error);
      }
    }, [data, dataAddress, isLoading, isLoadingAddress, isError, addressError]);
    

    const handleSubmit = async (e, ensNameOrAddress) => {
      e.preventDefault();
      return ensNameOrAddress;
    };

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className='items-center'>
            <label
              htmlFor='ens'
              className='block text-sm font-medium leading-6 text-white px-5 py-3'
            >
              or with Ens
            </label>
            <input
              type='text'
              value={ensNameOrAddress}
              name='ens'
              id='ens'
              onChange={(e) => setEnsNameOrAddress(e.target.value)}
              className='block w-30 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              placeholder='vitalik.eth'
            />
          </div>
        </form>
        {isLoading || isLoadingAddress ? (
          <div className='text-white'>Fetching ens/address…</div>
        ) : isError && addressError ? (
          <div className='text-white'>Error fetching ens/address</div>
        ) : (
          <div className='text-white'></div>
        )}
      </div>
    );
  }


  
/* 
import { useState, useContext, useEffect } from "react";
import {ethers} from "ethers"; // Import ethers library directly
import { useEnsAddress } from "wagmi";
import { EnsContext } from "./EnsContext";

const provider = ethers.getDefaultProvider();

export default function EnsInput() {
  const [ensNameOrAddress, setEnsNameOrAddress] = useState("");
  const { data, isError, isLoading } = useEnsAddress({
    name: ensNameOrAddress,
    chainId: 1,
  });
  const { setEnsAddress } = useContext(EnsContext);

  useEffect(() => {
    async function resolveEnsNameOrAddress() {
      if (!isError && !isLoading && data) {
        setEnsAddress(data);
      } else if (ensNameOrAddress.startsWith("0x")) {
        // Resolve Ethereum address using ENS
        try {
          const ensName = await provider.lookupAddress(ensNameOrAddress);
          if (ensName) {
            setEnsAddress(ensName);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    resolveEnsNameOrAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading, isError, ensNameOrAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    return ensNameOrAddress;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <label
            htmlFor="ens"
            className="block text-sm font-medium leading-6 text-white px-5 py-3"
          >
            or with Ens
          </label>
          <input
            type="text"
            value={ensNameOrAddress}
            name="ens"
            id="ens"
            onChange={(e) => setEnsNameOrAddress(e.target.value)}
            className="block w-30 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="vitalik.eth"
          />
        </div>
      </form>
      {isLoading ? (
        <div className="text-white">Fetching ens/address…</div>
      ) : isError ? (
        <div className="text-white">Error fetching ens/address</div>
      ) : (
        <div className="text-white"></div>
      )}
    </div>
  );
}
*/