import { Utils } from "./utils";
import accounts from "../../scripts/accounts_kathmandu";
import { SBAccount } from "../types/Common";
import { FA2 } from "./fa2";
import { FA2Errors } from "../types/Errors"

import { rejects } from "assert";
import { BigNumber } from "bignumber.js";
import chai, { expect } from "chai";
import  env from "../../env";

chai.use(require('chai-bignumber')(BigNumber));

//var utils: Utils;
var admin: SBAccount = accounts.admin;
var alice: SBAccount = accounts.alice;
var bob: SBAccount = accounts.bob;
var charlie: SBAccount = accounts.charlie;
var baseToken: number = env.fa2initstate.admin.tokenId[0];
const fa2type: string = env.fa2type;

export class FA2testlib {
    util: Utils;
    contract: FA2;

    constructor(contract: FA2, util: Utils) {
        this.contract = contract;
        this.util = util;
    };
    
    async initState(): Promise<unknown> {
        
        await this.util.setProvider(admin.sk);
        if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, bob.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, charlie.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(admin.pkh, charlie.pkh, new BigNumber(baseToken));
        }

        var balA : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, alice.pkh, new BigNumber(baseToken));
        var balB : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, bob.pkh, new BigNumber(baseToken));
        var balC : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, charlie.pkh, new BigNumber(baseToken));    

        await this.util.setProvider(alice.sk);
        if (balA > new BigNumber(0)) {
            await this.contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(baseToken), balA);
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, admin.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, bob.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(alice.pkh, bob.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, charlie.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(alice.pkh, charlie.pkh, new BigNumber(baseToken));
        }

        await this.util.setProvider(bob.sk);
        if (balB > new BigNumber(0)) {
            await this.contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(baseToken), balB);
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, admin.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(bob.pkh, admin.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, alice.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(bob.pkh, alice.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, charlie.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(bob.pkh, charlie.pkh, new BigNumber(baseToken));
        }

        await this.util.setProvider(charlie.sk);
        if (balC > new BigNumber(0)) {
            await this.contract.transferSingle(charlie.pkh, admin.pkh, new BigNumber(baseToken), balC);
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, admin.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(charlie.pkh, admin.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, alice.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(charlie.pkh, alice.pkh, new BigNumber(baseToken));
        }
        if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, bob.pkh, new BigNumber(baseToken))) {
            await this.contract.removeOperator(charlie.pkh, bob.pkh, new BigNumber(baseToken));
        }

        await this.util.setProvider(admin.sk);   
        switch (fa2type) {
            case "NFT":
                await this.util.setProvider(admin.sk);
                if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(admin.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                var balA : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                var balB : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                var balC : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2])); 

                await this.util.setProvider(alice.sk);
                if (balA > new BigNumber(0)) {
                    await this.contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]), balA);
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(alice.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(alice.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }

                await this.util.setProvider(bob.sk);
                if (balB > new BigNumber(0)) {
                    await this.contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]), balB);
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(bob.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }

                await this.util.setProvider(charlie.sk);
                if (balC > new BigNumber(0)) {
                    await this.contract.transferSingle(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]), balC);
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(charlie.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))) {
                    await this.contract.removeOperator(charlie.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]));
                }
                // No break, since we want to do the above plus the following for the NFT case
                //break;
            case "multi":
                var balA : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                var balB : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                var balC : BigNumber = await this.contract.fa2specifics.getBalance(this.contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1])); 

                await this.util.setProvider(admin.sk);
                if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(admin.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                   
                await this.util.setProvider(alice.sk);
                if (balA > new BigNumber(0)) {
                    await this.contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), balA);
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(alice.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(alice.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }

                await this.util.setProvider(bob.sk);
                if (balB > new BigNumber(0)) {
                    await this.contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), balB);
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, bob.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(bob.pkh, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }

                await this.util.setProvider(charlie.sk);
                if (balC > new BigNumber(0)) {
                    await this.contract.transferSingle(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), balC);
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(charlie.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                if (await this.contract.fa2specifics.checkOperator(this.contract, charlie.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))) {
                    await this.contract.removeOperator(charlie.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));
                }
                break;
        }   
    };
};
  