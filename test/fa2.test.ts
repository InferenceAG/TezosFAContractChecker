import "@taquito/rpc";
import { Utils } from "./utils/utils";
import accounts from "../scripts/accounts_kathmandu";
import { SBAccount } from "./types/Common";
import { FA2 } from "./utils/fa2";
import  env from "../env";
import { rejects } from "assert";
import { FA2Errors } from "./types/Errors"

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";
import { FA2testlib} from "./utils/fa2testlib";

chai.use(require('chai-bignumber')(BigNumber));

describe("FA2 testing", () => {
    var utils: Utils;
    var admin: SBAccount = accounts.admin;
    var alice: SBAccount = accounts.alice;
    var bob: SBAccount = accounts.bob;
    var charlie: SBAccount = accounts.charlie;
    var fa2contract: FA2;
    var fa2testlib: FA2testlib;
    var baseToken: number = env.fa2initstate.admin.tokenId[0];
    var baseTokenAmount: number = env.fa2initstate.admin.amount[0];
    const fa2type: string = env.fa2type;
    
    before("setup", async () => {
        utils = new Utils();
        await utils.init(admin.sk);
        fa2contract = await FA2.init(env.fa2contract, utils.tezos, fa2type);
        fa2contract.updateStorage();
        fa2testlib = new FA2testlib(fa2contract, utils);
        await fa2testlib.initState();
    });
    
    // Generic transfer test cases:
    it("transfer general test #1", async () => {
        // Test case: Transfer of 1 token from admin to admin by admin
        // Expected result: Successful execution.
        await fa2testlib.transferSelfAmount1();
    });
    
    it("transfer general test #2", async () => {
        // Test case: Transfer of 0 tokens from admin to admin by admin.
        // Expected result: Successful execution.
        await fa2testlib.transferSelfAmount0();
    });

    it("transfer general test #3", async () => {
        // Test case: Transfer of 0 tokens from admin to admin by admin.
        // Expected result: Failing with error message: FA2_TOKEN_UNDEFINED
        await fa2testlib.transferSelfAmount1NonExistantToken();
    });

    it("transfer general test #4", async () => {
        // Test case: Transfer of too many tokens from admin to alice by admin.
        // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
        await fa2testlib.transferSelfMoreThanAvailable();
    });

    it("transfer general test #5", async () => {
        // Test case: Transfer of 0 tokens from admin to alice by admin.
        // Expected result:  Successful execution.
        await fa2testlib.transferAdminToAliceAmount0();
    });

    it("transfer general test #6", async () => {
        // Test case: Transfer of 1 token from admin to alice by admin.
        // Expected result:  Successful execution.
        await fa2testlib.transferAdminToAliceAmount1();
    });

    it("transfer general test #7", async () => {
        // Test case: Transfer of too many token from admin to alice by admin.
        // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
        await fa2testlib.transferAdminToAliceAmountTooHigh();
    });
       
    // Generic operator test cases:
    it("operator general test #1", async () => {
        await fa2testlib.operatorAdminRemovesAlice();
    });
    
    it("operator general test #2", async () => {
        await fa2testlib.operatorAdminAddsAlice();
        await fa2testlib.operatorAdminRemovesAlice();
    });
    
    it("operator general test #3", async () => {
        await fa2testlib.operatorBatchAdmin();
    });

    it("operator general test #4", async () => {
        await fa2testlib.operatorBatchAdmin2();
    });

    it("operator general test #5", async () => {
        await fa2testlib.operatorAdminAddsAdminForAlice();
    });

    it("operator general test #6", async () => {
        await fa2testlib.operatorAdminRemovesAdminForAlice();
    });

    it("operator general test #7", async () => {
        await fa2testlib.operatorAliceAddsAdmin()
        await fa2testlib.operatorAdminRemovesAdminForAlice();
    });

    it("operator general test #8", async () => {
        await fa2testlib.operatorBatch();
    });

    // reverse
    it("reverse to initial state", async () => {
        await fa2testlib.initState();
    });

    switch (fa2type) {
        case "NFT":
            it("NFT specific transfer test #1", async () => {
                // Test case: Batch transfer by admin to different recipients and differnt token amounts.
                // Expected result: Successful execution.
                await utils.setProvider(admin.sk);
                await fa2contract.transfer([{from_: admin.pkh, txs: [
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

            it("NFT specific transfer test #2", async () => {
                // Test case: Batch transfer by alice, but where a NFT has already transferred in the batch.
                // Checks whether balance has been (internally) updated from first transfer. Thus, correct balance is (internally) available for second transfer.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([{from_: alice.pkh, txs: [
                    { to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) },
                    { to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }
                ]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });
            });

            it("NFT specific transfer test #3", async () => {
                // Test case: Variant to previous test case #2
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([{from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                                                    {from_: alice.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}
                ]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });
            });

            it("NFT specific transfer test #4", async () => {
                // Test case: Batch transfer by alice, but where one transfer is from different owner, where alice is not operator.
                // Checks whether "from" is (internally) updated. 
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([{from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                                                    {from_: bob.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]}
                ]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            it("NFT specific transfer test #5", async () => {
                // Test case: Different order of transfer than in previous test case #4
                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([{from_: bob.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]},
                                                    {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}
                ]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            it("NFT specific operator transfer test #1", async () => {
                // Test case: Batch transfer by alice, but where one transfer is for a different owner where Alice is operator.
                // Expected result: Successful execution.
                await utils.setProvider(bob.sk);
                await fa2contract.addOperator(bob.pkh, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]));

                await utils.setProvider(alice.sk);
                await fa2contract.transfer([{from_: bob.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]},
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

            it("NFT specific operator transfer test #2", async () => {
                // Test case: Batch transfer by admin, but where transfers are for a different owner. But admin only has operator permission for one token.
                // Checks whether "tokenId" is (internally) updated. 
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(charlie.sk);
                await fa2contract.addOperator(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));

                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: charlie.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]},
                                                    {from_: charlie.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]}
                ]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            it("NFT specific operator transfer test #3", async () => {
                // Test case: Variant to previous test case #2.

                // Already granted in previous test case.
                //await utils.setProvider(charlie.sk);
                //await fa2contract.addOperator(charlie.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));

                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: charlie.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }, 
                                                                               { to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(1) }]},
                ]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            it("NFT specific operator transfer test #4", async () => {
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
            it("multi specific transfer test #1", async () => {
                // Test case: Batch transfer by admin to different recipients and differnt token amounts.
                // Checks whether tokenId is (internally) updated.
                // Checks whether balance is (internally) updated.
                // Expected result: Successful execution.
                await utils.setProvider(admin.sk);
                await fa2contract.transfer([{from_: admin.pkh, txs: [
                    { to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100) },
                    { to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) },
                    { to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }
                ]}]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[0]-101));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[1]-10));
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(100));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(10));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(1));     
            });

            it("multi specific transfer test #2", async () => {
                // Test case: Variant to previous case #1.
                await utils.setProvider(admin.sk);
                await fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                                            {from_: admin.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) }]},
                                            {from_: admin.pkh, txs: [{ to_: charlie.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(1) }]}]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[0]-101-101));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(env.fa2initstate.admin.amount[1]-10-10));
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(200));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(env.fa2initstate.admin.tokenId[1]))).to.be.bignumber.equal(new BigNumber(20));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]))).to.be.bignumber.equal(new BigNumber(2));     
            });

            it("multi specific transfer test #3", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner alice, where admin is not operator.
                // Cheecks whether "from" is (internally) updated.
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                        {from_: alice.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
        
                    return true;
                }); 
            });

            it("multi specific transfer test #4", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner alice, where admin is operator, but for a different token. 
                // Checks whether "tokenID" is (internally) updated.
                // Checks whether "ownership" is checked and "operator" is correctly working.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(alice.sk);
                await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                        {from_: alice.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[1]), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
        
                    return true;
                }); 
            });

            it("multi specific transfer test #5", async () => {
                // Test case: Batch transfer by admin, but one transfers with owner alice, where admin is operator and one transfer with owner bob, where admin is not ooperator.
                // Checks whether "operator" permission is not taken over.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                // (Note: Potentially fails, with FA2_INSUFFICENT_BALANCE, since bob has not enough token form tokenID 0.)
                
                // Already granted in previous test case.
                //await utils.setProvider(alice.sk);
                //await fa2contract.addOperator(alice.pkh, admin.pkh, new BigNumber(env.fa2initstate.admin.tokenId[0]));
                
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([
                        {from_: alice.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(100)}]},
                        {from_: bob.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(env.fa2initstate.admin.tokenId[0]), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
        
                    return true;
                }); 
            });
   
            // No break, since we also want to execute all single test cases for the "multi" case, but restore initial state first:
            //break; 
            // reverse
            it("reverse to initial state", async () => {
                await fa2testlib.initState();
            });

        case "single":
            // Test case: Batch transfer by admin to different recipients and differnt token amounts.
            // Expected result: Successful execution.
            it("single specific transfer test #1", async () => {
                await utils.setProvider(admin.sk);
                await fa2contract.transfer([{from_: admin.pkh, txs: [
                    { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(100) },
                    { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) },
                    { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }
                ]}]);
        
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-111));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(100));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(10));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(1));    
            });

            it("single specific transfer test #2", async () => {
                // Test case: Batch transfer by admin, but where one transfer is a different owner, where admin is not operator.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(66) }]},
                                                    {from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(44) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);
        
                    return true;
                });                         
            });

            it("single specific transfer test #3", async () => {
                // Test case: Same as test #3, but reverse order of batch.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: alice.pkh, txs: [{ to_: admin.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(44) }]},
                                                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(66) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });                         
            });

            it("single specific transfer test #4", async () => {
                // Test case: Batch transfer by admin to alice, where total amount is higher than available.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) }]},
                                                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });                         
            });

            it("single specific transfer test #5", async () => {
                // Test case: Same as test #4, but reverse order of batch.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) }]},
                                                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });                         
            });

            it("single specific transfer test #6", async () => {
                // Test case: Batch transfer by admin to alice, where total amount is higher than available.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await utils.setProvider(admin.sk);
                await rejects(fa2contract.transfer([{from_: admin.pkh, txs: [
                    { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) },
                    { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) },
                ]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });                         
            });

            it("single specific transfer test #7", async () => {
                // Test case: Same as test #6, but reverse order of batch.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await rejects(fa2contract.transfer([{from_: admin.pkh, txs: [
                    { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(9) },
                    { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-111-5) },
                ]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });                         
            });
            
            // reverse
            it("reverse to initial state", async () => {
                await fa2testlib.initState();
            });

            it("single specific operator test #1", async () => {
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

            it("single specific operator test #2", async () => {
                // Test case: Grant Alice operator permission for admin and do some transfers. Remove Alice operator permission for admin and do a transfer again for admin.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(3) }]},
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

            it("single specific operator test #3", async () => {
                // Test case: Grant Alice operator permission for admin and do some transfers. Remove Alice operator permission for admin and do a transfer again for admin.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_NOT_OPERATOR
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(100) },
                                                            { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }, 
                                                            { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }]}])
            
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, admin.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(baseTokenAmount-4-100-10-1));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, alice.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(101));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, bob.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(10));
                expect(await fa2contract.fa2specifics.getBalance(fa2contract, charlie.pkh, new BigNumber(baseToken))).to.be.bignumber.equal(new BigNumber(4));

                await utils.setProvider(admin.sk);
                await fa2contract.removeOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));

                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer([{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(100) },
                                                                            { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }, 
                                                                            { to_: charlie.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(1) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_NOT_OPERATOR);

                    return true;
                });
            });

            it("single specific operator test #4", async () => {
                // Test case: Grant Alice operator permission for admin and do some transfers. However, too less funds available for all transfers.
                // Checks whether operator permissions are correctly working and removed.
                // Expected result: Failing with error message: FA2_INSUFFICIENT_BALANCE
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer(
                    [{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-115-5) },
                                            { to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(3) }, 
                                            { to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });
            });
            
            it("single specific operator test #5", async () => {
                // Test case: Variant to previous test case #4
                await utils.setProvider(admin.sk);
                await fa2contract.addOperator(admin.pkh, alice.pkh, new BigNumber(baseToken));
                
                expect(await fa2contract.fa2specifics.checkOperator(fa2contract, admin.pkh, alice.pkh, new BigNumber(baseToken))).equal(true);

                await utils.setProvider(alice.sk);
                await rejects(fa2contract.transfer(
                    [{from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(baseTokenAmount-115-5) }]},
                    {from_: alice.pkh, txs: [{ to_: bob.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(3) }]},
                    {from_: admin.pkh, txs: [{ to_: alice.pkh, token_id: new BigNumber(baseToken), amount: new BigNumber(10) }]}]), (err, Error) => {
                    expect(err.message).to.equal(FA2Errors.FA2_INSUFFICIENT_BALANCE);

                    return true;
                });
            });  
    };    
});