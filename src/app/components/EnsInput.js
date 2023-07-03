  import { useEnsAddress } from 'wagmi';
  import { useState, useContext, useEffect } from 'react';
  import { EnsContext } from './EnsContext'; // Import the context


  export default function EnsInput() {
    const [ensName, setEnsName] = useState('');
    const { data, isError, isLoading } = useEnsAddress({
      name: ensName,
      chainId: 1,
    });
    const { setEnsAddress } = useContext(EnsContext); // Consume the context

    useEffect(() => {
      if (!isError && !isLoading && data) {
        setEnsAddress(data);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, isLoading, isError]);

    const handleSubmit = async (e, ensName) => {
      e.preventDefault();
      return ensName;
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
              value={ensName}
              name='ens'
              id='ens'
              onChange={(e) => setEnsName(e.target.value)}
              className='block w-30 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              placeholder='vitalik.eth'
            />
          </div>
        </form>
        {isLoading ? (
          <div className='text-white'>Fetching address…</div>
        ) : isError ? (
          <div className='text-white'>Error fetching address</div>
        ) : (
          <div className='text-white'></div>
        )}
      </div>
    );
  }
