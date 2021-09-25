const { expect } = require("chai");
const { shouldSupportInterfaces } = require('../behaviors/SupportsInterface.behavior');

const shouldBehaveLikeERC721Enumerable = (contractFn, accountsFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other;
    let firstTokenId, secondTokenId, nonExistentTokenId;

    beforeEach(() => {
        [ contract, accounts, firstTokenId, secondTokenId, nonExistentTokenId ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    shouldSupportInterfaces(() => contract, ['ERC721Enumerable']);

    context('with minted tokens', () => {

        describe('totalSupply', () => {
            it('returns total token supply', async () => {
                expect(await contract.totalSupply()).to.equal(2);
            });
        });

        describe('tokenOfOwnerByIndex', () => {
            context('when the given index is lower than the amount of tokens owned by the given address', () => {
                it('returns the token ID placed at the given index', async () => {
                    expect(await contract.tokenOfOwnerByIndex(owner.address, 0)).to.equal(firstTokenId);
                });
            });
            
            // context('when the given index is exact number of tokens owned by the given address', () => {
            //     it('returns the token ID placed at the given index', async () => {
            //         expect(await contract.tokenOfOwnerByIndex(owner.address, 0)).to.equal(firstTokenId);
            //         expect(await contract.tokenOfOwnerByIndex(owner.address, 1)).to.equal(secondTokenId);
            //         await contract.transferFrom(owner.address, newOwner.address, secondTokenId);
            //         expect(await contract.tokenOfOwnerByIndex(owner.address, 0)).to.equal(firstTokenId);
            //     });
            // });
        
            // context('when the index is greater than or equal to the total tokens owned by the given address', () => {
            //     it('reverts', async () => {
            //         await expect(contract.tokenOfOwnerByIndex(owner.address, 2))
            //             .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
            //         ;
            //     });
            // });
        
            // describe('when the given address does not own any token', () => {
            //     it('reverts', async () => {
            //         await expect(contract.tokenOfOwnerByIndex(other.address, 0))
            //             .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
            //         ;
            //     });
            // });
        
            // describe('after transferring all tokens to another user', () => {
    
            //     beforeEach(async () => {
            //         await contract.transferFrom(owner.address, newOwner.address, firstTokenId);
            //         await contract.transferFrom(owner.address, newOwner.address, secondTokenId);
            //     });
        
            //     it('returns correct token IDs for target', async () => {
            //         expect(await contract.balanceOf(newOwner.address)).to.equal(2);
            //         const tokensListed = await Promise.all(
            //             [0, 1].map(i => contract.tokenOfOwnerByIndex(newOwner.address, i)),
            //         );
            //         expect(tokensListed.map(t => t.toNumber()))
            //             .to.have.members([firstTokenId, secondTokenId])
            //         ;
            //     });
        
            //     it('returns empty collection for original owner', async () => {
            //         expect(await contract.balanceOf(owner.address)).to.equal(0);
            //         await expect(contract.tokenOfOwnerByIndex(owner.address, 0))
            //             .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
            //         ;
            //     });
            // });
        });

        // describe('tokenByIndex', () => {
        //     it('returns all tokens', async () => {
        //         const tokensListed = await Promise.all(
        //             [0, 1].map(i => contract.tokenByIndex(i)),
        //         );
        //         expect(tokensListed.map(t => t.toNumber())).to.have.members([firstTokenId, secondTokenId]);
        //     });
        
        //     it('reverts if index is greater than supply', async () => {
        //         await expect(contract.tokenByIndex(2))
        //             .to.be.revertedWith('ERC721Enumerable: global index out of bounds')
        //         ;
        //     });
        // });
    });
};

module.exports = { shouldBehaveLikeERC721Enumerable };
