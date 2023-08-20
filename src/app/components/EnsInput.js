  import { useEnsAddress, useEnsName } from 'wagmi';
  import { useState, useContext, useEffect } from 'react';
  import { EnsContext } from './context/EnsContext'; 
  import { KindredButtonContext } from './context/KindredButtonContext';



  export default function EnsInput() {
    const [ensNameOrAddress, setEnsNameOrAddress] = useState('');
    const {
      setShowKindredSpirits
    } = useContext(KindredButtonContext);
    
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
          setEnsAddress(data);
          setShowKindredSpirits(false);
        }
        if (!addressError && !isLoadingAddress && !data && dataAddress && ensNameOrAddress.startsWith('0x')) {
          setEnsAddress(dataAddress);
          setShowKindredSpirits(false);
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