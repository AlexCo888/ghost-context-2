export async function POST(request) {
    const { nftAddressesArray } = await request.json();
  
    try {
      let ownersCount = {};
      let contractsInCommon = {};
  
      for (const nftAddress of nftAddressesArray) {
        const owners = await getOwnersForContract(nftAddress);
  
        owners.forEach((owner) => {
          if (ownersCount[owner]) {
            ownersCount[owner]++;
          } else {
            ownersCount[owner] = 1;
          }
          if (contractsInCommon[owner]) {
            contractsInCommon[owner].count++;
            contractsInCommon[owner].contractsInCommon.push(nftAddress);
          } else {
            contractsInCommon[owner] = { count: 1, contractsInCommon: [nftAddress] };
          }
        });
      }
  
      // You can further process and filter your results here
  
      return new Response(JSON.stringify({
        message: 'Data processed successfully',
        ownersCount,
        contractsInCommon
      }), {status: 200});
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ message: 'Error processing data' }), {status: 500});
    }
  }