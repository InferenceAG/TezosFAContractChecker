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
var baseTokenAmount: number = env.fa2initstate.admin.amount[0];
var nonExistantToken: number = env.fa2initstate.nonExistantToken;
const fa2type: string = env.fa2type;


export class FA2testlib {
    util: Utils;
    contract: FA2;

    constructor(contract: FA2, util: Utils) {
        this.contract = contract;
        this.util = util;
      }
    
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

    async transferSelfAmount1(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(1));

        expect(await this.contract.fa2specifics.getBalance(this.contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(baseTokenAmount);
    };
    
    async transferSelfAmount0(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(0));

        expect(await this.contract.fa2specifics.getBalance(this.contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(baseTokenAmount);
    };

    async transferSelfAmount1NonExistantToken(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await rejects(this.contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(nonExistantToken), new BigNumber(1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });
    };

    async transferSelfMoreThanAvailable(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await rejects(this.contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

            return true;
        });
    };
    
    async transferAdminToAliceAmount0(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(0));

        expect(await this.contract.fa2specifics.getBalance(this.contract, admin.pkh,new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount));
        expect(await this.contract.fa2specifics.getBalance(this.contract, alice.pkh,new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));
    };

    async transferAdminToAliceAmount1(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(1));
    
        expect(await this.contract.fa2specifics.getBalance(this.contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1));
        expect(await this.contract.fa2specifics.getBalance(this.contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));
    };

    async transferAdminToAliceAmountTooHigh(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
    
        await rejects(this.contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

            return true;
        });
    };

    async nftBatchTransferAdmin(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.transfer([{from_: admin.pkh, txs: [
            { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) },
            { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) },
            { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }
        ]}]);

        expect(await this.contract.fa2specifics.getBalance(this.contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(878));
        expect(await this.contract.fa2specifics.getBalance(this.contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(111));
        expect(await this.contract.fa2specifics.getBalance(this.contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(10));
        expect(await this.contract.fa2specifics.getBalance(this.contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));    
    };
 n

    // Operator functions
    async operatorAdminRemovesAlice(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    };

    async operatorAdminAddsAlice(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);
    };

    async operatorAliceAddsAdmin(): Promise<unknown> {
        await this.util.setProvider(alice.sk);
        await this.contract.addOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        
        expect(await this.contract.fa2specifics.checkOperator(this.contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(true);
    };

    async operatorBatchAdmin(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.updateOperators([
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}, 
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);
    };

    async operatorBatchAdmin2(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await this.contract.updateOperators([
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}, 
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    };

    async operatorAdminAddsAdminForAlice(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await rejects(this.contract.addOperator(alice.pkh, admin.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });        
    };

    async operatorAdminRemovesAdminForAlice(): Promise<unknown> {
        await this.util.setProvider(admin.sk);
        await rejects(this.contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });     
    };

    async operatorBatch(): Promise<unknown> {
        await this.util.setProvider(admin.sk);

        await this.contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken))
        expect(await this.contract.fa2specifics.checkOperator(this.contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

        await this.util.setProvider(alice.sk);
        await rejects(this.contract.addOperator(admin.pkh, charlie.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });   
        
        await rejects(this.contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });

        await rejects(this.contract.updateOperators([{add_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
                                                   {add_operator: {owner: admin.pkh, operator: charlie.pkh, token_id: new BigNumber(baseToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });

        await rejects(this.contract.updateOperators([{add_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
                                                   {remove_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
                                                   {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

        return true;
        });   
    };


  }

  