// Imports the Alchemy SDK
const { Alchemy, Network } = require("alchemy-sdk");

// Configures the Alchemy SDK
const config = {
    apiKey: "jOxnwjsrNk-e--MfwXyELFi6Lw45PVgi", // Replace with your API key
    network: Network.ETH_MAINNET, // Replace with your network
};

// Creates an Alchemy object instance with the config to use for making requests
const alchemy = new Alchemy(config);

const address = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

const main = async () => {
  // define the contract address
  const response = await alchemy.nft.getOwnersForContract(address)
  if (response.owners.length >= 50000) {
  let owners = [];
  let pageKey = response.pageKey;
    while (true) {
      const result = await alchemy.nft.getOwnersForContract(address, {pageKey})
      owners.push(...result.owners);
      console.log(result.pageKey)
      if (!result.pageKey) {
       break;
    }
    pageKey = result.pageKey;
  }
  return owners;
} else {
  return response.owners;
}
} 
    //Call the method to fetch the owners for the contract
    main().then((owners) => {
      console.log(`Total number of owners: ${owners.length}`);
    });
    //Logging the response to the console
    // owners.push(response.owners)
    // console.log(response)
