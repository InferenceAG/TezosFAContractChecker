import { MichelsonMap, MichelsonMapKey, OptionTokenSchema, SetTokenSchema } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type FA2NFTStorage = {
  admin: {
    admin: string;
    paused: boolean;
    pending_admin: OptionTokenSchema;
  };
  assets: {
    ledger: MichelsonMap<MichelsonMapKey, unknown>;
    metadata: {
      metadata: MichelsonMap<MichelsonMapKey, unknown>;
      next_token_id: BigNumber;
      token_defs: SetTokenSchema;
    };
    operators: MichelsonMap<MichelsonMapKey, unknown>;
  };
  metadata: MichelsonMap<MichelsonMapKey, unknown>;
};