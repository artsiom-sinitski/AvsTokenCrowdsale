var AvsTokenCrowdsale = artifacts.require("./AvsTokenCrowdsale.sol");

contract('AvsTokenCrowdsale', function(accounts) {
    var tokenCrowdsaleInstance;
    var buyer = accounts[1];
    var numberOfTokens;
    var tokenPrice = 1000000000000000; // 0.001 ETH in Wei

    it('initializes the contract with the correct values', function() {
        return AvsTokenCrowdsale.deployed().then(function(instance) {
            tokenCrowdsaleInstance = instance;
            return tokenCrowdsaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenCrowdsaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has a token contract address');
            return tokenCrowdsaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price.toNumber(), tokenPrice, 'token price is correct');
        })
    });

    it('facilitates token buying', function() {
        return AvsTokenCrowdsale.deployed().then(function(instance) {
            tokenCrowdsaleInstance = instance;
            numberOfTokens = 10;
            return tokenCrowdsaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers exactly one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args.buyer, buyer, 'logs the buyer account');
            assert.equal(receipt.logs[0].args.numberOfTokens, numberOfTokens, 'logs the bought amount');
            return tokenCrowdsaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            //Try to buy tokens different from the the ether function
            return tokenCrowdsaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
        })
    });
    
});