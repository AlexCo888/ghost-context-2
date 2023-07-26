'use client'
import { useState } from 'react';

export default function NftDescription({ nft }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div className="w-64 max-w-lg overflow-auto nice-scrollbar">  {/* Here's the added class */}
      {nft && showFullDescription ? (
        <p>{nft.description}</p>
      ) : (
        <p>{nft.description.substring(0, 20)}...</p>
      )}
      <span className='cursor-pointer text-white text-xsm font-bold' onClick={toggleDescription}>
        {showFullDescription ? 'See less' : 'See more'}
      </span>
    </div>
  );
};