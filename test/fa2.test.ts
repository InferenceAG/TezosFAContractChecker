import "@taquito/rpc";
import { Utils } from "./utils/utils";
import accounts from "../scripts/accounts_kathmandu";
import { SBAccount } from "./types/Common";
import { FA2 } from "./utils/fa2";
import  env from "../env";
import { rejects } from "assert";
import { FA2Errors } from "./types/Errors"
import { BalanceResponse } from "./types/FA2";

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";
import { FA2testlib} from "./utils/fa2testlib";

chai.use(require('chai-bignumber')(BigNumber));

var utils: Utils;

const admin: SBAccount = accounts.admin;
const alice: SBAccount = accounts.alice;
const bob: SBAccount = accounts.bob;
const charlie: SBAccount = accounts.charlie;

var fa2contract: FA2;
var fa2testlib: FA2testlib;

const baseToken: number = env.fa2initstate.admin.tokenId[0];
const baseTokenAmount: number = env.fa2initstate.admin.amount[0];
const nonExistantToken: number = env.fa2initstate.nonExistantToken;

const fa2type: string = env.fa2type;
const fa2balanceOfCallbackContract: string = env.fa2balanceOfCallbackContract;

describe("FA2 generic transfer testing", () => {
    
    before("setup", async () => {
        utils = new Utils();
        await utils.init(admin.sk);
        fa2contract = await FA2.init(env.fa2contract, utils.tezos, fa2type, fa2balanceOfCallbackContract);
        fa2contract.updateStorage();
        fa2testlib = new FA2testlib(fa2contract, utils);
        await fa2testlib.initState();
    });
    
    // Generic transfer test cases:
    it("#1 - Transfer of 1 token from admin to admin by admin", async () => {
        // Expected result: Successful execution.
        await utils.setProvider(admin.sk);
        await fa2contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(1));

        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(baseTokenAmount);
    });
    
    it("#2 - Transfer of 0 tokens from admin to admin by admin", async () => {
        // Expected result: Successful execution.
        await utils.setProvider(admin.sk);
        await fa2contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(0));

        expect(await  fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(baseTokenAmount);
    });

    it("#3 - Transfer of too many tokens from admin to admin by admin", async () => {
        // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

            return true;
        });
    });

    it("#4 - Transfer of too many tokens from admin to alice by admin", async () => {
        // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

            return true;
        });
    });

    it("#5 - Transfer of 0 tokens from admin to alice by admin ", async () => {
        // Expected result:  Successful execution.
        await utils.setProvider(admin.sk);
        await fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(0));

        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh,new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh,new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));
    });

    it("#6 - Transfer of 1 token from admin to alice by admin.", async () => {
        // Test case: Transfer of 1 token from admin to alice by admin.
        // Expected result:  Successful execution.
        await utils.setProvider(admin.sk);
        await fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(1));
    
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));

        // Test teardown: Transfer of 1 token from alice to admin by alice
        await utils.setProvider(alice.sk);
        await fa2contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(1));
    
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));

    });

    it("#7 - Transfers of non existant token", async () => {
        // Expected result: All transfers are failing with error message: FA2_TOKEN_UNDEFINED
        await utils.setProvider(admin.sk);

        // Execute test: 0 non existant token from Admin to Admin
        await rejects(fa2contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(nonExistantToken), new BigNumber(0)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Execute test: 1 non existant token from Admin to Admin
        await rejects(fa2contract.transferSingle(admin.pkh, admin.pkh, new BigNumber(nonExistantToken), new BigNumber(1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Execute test: 0 non existant token from Admin to Alice
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(nonExistantToken), new BigNumber(0)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Execute test: 1 non existant token from Admin to Admin
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(nonExistantToken), new BigNumber(1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });
    });
});

describe("FA2 generic operator transfer testing", () => {

    before("setup", async () => {
        utils = new Utils();
        await utils.init(admin.sk);
        fa2contract = await FA2.init(env.fa2contract, utils.tezos, fa2type, fa2balanceOfCallbackContract);
        fa2contract.updateStorage();
        fa2testlib = new FA2testlib(fa2contract, utils);
        await fa2testlib.initState();
    });

    it("#1 - Non-authorized operator transfers 1 token from admin to alice by alice", async () => {
        // Expected result: Failing with error message: FA2_NOT_OPERATOR
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

            return true;
        });
    });

    it("#2 - Non-authorized operator transfers 0 token from admin to alice by alice", async () => {
        // Expected result: Failing with error message: FA2_NOT_OPERATOR
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(0)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

            return true;
        });
    });

    it("#3 - Non-authorized operator transfers too many tokens from admin to alice by alice", async () => {
        // Expected result: Failing with error message: FA2_NOT_OPERATOR
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

            return true;
        });
    });

    it("#4 - Non-authorized operator transfers 1 token from admin to bob by alice", async () => {
        // Expected result: Failing with error message: FA2_NOT_OPERATOR
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(baseToken), new BigNumber(1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

            return true;
        });
    });

    it("#5 - Non-authorized operator transfers 0 token from admin to bob by alice", async () => {
        // Expected result: Failing with error message: FA2_NOT_OPERATOR
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(baseToken), new BigNumber(0)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

            return true;
        });
    });

    it("#6 - Non-authorized operator transfers too many tokens from admin to bob by alice", async () => {
        // Expected result: Failing with error message: FA2_NOT_OPERATOR
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

            return true;
        });
    });

    it("#7 - Operator alice for admin transfers 1 token from admin to alice", async () => {
        // Expected result: Successful execution

        // Test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

        // Execute test:
        await utils.setProvider(alice.sk);
        await fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(1));

        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));
        
        // Test teardown:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        await utils.setProvider(alice.sk);
        await fa2contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(1));
    });

    it("#8 - Operator alice for admin transfers 0 token from admin to alice", async () => {
        // Expected result: Successful execution

        // Test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

        // Execute test:
        await utils.setProvider(alice.sk);
        await fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(0));

        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));
        
        // Test teardown:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
    });

    it("#9 - Operator alice transfers too many tokens from admin to alice by alice", async () => {
        // Expected result: Failing with error message: FA2_INSUFFICENT_BALANCE

        // Test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

        // Execute test:
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

            return true;
        });
        
        // Test teardown:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));   
    });

    it("#10 - Operator alice for admin transfers 1 token from admin to bob", async () => {
        // Expected result: Successful execution

        // Test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

        // Execute test:
        await utils.setProvider(alice.sk);
        await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(baseToken), new BigNumber(1));

        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));
        
        // Test teardown:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        await utils.setProvider(bob.sk);
        await fa2contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(1));
    });

    it("#11 - Operator alice for admin transfers 0 token from admin to bob", async () => {
        // Expected result: Successful execution

        // Test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

        // Execute test:
        await utils.setProvider(alice.sk);
        await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(baseToken), new BigNumber(0));

        expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));
        expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(0));
        
        // Test teardown:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
    });

    it("#12 - Operator alice transfers too many tokens from admin to bob by alice", async () => {
        // Expected result: Failing with error message: FA2_INSUFFICENT_BALANCE

        // Test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

        // Execute test:
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(baseTokenAmount+1)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

            return true;
        });
        
        // Test teardown:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken)); 
    });
});

describe("FA2 generic update_operators test cases", () => {
    
    before("setup", async () => {
        utils = new Utils();
        await utils.init(admin.sk);
        fa2contract = await FA2.init(env.fa2contract, utils.tezos, fa2type, fa2balanceOfCallbackContract);
        fa2contract.updateStorage();
        fa2testlib = new FA2testlib(fa2contract, utils);
        await fa2testlib.initState();
    });

    // Generic operator test cases:
    it("#1 - Admin removes Alice as an operator", async () => {
        // Checks whether removal of an operator works as well, if the user is not registered as an operator.
        // Note: Not a hard requirements according to TZIP-012.
        // Expected result: Successful execution.

        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#2 - Admin adds Alice as an operator and removes Alice again afterwards (in a new operation)", async () => {
        // Expected result: Successful execution.

        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);
        
        // Admin removes Alice as operator
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#3 - Admin adds, removes, and adds Alice as an operator within a batch transaction", async () => {
        // Checks whether batches are applied in the correct order. 
        // Expected result: Successful execution. Alice ends up being an operator for Admin.

        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.updateOperators([
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}, 
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

        // Test teardown: Remove Alice as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#4 - Admin removes, adds, and removes Alice as an operator within a batch transaction", async () => {
        // Checks whether batches are applied in the correct order. 
        // Expected result: Successful execution. Alice ends up not being an operator for Admin.

        // Test setup: Add Alice as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.updateOperators([
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}, 
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#5 - Admin removes and adds Alice as an operator within a batch transaction", async () => {
        // Checks whether batches are applied in the correct order. 
        // Expected result: Successful execution. Alice ends up being an operator for Admin.

        // Test setup: Add Alice as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);
        
        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.updateOperators([
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

        // Test teardown: Remove Alice as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#6 - Admin adds and removes Alice as an operator within a batch transaction", async () => {
        // Checks whether batches are applied in the correct order. 
        // Expected result: Successful execution

        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.updateOperators([
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}, 
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#7 - Admin adds Admin for Alice", async () => {
        // Checks whether only owner is able to add operators for own address. 
        // Expected result: Failing with error message: FA2_NOT_OWNER
        
        // Execute test.
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });   
    });

    it("#8 - Admin as an operator for Alice adds Bob as an operator for Alice", async () => {
        // Checks whether only owner is able to add operators for own address. 
        // Expected result: Failing with error message: FA2_NOT_OWNER

        // Test setup: Add Admin as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(true);
        
        // Execute test.
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.addOperator(alice.pkh, bob.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });   

        // Test teardown: Remove Admin as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(false);
    });

    it("#9 - Admin removes Admin as an operator for Alice. However, admin is not an operator in this test case", async () => {
        // Checks whether only owner is able to remove an operator for own address. 
        // Expected result: Failing with error message: FA2_NOT_OWNER

        // Test setup:
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(false);

        // Admin removes admin for Alice
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });  
    });

    it("#10 - Admin as an operator for Alice removes Admin as an operator for Alice", async () => {
        // Checks whether only owner is able to remove an operator for own address. 
        // Expected result: Failing with error message: FA2_NOT_OWNER

        // Test setup: Add Admin as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(true);
        
        // Execute test:
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });  
        
        // Test teardown: Remove Admin as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(false);

    });

    it("#11 - Admin as an operator for Alice removes Bob as an operator for Alice", async () => {
        // Checks whether only owner is able to remove an operator for own address. 
        // Expected result: Failing with error message: FA2_NOT_OWNER

        // Test setup: Add Admin and Bob as operators for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.updateOperators([
            {add_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
            {add_operator: {owner: alice.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}]);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(true);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, bob.pkh, new BigNumber(baseToken))).equal(true);
        
        // Execute test:
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.removeOperator(alice.pkh, bob.pkh, new BigNumber(baseToken)), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });  
        
        // Test teardown: Remove Admin and Bod as operators for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.updateOperators([
            {remove_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
            {remove_operator: {owner: alice.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}]);
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(false);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, bob.pkh, new BigNumber(baseToken))).equal(false);

    });

    it("#12 - Batches are working correctly when adding & removing operators", async () => {
        // Checks whether owner is updated for the second operation in a batch.

        // Execute test for "adding":
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.updateOperators([{add_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
                                                {add_operator: {owner: admin.pkh, operator: charlie.pkh, token_id: new BigNumber(baseToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

            return true;
        });

        // Test preparation: Add Admin as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(true);

        // Test preparation: Add Bob as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(true);

        // Execute test for "removing"
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.updateOperators([
                {remove_operator: {owner: alice.pkh, operator: admin.pkh, token_id: new BigNumber(baseToken)}},
                {remove_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}
            ]), (err, Error) => {
                expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

                return true;                              
        });
            
        // Execute test for "mix 1"
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.updateOperators([
                {add_operator: {owner: alice.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}},
                {remove_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}
            ]), (err, Error) => {
                expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

                return true;
        });

        // Test preparation: Add Charlie as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.addOperator(alice.pkh, charlie.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, charlie.pkh, new BigNumber(baseToken))).equal(true);


        // Execute test for "mix 2"
        await utils.setProvider(alice.sk);
        await rejects(fa2contract.updateOperators([
                {remove_operator: {owner: alice.pkh, operator: charlie.pkh, token_id: new BigNumber(baseToken)}},
                {add_operator: {owner: admin.pkh, operator: charlie.pkh, token_id: new BigNumber(baseToken)}}
            ]), (err, Error) => {
                expect(err.message).to.equal(FA2Errors.FA2_NOT_OWNER);

                return true;
        });

        // Test teardown: Remove Admin as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.removeOperator(alice.pkh, admin.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, admin.pkh, new BigNumber(baseToken))).equal(false);

        // Test teardown: Remove Bob as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(false);

        // Test teardown: Remove Charlie as an operator for Alice
        await utils.setProvider(alice.sk);
        await fa2contract.removeOperator(alice.pkh, charlie.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, alice.pkh, charlie.pkh, new BigNumber(baseToken))).equal(false);

    });

    it("#13 - Batches are working correctly when adding & removing operators", async () => {
        // Test case: Batches are working correctly when adding & removing operators
        // Checks whether operator is updated for the second operation in a batch.
        // Expected result: Successful execution

        // Execute test:
        await utils.setProvider(admin.sk);
        await fa2contract.updateOperators([
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {add_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}]);
        
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(true);

        await fa2contract.updateOperators([
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {remove_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(false);

        // Test preparation: Add Charlie as an operator for Alice
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(true);

        // Execute test for mix (1)
        await fa2contract.updateOperators([
            {add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {remove_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(false);

        // Execute test for mix (2)
        await fa2contract.updateOperators([
            {remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
            {add_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(baseToken)}}]);

        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(true);

        // Test teardown: Remove Bob as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(false);
    });

    /*
    // Commented out, since TZIP-012 does not define how to deal with upate_operator operation for non existant tokens.
    it("#14 - Batches are working correctly when adding & removing operators", async () => {
        // Checks whether tokenId is updated for the second operation in a batch.
        // Expected result: Failing with error message: FA2_TOKEN_UNDEFINED

        // Execute test for adding operators:
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.updateOperators([{add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
                                                {add_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(nonExistantToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Test preparation: Add Alice as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

        // Test preparation: Add Bob as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.addOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(true);

        // Execute test for removing operators
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.updateOperators([{remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
                                                {remove_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(nonExistantToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Execute test for mix 1:
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.updateOperators([{remove_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
                                                {add_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(nonExistantToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Execute test for mix 2:
        await utils.setProvider(admin.sk);
        await rejects(fa2contract.updateOperators([{add_operator: {owner: admin.pkh, operator: alice.pkh, token_id: new BigNumber(baseToken)}},
                                                {remove_operator: {owner: admin.pkh, operator: bob.pkh, token_id: new BigNumber(nonExistantToken)}}]), (err, Error) => {
            expect(err.message).to.equal(FA2Errors.FA2_TOKEN_UNDEFINED);

            return true;
        });

        // Test teardown: Remove Alice as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);

        // Test teardown: Remove Bob as an operator for Admin
        await utils.setProvider(admin.sk);
        await fa2contract.removeOperator(admin.pkh, bob.pkh, new BigNumber(baseToken));
        expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, bob.pkh, new BigNumber(baseToken))).equal(false);

    });
    */
    
});

describe("FA2 special case testing", () => {
    
    before("setup", async () => {
        utils = new Utils();
        await utils.init(admin.sk);
        fa2contract = await FA2.init(env.fa2contract, utils.tezos, fa2type, fa2balanceOfCallbackContract);
        fa2contract.updateStorage();
        fa2testlib = new FA2testlib(fa2contract, utils);
        await fa2testlib.initState();
    });

    switch (fa2type) {
        case "NFT":
            it("NFT specific transfer test #1", async () => {
                // Test case: Batch transfer by admin to different recipients and different token amounts.
                // Expected result: Successful execution.
                await utils.setProvider(admin.sk);
                await fa2contract.transfer([
                    {from_: admin.pkh, txs: [
                        { to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) },
                        { to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) },
                        { to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[2]), amount: new BigNumber(1) }
                    ]}]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))).to.be.bignumber.equal(new BigNumber(1));    
            });

            // Important note: Dependent on prevoius state.
            it("NFT specific transfer test #2", async () => {
                // Test case: Batch transfer by alice, but where an NFT has already transferred in a previous operation in the same batch.
                // Checks whether balance has been (internally) updated from first transfer. Thus, correct balance is (internally) available for second transfer.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE

                // Execute test:
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([
                    {from_: alice.pkh, txs: [
                        { to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) },
                        { to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }
                    ]}]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                        return true;
                    });

                // Execute test:  Same, but different order of transfer than before
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([
                    {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                    {from_: alice.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                        return true;
                    });
            });

            // Important note: Dependent on previous state.
            it("NFT specific transfer test #3", async () => {
                // Test case: Batch transfer by alice, but where one transfer is from different owner, where alice is not operator.
                // Checks whether "from" is (internally) updated. 
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR

                // Execute test:
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([
                    {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                    {from_: bob.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                        return true;
                    });

                // Execute test: Same, but different order of transfer than before
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([
                    {from_: bob.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]},
                    {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                        return true;
                    });
            });

            // Important note: Dependent on previous state.
            it("NFT specific operator transfer test #1", async () => {
                // Test case: Batch transfer by alice, but where one transfer is for a different owner where Alice is operator.
                // Expected result: Successful execution.
                await utils.setProvider(bob.sk);
                await fa2contract.addOperator(bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));

                await utils.setProvider(alice.sk);
                await fa2contract.transfer([
                    {from_: bob.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]},
                    {from_: alice.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}]);

                await utils.setProvider(bob.sk);
                await fa2contract.removeOperator(bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));

                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(0));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[2]))).to.be.bignumber.equal(new BigNumber(1)); 
            });

            // Important note: Dependent on previous state.
            it("NFT specific operator transfer test #2", async () => {
                // Test case: Batch transfer by admin, but where transfers are for a different owner. But admin only has operator permission for one token.
                // Checks whether "tokenId" is (internally) updated. 
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR

                await utils.setProvider(charlie.sk);
                await fa2contract.addOperator(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));

                // Execute test:
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                    {from_: charlie.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                    {from_: charlie.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                        return true;
                    });

                // Execute test: Same, but different structure than before
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer(
                    [{from_: charlie.pkh, txs: [
                        { to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }, 
                        { to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]},
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                        return true;
                    });
            });

            // Important note: Dependent on previous state.
            it("NFT specific operator transfer test #3", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner charlie, where admin is operator and one transfer with owner bob, where admin is not ooperator.
                // Checks whether "operator" permission is not taken over.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR

                // Already granted in previous test case.
                //await utils.setProvider(charlie.sk);
                //await fa2contract.addOperator(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));

                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: charlie.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                                                    {from_: bob.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}
                ]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            break;
                 
        case "multi":
            it("#1 - multi specific transfer test", async () => {
                // Test case: Batch transfer by admin to different recipients and different token amounts.
                // Checks whether tokenId is (internally) updated.
                // Checks whether balance is (internally) updated.
                // Expected result: Successful execution.
                await utils.setProvider(admin.sk);
                await fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        { to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100) },
                        { to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) },
                        { to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }
                ]}]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[0]-101));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[1]-10));
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(100));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(10));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(1));     

                // Test case: Variant to before
                await utils.setProvider(admin.sk);
                await fa2contract.transfer([
                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                    {from_: admin.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) }]},
                    {from_: admin.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}
                ]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[0]-101-101));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[1]-10-10));
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(200));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(20));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(2));     

                // test teardown:

            });

            // Important note: Dependent on previous state.
            it("#2 - multi specific transfer test", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner alice, where admin is not operator.
                // Cheecks whether "from" is (internally) updated.
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                        {from_: alice.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
            
                        return true;
                    }); 
            });

            // Important note: Dependent on previous state.
            it("#3 - multi specific transfer test", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner alice, where admin is operator, but for a different token. 
                // Checks whether "tokenID" is (internally) updated.
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(alice.sk);
                await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                        {from_: alice.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
            
                        return true;
                    }); 
            });

            it("#4 - multi specific transfer test", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner alice, where admin is operator and one transfer with owner bob, where admin is not ooperator.
                // Checks whether "operator" permission is not taken over.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR                
                
                // Already granted in previous test case.
                //await utils.setProvider(alice.sk);
                //await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));
                
                // Test setup:
                await utils.setProvider(admin.sk);
                await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(10));

                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: alice.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                        {from_: bob.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(10)}]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
            
                        return true;
                    }); 
            });
   
            // No break, since we also want to execute all single test cases for the "multi" case. First, we restore initial state:
            //break; 
            // reverse
            it("reverse to initial state", async () => {
                await fa2testlib.initState();
            });

        case "single":
            // Test case: Batch transfer by admin to different recipients and different token amounts.
            // Expected result: Successful execution.
            it("#1 - single specific transfer test", async () => {

                // Execute test:
                await utils.setProvider(admin.sk);
                await fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(100) },
                        { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) },
                        { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }
                ]}]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-111));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(100));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(10));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));    
            });

            // Important note: Dependent on previous state.
            it("#2 - single specific transfer test", async () => {
                // Test case: Batch transfer by admin, but where one transfer is a different owner, where admin is not operator.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR

                // Execute test:
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(66) }]},
                        {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(44) }]}
                    ]), (err, Error) => {
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
            
                        return true;
                    });  
                    
                // Execute test: Same as before, but different order in batch.
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(44) }]},
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(66) }]}
                    ]), (err, Error) => { 
                        expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                        return true;
                    });    
            });

            // Important note: Dependent on previous state.
            it("#3 - single specific transfer test", async () => {
                // Test case: Batch transfer by admin to alice, where total amount is higher than available.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE

                // Execute test:
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) }]},
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });   
                
                // Execute test: Same as before, but different order in batch.
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) }]},
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });

            });

            // Important note: Dependent on previous state.
            it("#4 - single specific transfer test", async () => {
                // Test case: Batch transfer by admin to alice, where total amount is higher than available.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE

                // Execute test:
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        {to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) },
                        {to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) },
                ]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });   
                
                // Execute test: Same as before, but different order in batch.
                await rejects(fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        {to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) },
                        {to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) },
                ]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                }); 
            });
            
            // reverse
            it("reverse to initial state", async () => {
                await fa2testlib.initState();
            });

            it("#1 - single specific operator test ", async () => {
                // Test case: Grant Alice operator permission for admin and do a transfer. Remove Alice operator permission for admin and do a transfer again for admin.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await fa2contract.transferSingle(admin.pkh, charlie.pkh, new BigNumber(baseToken), new BigNumber(1));
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));

                await utils.setProvider(admin.sk);
                await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(false);

                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transferSingle(admin.pkh, charlie.pkh, new BigNumber(baseToken), new BigNumber(1)), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            // Important note: Dependent on previous state.
            it("#2 - single specific operator test", async () => {
                // Test case: Grant Alice operator permission for admin and do some transfers. Remove Alice operator permission for admin and do a transfer again for admin.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await fa2contract.transfer([
                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(3) }]},
                    {from_: alice.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(2) }]}])
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1-3));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(3));

                await utils.setProvider(admin.sk);
                await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(baseToken), new BigNumber(1)), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            // Important note: Dependent on previous state.
            it("#3 - single specific operator test", async () => {
                // Test case: Grant Alice operator permission for admin and do some transfers. Remove Alice operator permission for admin and do a transfer again for admin.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(100) },
                        { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }, 
                        { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }]}])
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-4-100-10-1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(101));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(10));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(4));

                await utils.setProvider(admin.sk);
                await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(100) },
                        { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }, 
                        { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            // Important note: Dependent on previous state.
            it("#4 - single specific operator test", async () => {
                // Test case: Grant Alice operator permission for admin and do some transfers. However, too less funds available for all transfers.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                // Execute test:
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer(
                    [{from_: admin.pkh, txs: [
                        { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-115-5) },
                        { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(3) }, 
                        { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });

                // Execute test: Same as before, but using different structure.
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([
                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-115-5) }]},
                    {from_: admin.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(3) }]},
                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });
            });
    };  
});

describe("FA2 balance_of test cases", () => {

    before("setup", async () => {
        utils = new Utils();
        await utils.init(admin.sk);
        fa2contract = await FA2.init(env.fa2contract, utils.tezos, fa2type, fa2balanceOfCallbackContract);
        fa2contract.updateStorage();
        fa2testlib = new FA2testlib(fa2contract, utils);
        await fa2testlib.initState();
        
    });

    it("#1 - generic - balance_of for a single address", async () => {
        const response = await fa2contract.balanceOf_runview_single(admin.pkh, baseToken);
        expect(response).to.have.property("length", 1);
        expect(response[0].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount));
        expect(response[0].request.owner).equal(admin.pkh);
        expect(response[0].request.token_id).to.be.bignumber.equal(baseToken);
    });

    it("#2 - generic - get balance_of for a batch of addresses", async () => { 
        // test setup:
        await utils.setProvider(admin.sk);
        await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(baseToken), new BigNumber(1));
        
        const response = await fa2contract.balanceOf_runview([
         {owner: admin.pkh, token_id: baseToken}, 
         {owner: alice.pkh, token_id: baseToken},
         {owner: bob.pkh, token_id: baseToken},
        ]);
        expect(response).to.have.property("length", 3);
        expect(response[0].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-1));
        expect(response[0].request.owner).equal(admin.pkh);
        expect(response[0].request.token_id).to.be.bignumber.equal(baseToken);

        expect(response[1].balance).to.be.bignumber.equal(new BigNumber(0));
        expect(response[1].request.owner).equal(alice.pkh);
        expect(response[1].request.token_id).to.be.bignumber.equal(baseToken);

        expect(response[2].balance).to.be.bignumber.equal(new BigNumber(1));
        expect(response[2].request.owner).equal(bob.pkh);
        expect(response[2].request.token_id).to.be.bignumber.equal(baseToken);

        // test teardown:
        await utils.setProvider(bob.sk);
        await fa2contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(baseToken), new BigNumber(1));
    });

    switch (fa2type) {
        case "NFT":
            it("#1 - NFT - get balance_of for different tokens and addresses", async () => {

                // test setup:
                await utils.setProvider(admin.sk);
                await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), new BigNumber(1));
                
                // Execute test:
                const response = await fa2contract.balanceOf_runview([
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]}, 
                    {owner: alice.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[1]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: bob.pkh, token_id: env.fa2initstate.admin.tokenId[1]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[1]},
                   ]);
                expect(response).to.have.property("length", 6);

                expect(response[0].balance).to.be.bignumber.equal(new BigNumber(1));
                expect(response[0].request.owner).equal(admin.pkh);
                expect(response[0].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));
        
                expect(response[1].balance).to.be.bignumber.equal(new BigNumber(0));
                expect(response[1].request.owner).equal(alice.pkh);
                expect(response[1].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));
        
                expect(response[2].balance).to.be.bignumber.equal(new BigNumber(0));
                expect(response[2].request.owner).equal(admin.pkh);
                expect(response[2].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[1]));

                expect(response[3].balance).to.be.bignumber.equal(new BigNumber(1));
                expect(response[3].request.owner).equal(admin.pkh);
                expect(response[3].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));

                expect(response[4].balance).to.be.bignumber.equal(new BigNumber(1));
                expect(response[4].request.owner).equal(bob.pkh);
                expect(response[4].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[1]));

                expect(response[5].balance).to.be.bignumber.equal(new BigNumber(0));
                expect(response[5].request.owner).equal(admin.pkh);
                expect(response[5].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[1]));
                   
                // test teardown:
                await utils.setProvider(bob.sk);
                await fa2contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), new BigNumber(1));
            });

            break;
        case "multi":
            it("#1 - multi - get balance_of for different tokens and addresses", async () => {
                // test setup:
                await utils.setProvider(admin.sk);
                await fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(20));
                await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), new BigNumber(10));
                
                // Execute test:
                const response = await fa2contract.balanceOf_runview([
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]}, 
                    {owner: alice.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[1]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: bob.pkh, token_id: env.fa2initstate.admin.tokenId[1]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[1]},
                    ]);
                expect(response).to.have.property("length", 6);
            
                expect(response[0].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-20));
                expect(response[0].request.owner).equal(admin.pkh);
                expect(response[0].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));
        
                expect(response[1].balance).to.be.bignumber.equal(new BigNumber(20));
                expect(response[1].request.owner).equal(alice.pkh);
                expect(response[1].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));
        
                expect(response[2].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-10));
                expect(response[2].request.owner).equal(admin.pkh);
                expect(response[2].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[1]));

                expect(response[3].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-20));
                expect(response[3].request.owner).equal(admin.pkh);
                expect(response[3].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));

                expect(response[4].balance).to.be.bignumber.equal(new BigNumber(10));
                expect(response[4].request.owner).equal(bob.pkh);
                expect(response[4].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[1]));

                expect(response[5].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-10));
                expect(response[5].request.owner).equal(admin.pkh);
                expect(response[5].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[1]));

                // test teardown:
                await utils.setProvider(alice.sk);
                await fa2contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(20));
                await utils.setProvider(bob.sk);
                await fa2contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]), new BigNumber(10));
                        
            });

            // No break, since we also want to execute all single test cases for the "multi" case.
            //break; 

        case "single":
            it("#1 - single - get balance_of for different tokens and addresses", async () => {
                // test setup:
                await utils.setProvider(admin.sk);
                await fa2contract.transferSingle(admin.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(20));
                await fa2contract.transferSingle(admin.pkh, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(10));

                // Execute test:
                const response = await fa2contract.balanceOf_runview([
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]}, 
                    {owner: alice.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: bob.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    {owner: admin.pkh, token_id: env.fa2initstate.admin.tokenId[0]},
                    ]);
                expect(response).to.have.property("length", 6);
        
                expect(response[0].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-30));
                expect(response[0].request.owner).equal(admin.pkh);
                expect(response[0].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));
        
                expect(response[1].balance).to.be.bignumber.equal(new BigNumber(20));
                expect(response[1].request.owner).equal(alice.pkh);
                expect(response[1].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));
        
                expect(response[2].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-30));
                expect(response[2].request.owner).equal(admin.pkh);
                expect(response[2].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));

                expect(response[3].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-30));
                expect(response[3].request.owner).equal(admin.pkh);
                expect(response[3].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));

                expect(response[4].balance).to.be.bignumber.equal(new BigNumber(10));
                expect(response[4].request.owner).equal(bob.pkh);
                expect(response[4].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));

                expect(response[5].balance).to.be.bignumber.equal(new BigNumber(baseTokenAmount-30));
                expect(response[5].request.owner).equal(admin.pkh);
                expect(response[5].request.token_id).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.tokenId[0]));

                // test setup:
                await utils.setProvider(alice.sk);
                await fa2contract.transferSingle(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(20));
                await utils.setProvider(bob.sk);
                await fa2contract.transferSingle(bob.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]), new BigNumber(10));

            });     

            break;
    }
});