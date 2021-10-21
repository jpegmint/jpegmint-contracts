const { expect } = require("chai");
const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const shouldBehaveLikeERC721URIstorage = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other;
    let tokenId1, tokenId2, tokenUri1, tokenUri2;

    beforeEach(() => {
        [ contract, accounts, tokenId1, tokenUri1, tokenId2, tokenUri2 ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    context('with minted tokens', () => {
        describe('tokenURI', () => {
            it('reverts when queried for non existent token id', async () => {
                await expect(contract.tokenURI(2898))
                    .to.be.revertedWith('Non')
                ;
            });

            it('can be set for a token id', async () => {
                await contract.setTokenURI(tokenId1, 'mock://newuri');
                expect(await contract.tokenURI(tokenId1)).to.equal('mock://newuri');
            });

            it('reverts when setting for non existent token id', async () => {
                await expect(contract.setTokenURI(2898, 'mock://newuri'))
                    .to.be.revertedWith('Non')
                ;
            });
        });
    });
};

module.exports = { shouldBehaveLikeERC721URIstorage };
