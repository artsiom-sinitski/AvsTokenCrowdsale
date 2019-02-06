var AvsToken = artifacts.require("./AvsToken.sol");
var AvsTokenCrowdsale = artifacts.require("./AvsTokenCrowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(AvsToken, 1000000).then(function() {
    var tokenPrice = 1000000000000000 // token price is 0.001 Ether
    return deployer.deploy(AvsTokenCrowdsale, AvsToken.address, tokenPrice);
  });
  
};