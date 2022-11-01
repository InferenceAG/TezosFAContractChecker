import {
    OriginationOperation,
    TransactionOperation,
    TezosToolkit,
    Contract,
  } from "@taquito/taquito";
  
 
import { BigNumber } from "bignumber.js";

import { confirmOperation } from "../../scripts/confirmation";

import { UpdateOperator, Transfer, TransferDestination } from "../types/FA2";

import { FA2NFTStorage } from "../types/FA2nft-specific";
import { FA2SingleStorage } from "../types/FA2single-specific";
import { FA2MultiStorage } from "../types/FA2multi-specific";

import { FA2singlespecific } from "./fa2single-specific";
import { FA2NFTspecific } from "./fa2nft-specific";
import { FA2multispecific } from "./fa2multi-specific";
  
  export class FA2 {
    tezos: TezosToolkit;
    contract: Contract;
    fa2type: string;
    storage: unknown;
    fa2specifics: unknown;
  
    constructor(contract: Contract, tezos: TezosToolkit, fa2type: string, fa2specifics: unknown) {
      this.contract = contract;
      this.tezos = tezos;
      this.fa2type = fa2type;
      this.fa2specifics = fa2specifics;
    }
  
    static async init(fa2Address: string, tezos: TezosToolkit, fa2type: string): Promise<FA2> {
      var fa2specifics: unknown;
      var storage: unknown;
      const contract: Contract = await tezos.contract.at(fa2Address);

      switch (fa2type) {
        case "NFT":
          fa2specifics = new FA2NFTspecific();
          storage = await contract.storage() as FA2NFTStorage;
          break;
        case "single":
          fa2specifics = new FA2singlespecific();
          storage = await contract.storage() as FA2SingleStorage;
          break;
        case "multi":
          fa2specifics = new FA2multispecific();
          storage = await contract.storage() as FA2MultiStorage;
          break;
      }

      return new FA2(contract, tezos, fa2type, fa2specifics);
    }

    async updateStorage(maps = {}): Promise<void> {  
      this.storage = await this.contract.storage();
        
 
      for (const key in maps) {
        this.storage[key] = await maps[key].reduce(
          async (prev: any, current: any) => {
            try {
              return {
                ...(await prev),
                [current]: await storage[key].get(current),
              };
            } catch (ex) {
              return {
                ...(await prev),
                [current]: 0,
              };
            }
          },
          Promise.resolve({})
        );
      }
    }
  
    async transfer(params: Transfer[]): Promise<TransactionOperation> {
      const operation: TransactionOperation = await this.contract.methods
        .transfer(params)
        .send();
  
      await confirmOperation(this.tezos, operation.hash);
  
      return operation;
    }

    async transferSingle(from: string, to: string, tokenId: BigNumber, amount: BigNumber ): Promise<TransactionOperation> {
      const transferDestParams: TransferDestination = {
        to_: to,
        token_id: tokenId,
        amount: amount,
      }
      const transferParam: Transfer = {
          from_: from,
          txs: [transferDestParams],

      }

      const operation: TransactionOperation = await this.contract.methods
        .transfer([transferParam])
        .send();
  
      await confirmOperation(this.tezos, operation.hash);
  
      return operation;
    }
  
    async updateOperators(
      updateOperatorsParams: UpdateOperator[]
    ): Promise<TransactionOperation> {
      const operation: TransactionOperation = await this.contract.methods
        .update_operators(updateOperatorsParams)
        .send();
  
      await confirmOperation(this.tezos, operation.hash);
  
      return operation;
    }

    async addOperator(owner, operator, tokenId): Promise<TransactionOperation> {
      const operation: TransactionOperation = await this.contract.methods
        .update_operators([{
          add_operator: {
            owner: owner,
            operator: operator,
            token_id: tokenId,
          },
        }],)
        .send();
  
      await confirmOperation(this.tezos, operation.hash);
  
      return operation;
    }  
    async removeOperator(owner, operator, tokenId): Promise<TransactionOperation> {
      const operation: TransactionOperation = await this.contract.methods
        .update_operators([{
          remove_operator: {
            owner: owner,
            operator: operator,
            token_id: tokenId,
          },
        }],)
        .send();
  
      await confirmOperation(this.tezos, operation.hash);
  
      return operation;
    }  
   
  }