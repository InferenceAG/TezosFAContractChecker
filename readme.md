# FA2 smart contract testing suite
## Introduction
This is a suite of test cases for Tezos smart contracts in order to check the correct implementation of the FA2 interface standard according to [TZIP-012](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md) (Commit: 1728fcfe0ac90463ef15e6a994b6d6a15357e373). 

This suite can be used by smart contract developers or security assessors to check correct working of their developed or assessed FA2 smart contract.

The defined test cases are checking the correct working of the following FA2 entrypoints:
- transfer
- update_operators
- balance_of (with "run_view". TODO: with effective (dummy) callback contract)

## Limitations
- The FA2 smart contract assumes the "default transfer permission policy" is applied. The FA2 smart contract testing suite does not include any test cases for other permission policies.
- metadata not checked (neither storage layout nor content)
- token metadata not checked (neither storage layout nor content)
- off-chain views not checked
- Entrypoint balance_of is not (yet) checked. -> TODO
- Test cases under "FA2 special case testing" can not be called directly (only), since they often depend on previous executed tests. Note: This has been initally written this way in order to save time (transactions). 

## TODO / ideas / improvements:
- add/change test cases to support on-chain testcases for balance_of (instead of run_view).
- clean up code (e.g. fa2testlib.ts still required or to be merged with fa2.test.ts?)
- check whether it is appropriate and good coding style to dynamically assign types (used in init() function in utils/fa2.ts).
- are the storage type structures files "types/FA2multi-specifics.ts", "types/FA2single-specifics.ts", and "types/FA2NFT-specifics.ts" (still) required?
- review of test cases / link test cases to clauses in TZIP-012
- automatic setup of accounts and tez funding
- DApp / front end 
- better support for assessment projects (supporting multiple environments and easy switch between them.: env, FA2 type def, fa2 utils, etc.)
- support for FA1.2
- installation steps

## How to install
- [NVM install](https://github.com/nvm-sh/nvm#installing-and-updating)
- Install nodejs: `nvm install node`
- Install npm packages: `npm i`

## How to use
### Adaption of storage definition
This FA2 smart contract testing suite supports the different ledger asset types as outlined in the [FA2 interface standard](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-balance-updates)
- multi asset
- NFT asset
- single asset

However, since the ledger can effectively be at a different locations in storage in a real world implementation, the corresponding storage definition has to be adapted to the effective FA2 smart contract:
- [test/types/FA2multi-specific.ts](test/types/FA2multi-specific.ts)
- [test/types/FA2nft-specific.ts](test/types/FA2nft-specific.ts)
- [test/types/FA2single-specific.ts](test/types/FA2single-specific.ts)

### Adaption of helper functions
The suite requires some helper functions in order to extract the balances and set operators. Since these functions can be specific to each smart contract, these functions have to be adjusted:
- [test/utils/fa2multi-specific.ts](test/utils/fa2multi-specific.ts)
- [test/utils/fa2nft-specific.ts](test/utils/fa2nft-specific.ts)
- [test/utils/fa2single-specific.ts](test/utils/fa2single-specific.ts)

### Execution
npm test

### Accounts
Four Tezos accounts are required. These acccounts have to be configured in the file ./scripts/acccounts.ts. A default acccount file can be found here [./scripts/default_accounts.js](scripts/default_accounts.ts).

The names of the accounts (admin, alice, bob, and charlie) in the default account should not be changed. Just insert the public key hash (PKH), public key (PK), and secret key (SK) into the template.

Ensure the accounts have sufficient tez to pay for the transaction they emit.

### Configuration in env.ts
You have to create an env.js in the root directory of the repo. An example/template file can be found here: [example_env.js](example_env.js). Please see comments in the example/template file.

### Initial token distribution
All required tokens have to be given (minted / transferred) to the admin account. See comments in 

## Contribution
Everyone is invited to contribute to the FA2 smart contract testing suite. We are eager to see new ideas, read new test cases and foster the development of the suite by everyone in the Tezos ecosystem.

## Disclaimer
This FA2 smart contract testing suite is currently "work in progress". The FA2 smart contract testing suite does not claim to be complete at any time as it is continuously developed.

## Contact
This github repository is currently maintained by [Inference](https://inference.ag).