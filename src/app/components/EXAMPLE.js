import { useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [adressToEns, setAdressToEns] = useState('');
  const { data, isError, isLoading } = useEnsName({
    address: adressToEns,
    chainId: 1,
  });
  const [sortedResult, setSortedResult] = useState({
    "0xb0ccf43ada6cbaa26dcf4907117b496d49f74242": 15,
    "0xdf56f967ce2f81298ac177ff828897cb33ea2243": 14,
    "0x70ece45cdc64a768f936ccb8ac851578251363e3": 13,
    "0x5507dbd48a5a5bace8a6030e878cc4e0af147c33": 11,
    "0x0bb602f88bf886282ff69d4cec937cc2a7d9e19a": 10,
    "0xf6eb526bffa8d5036746df58fef23fb091739c44": 10,
    "0x200ce646610bef24b988d1125b779c22ece4a2d4": 9
  });

  useEffect(() => {
    const updateSortedResult = async () => {
      const newSortedResult = {};
      for (const [address, value] of Object.entries(sortedResult)) {
        try {
          newSortedResult[data || address] = value;
        } catch (error) {
          newSortedResult[address] = value;
        }
      }
      setSortedResult(newSortedResult);
    };
    updateSortedResult();
  }, []);

  useEffect(() => {
    for (const address of Object.keys(sortedResult)) {
      setAdressToEns(address);
    }
  }, []);

  return (
    <div>
      {Object.entries(sortedResult).map(([address, value]) => (
        <div key={address}>
          <p>{address}</p>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}