var AvsToken = artifacts.require("./AvsToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AvsToken, 1000000);
};