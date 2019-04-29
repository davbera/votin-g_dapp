var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Election,"0xabcBbBE3c21885bBd1b104672f0e2B8114c2CA41");
};