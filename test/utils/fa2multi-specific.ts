import { BigNumber } from "bignumber.js";

import { FA2 } from "./fa2";

export class FA2multispecific {

  async getBalance(fa2contract: FA2, user: string, tokenId: BigNumber): Promise<BigNumber> {
    await fa2contract.updateStorage();
    if (await fa2contract.storage.assets.ledger.get([user.toString(), tokenId]) !== undefined) {
      const balance: BigNumber = await fa2contract.storage.assets.ledger.get([user.toString(), tokenId]) as BigNumber;
      
      return balance !== undefined ? new BigNumber(balance) : new BigNumber(0);
    }
    return new BigNumber(0);
  }

  async checkOperator(fa2contract: FA2, owner: string, operator: string, tokenId: BigNumber): Promise<boolean> {
    await fa2contract.updateStorage();
    if (await fa2contract.storage.assets.operators.get([owner.toString(),operator.toString(), tokenId]) !== undefined) {
      return true;
    }

    return false;
  }
}


      