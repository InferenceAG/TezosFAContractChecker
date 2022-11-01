import { BigNumber } from "bignumber.js";

import { FA2 } from "./fa2";

export class FA2NFTspecific {

  async getBalance(fa2contract: FA2, user: string, tokenId: BigNumber): Promise<BigNumber> {
    await fa2contract.updateStorage();
    if (await fa2contract.storage.assets.ledger.get(tokenId) !== undefined) {
      const owner: string = await fa2contract.storage.assets.ledger.get(tokenId) as string;
      if (owner == user) {
        return new BigNumber(1);
      }
      return new BigNumber(0);
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