const { expect } = require("chai");

const shouldBehaveLikeERC721Burn = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other, toWhom;
    let firstTokenId, secondTokenId, unknownTokenId;

    beforeEach(() => {
        [ contract, accounts, firstTokenId, secondTokenId, unknownTokenId  ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    context('with minted tokens', () => {

        describe('burn', () => {

            let txn;

            beforeEach(async () => {
                txn = await contract.burn(firstTokenId);
            });

            it('burns the given token ID and adjusts the balance of the owner', async () => {
                await expect(contract.ownerOf(firstTokenId)).to.be.reverted;
                expect(await contract.balanceOf(owner.address)).to.equal(1);
            });
            
            it('emits a burn event', async () => {
                expect(txn)
                    .to.emit(contract, 'Transfer')
                    .withArgs(owner.address, ethers.constants.AddressZero, firstTokenId)
                ;
            });

            it('reverts if burning burnt token id', async () => {
                await expect(contract.burn(firstTokenId)).to.be.revertedWith('ERC721: operator query for nonexistent token');
            });
        });

        describe('when there is a previous approval burned', () => {

            beforeEach(async () => {
                await contract.approve(approved.address, firstTokenId);
                await contract.burn(firstTokenId);
            });

            context('getApproved', () => {
                it('reverts', async () => {
                    await expect(contract.getApproved(firstTokenId)).to.be.revertedWith('ERC721: approved query for nonexistent token');
                });
            });
        });

        describe('when the given token ID was not tracked by this contract', () => {
            it('reverts', async () => {
                await expect(contract.burn(unknownTokenId)).to.be.revertedWith('ERC721: operator query for nonexistent token');
            });
        });
    });
}

module.exports = { shouldBehaveLikeERC721Burn };
