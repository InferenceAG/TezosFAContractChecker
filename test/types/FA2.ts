import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type UserFA2Info = {
  balances: MichelsonMap<MichelsonMapKey, unknown>;
  allowances: string[];
};

export type Operator = {
  owner: string;
  operator: string;
  token_id: BigNumber;
};

export type UpdateOperator =
  | { add_operator: Operator }
  | { remove_operator: Operator };

export type TransferDestination = {
  to_: string;
  token_id: BigNumber;
  amount: BigNumber;
};

export type Transfer = {
  from_: string;
  txs: TransferDestination[];
};

export type BalanceRequest = {
  owner: string;
  token_id: BigNumber;
};

export type BalanceResponse = {
  request: BalanceRequest;
  balance: BigNumber;
};
