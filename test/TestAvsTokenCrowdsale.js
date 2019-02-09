var AvsToken = artifacts.require("./AvsToken.sol");
var AvsTokenCrowdsale = artifacts.require("./AvsTokenCrowdsale.sol");

contract('AvsTokenCrowdsale', function(accounts) {
    var tokenInstance;
    var tokenCrowdsaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var numberOfTokens;
    var tokensAvailable = 750000;
    var tokenPrice = 1000000000000000; // 0.001 ETH in Wei

    it('initializes the contract with the correct values', function() {
        //Need to have AvS token instance first
        return AvsToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return AvsTokenCrowdsale.deployed();
        }).then(function(instance) {
            //Then instantiate the token crowdsale instance
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
            //Provision 75% of all tokens to the token sale contract
           return tokenInstance.transfer(tokenCrowdsaleInstance.address, tokensAvailable, {from: admin});
        }).then(function(receipt) {
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
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenCrowdsaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), (tokensAvailable - numberOfTokens));
            //Try to buy tokens different from the ether value
            return tokenCrowdsaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            return tokenCrowdsaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        });
    });

    it('ends token sale', function() {
        return AvsTokenCrowdsale.deployed().then(function(instance) {
            tokenCrowdsaleInstance = instance;
            return AvsToken.deployed();
        }).then(function(instance) {
            tokenInstance = instance;
            //try to end the token sale from acct other than the admin
            return tokenCrowdsaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'must be admin to end the token sale');
            return tokenCrowdsaleInstance.endSale({from: admin});
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold AvS tokens to the admin');
            //return web3.eth.getBalance(tokenCrowdsaleInstance.address);
            return tokenInstance.balanceOf(tokenCrowdsaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance, 0);
        })
    });

});