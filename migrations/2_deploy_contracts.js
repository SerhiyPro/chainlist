var Chainlist = artifacts.require("./ChainList.sol");

module.exports = function (deployer) {
    deployer.deploy(Chainlist);
}