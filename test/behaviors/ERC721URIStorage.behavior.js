const { expect } = require("chai");

const shouldBehaveLikeERC721URIstorage = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other;
    let firstTokenId, tokenId2;

    beforeEach(() => {
        [ contract, accounts, firstTokenId, tokenId2 ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    context('with minted tokens', () => {
        
        const baseURI = 'https://api.example.com/v1/';
        const sampleUri = 'mock://mytoken';
        const nonExistentTokenId = 2898;

        describe('tokenURI', () => {

            it('it is empty by default', async function () {
                expect(await contract.tokenURI(firstTokenId)).to.be.equal('');
            });

            it('reverts when queried for non existent token id', async () => {
                await expect(contract.tokenURI(nonExistentTokenId))
                    .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token')
                ;
            });

            it('can be set for a token id', async () => {
                await contract.setTokenURI(firstTokenId, sampleUri);
                expect(await contract.tokenURI(firstTokenId)).to.equal(sampleUri);
            });

            it('reverts when setting for non existent token id', async () => {
                await expect(contract.setTokenURI(nonExistentTokenId, sampleUri))
                    .to.be.revertedWith('ERC721URIStorage: URI set of nonexistent token')
                ;
            });

            it('base URI can be set', async function () {
                await contract.setBaseURI(baseURI);
                expect(await contract.baseURI()).to.equal(baseURI);
            });
          
            it('base URI is added as a prefix to the token URI', async function () {
                await contract.setBaseURI(baseURI);
                await contract.setTokenURI(firstTokenId, sampleUri);
            
                expect(await contract.tokenURI(firstTokenId)).to.equal(baseURI + sampleUri);
            });
          
            it('token URI can be changed by changing the base URI', async function () {
                await contract.setBaseURI(baseURI);
                await contract.setTokenURI(firstTokenId, sampleUri);
        
                const newBaseURI = 'https://api.example.com/v2/';
                await contract.setBaseURI(newBaseURI);
                expect(await contract.tokenURI(firstTokenId)).to.equal(newBaseURI + sampleUri);
            });
          
            it('tokenId is appended to base URI for tokens with no URI', async function () {
                await contract.setBaseURI(baseURI);
                expect(await contract.tokenURI(firstTokenId)).to.equal(baseURI + firstTokenId);
            });
          
            it('tokens without URI can be burnt ', async function () {
                await contract.burn(firstTokenId);
        
                await expect(contract.ownerOf(firstTokenId))
                    .to.be.revertedWith('ERC721: owner query for nonexistent token');
                await expect(contract.tokenURI(firstTokenId))
                    .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token');
            });
          
            it('tokens with URI can be burnt ', async function () {
                await contract.setTokenURI(firstTokenId, sampleUri);
                await contract.burn(firstTokenId);
        
                await expect(contract.ownerOf(firstTokenId))
                    .to.be.revertedWith('ERC721: owner query for nonexistent token');
                await expect(contract.tokenURI(firstTokenId))
                    .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token');
            });
        });
    });
};

module.exports = { shouldBehaveLikeERC721URIstorage };
