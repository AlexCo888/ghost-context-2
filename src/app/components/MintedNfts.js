const people = [
  {
    name: 'NFT of the Day #1',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #2',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #3',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #4',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #5',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #6',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #6',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },
  {
    name: 'NFT of the Day #6',
    role: 'Ghost Context',
    imageUrl: '/firstGhostContextNFT.png',
  },

  // More people...
];

export default function MintedNfts() {
  return (
    <div className='bg-gray-900 py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl lg:mx-0'>
          <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            Our NFTs
          </h2>
          <p className='mt-6 text-lg leading-8 text-gray-300'>
            Anyone can mint 'ghost context' NFTs and benefit from the
            connections they offer, as we are a vibrant team driven by passion
            and committed to delivering exceptional outcomes for our users.
          </p>
        </div>
        <ul
          role='list'
          className='mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4'
        >
          {people.map((person) => (
            <li key={person.name}>
              <img
                className='aspect-[14/13] w-full rounded-2xl object-cover'
                src={person.imageUrl}
                alt=''
              />
              <h3 className='mt-6 text-lg font-semibold leading-8 tracking-tight text-white'>
                {person.name}
              </h3>
              <p className='text-base leading-7 text-gray-300'>{person.role}</p>
              <p className='text-sm leading-6 text-gray-500'>
                {person.location}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
