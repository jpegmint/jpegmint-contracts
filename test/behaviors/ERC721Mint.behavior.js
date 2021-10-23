const { expect } = require("chai");

const shouldBehaveLikeERC721Mint = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other, toWhom;
    let firstTokenId, firstTx, firstTokenUri;
    let nonExistentTokenId;

    beforeEach(() => {
        [ contract, accounts, firstTokenId, firstTx, firstTokenUri, nonExistentTokenId ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    context('with minted tokens', () => {
        
        it('emits a Transfer event', async () => {
            expect(firstTx)
                .to.emit(contract, 'Transfer')
                .withArgs(ethers.constants.AddressZero, owner.address, firstTokenId)
            ;
        });

        it('creates the token', async () => {
            expect(await contract.balanceOf(owner.address)).to.equal(1);
            expect(await contract.ownerOf(firstTokenId)).to.equal(owner.address);
            expect(await contract.tokenURI(firstTokenId)).to.equal(firstTokenUri);
        });

        it('reverts if minting existing token id', async () => {
            if (contract.hasOwnProperty('mint(uint256,string)')) {
                await expect(contract.mint(firstTokenId, firstTokenUri)).to.be.reverted;
            }
        });
    });
}

module.exports = { shouldBehaveLikeERC721Mint };
