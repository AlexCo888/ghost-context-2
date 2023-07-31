import { createContext, useState } from 'react';

export const KindredButtonContext = createContext();

export const FetchDataProvider = ({ children }) => {
  const [selectedNFTsContext, setSelectedNFTsContext] = useState([]);
  const [triggerKindredSpirits, setTriggerKindredSpirits] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [showKindredSpirits, setShowKindredSpirits] = useState(true);

  return (
    <KindredButtonContext.Provider
      value={{
        selectedNFTsContext,
        setSelectedNFTsContext,
        triggerKindredSpirits,
        setTriggerKindredSpirits,
        ownedNFTs,
        setOwnedNFTs,
        showKindredSpirits,
        setShowKindredSpirits
      }}
    >
      {children}
    </KindredButtonContext.Provider>
  );
};

