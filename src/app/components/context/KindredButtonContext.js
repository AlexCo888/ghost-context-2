import { createContext, useState } from 'react';

export const KindredButtonContext = createContext();

export const FetchDataProvider = ({ children }) => {
  const [selectedNFTsContext, setSelectedNFTsContext] = useState([]);
  const [triggerKindredSpirits, setTriggerKindredSpirits] = useState(false);

  return (
    <KindredButtonContext.Provider
      value={{
        selectedNFTsContext,
        setSelectedNFTsContext,
        triggerKindredSpirits,
        setTriggerKindredSpirits,
      }}
    >
      {children}
    </KindredButtonContext.Provider>
  );
};

