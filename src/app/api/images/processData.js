// app/api/processData.js
import { lookupEnsName, getOwnersForContract } from "../../utils";

export async function post(req, res) {
  const { nftAddressesArray } = req.body;

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

    res.status(200).json({
      message: 'Data processed successfully',
      ownersCount,
      contractsInCommon
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing data' });
  }
}
