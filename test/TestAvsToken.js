var AvsToken = artifacts.require("./AvsToken.sol");

contract('AvsToken', function(accounts) {

    it('sets the total supply upon deployment', function() {
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

})