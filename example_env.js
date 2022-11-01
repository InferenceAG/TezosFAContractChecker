import accounts from "./scripts/accounts";

export default {
  outputFile: "output.txt",
  confirmationPollingTimeoutSecond: 500000,
  syncInterval: 15000, // 0 for tests, 5000 for deploying
  confirmTimeout: 180000, // 90000 for tests, 180000 for deploying
  network: "kathmandu",
  networks: {
    mainnet: {
      rpc: "https://mainnet.smartpy.io",
      port: 443,
      network_id: "*",
      secretKey: accounts.admin.sk,
    },
    kathmandu: {
        rpc: "https://kathmandunet.smartpy.io",
        port: 443,
        network_id: "*",
        secretKey: accounts.admin.sk,
      },
  },
  fa2type: "multi", // NFT, single, or multi
  fa2contract: 'KT1xxxxxxx',
  fa2initstate: {
    // token identifier for one tokens which is not defined within the FA2 smart contract to be assessed:
    nonExistantToken: 10,
    admin: {
      // Define the initial tokens in this section. Choose either the template for single, NFT, or multiple.
      // The amounts can not be changed! These amount have to minted / transferred to the "admin" account.

      // single: 1000 tokens are required:
      //tokenId: [0],
      //amount: [1000]
      
      // NFT: 
      //4 differnt NFTs are required:
      //tokenId: [0,1,2,3],
      //amount: [1,1,1,1]
      
      // multi: 
      // Two tokens are required with 1000 tokens of each.
      // tokenId: [0, 1],
      //amount: [1000, 1000]
    },
  },
};
