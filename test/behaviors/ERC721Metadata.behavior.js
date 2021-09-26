const { expect } = require("chai");
const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const shouldBehaveLikeERC721Metadata = (contractFn, contractName, contractSymbol) => {

    let contract, owner, newOwner, approved, operator, other;

    beforeEach(() => {
        [ contract, [ owner, newOwner, approved, operator, other, toWhom ] ] = contractFn();
    });

    shouldSupportInterfaces(() => contract, ['ERC721Metadata']);

    it('should have name', async () => {
        expect(await contract.name()).to.equal(contractName);
    });

    it('should have symbol', async () => {
        expect(await contract.symbol()).to.equal(contractSymbol);
    });
}

module.exports = { shouldBehaveLikeERC721Metadata };
