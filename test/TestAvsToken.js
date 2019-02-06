var AvsToken = artifacts.require("./AvsToken.sol");

contract('AvsToken', function(accounts) {
    it('initializes the basic token details', function() {
        return AvsToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, "AvsToken", 'has the correct name');
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, "AvS", 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'Avs Token v1.0', 'has the correct standard');
        })
    });

    it('allocates the total supply upon deployment', function() {
        return AvsToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'token total supply should be 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates initial supply to the admin account')
        });
    });

    it('transfers token ownership', function() {
        return AvsToken.deployed().then(function(instance) {
            tokenInstance = instance;
            //use 'call()' function as it doesn't trigger a tx
            return tokenInstance.transfer.call(accounts[1], 99999999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 101);
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            //call to 'transfer()' triggers a tx
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
        })
    });

    it('approves tokens for delegated transfer', function() {
        return AvsToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, 'equals true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers exactly one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are approved by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are approved for');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the approval amount');
            return tokenInstance.allowed(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, "stores the allowance for delegated transfer");
        });
    })

    it('handles delegated transfer', function() {
        return AvsToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAcct = accounts[2];
            toAcct = accounts[3];
            spendingAcct = accounts[4];      
            return tokenInstance.transfer(fromAcct, 100, {from: accounts[0]});
        }).then(function(receipt) {
            return tokenInstance.approve(spendingAcct, 10, {from: fromAcct});
        }).then(function(receipt) {
            // Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAcct, toAcct, 9999, {from: spendingAcct});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            return tokenInstance.transferFrom(fromAcct, toAcct, 20, {from: spendingAcct});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            return tokenInstance.transferFrom.call(fromAcct, toAcct, 10, {from: spendingAcct});
        }).then(function(success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAcct, toAcct, 10, {from: spendingAcct});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAcct, 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, toAcct, 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return tokenInstance.balanceOf(fromAcct)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, "deducts the amount from the sending account");
            return tokenInstance.balanceOf(toAcct);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, "adds the amount to the receiving account");
            return tokenInstance.allowance(fromAcct, toAcct);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, 'allowance should be zero');
        })
    })
})
