const { expect } = require("chai");
const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const shouldBehaveLikeERC721 = (contractFn, accountsFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other, toWhom;
    let firstTokenId, secondTokenId, nonExistentTokenId;

    beforeEach(() => {
        [ contract, accounts, firstTokenId, secondTokenId, nonExistentTokenId ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    shouldSupportInterfaces(() => contract, ['ERC165', 'ERC721']);

    context('with minted tokens', () => {

        describe('balanceOf', () => {
            context('when the given address owns some tokens', () => {
                it('returns the amount of tokens owned by the given address', async () => {
                    expect(await contract.balanceOf(owner.address)).to.equal(2);
                });
            });

            context('when the given address does not own any tokens', () => {
                it('returns 0', async () => {
                    expect(await contract.balanceOf(other.address)).to.equal(0);
                });
            });

            context('when querying the zero address', () => {
                it('throws', async () => {
                    await expect(contract.balanceOf(ethers.constants.AddressZero))
                        .to.be.revertedWith('ERC721: balance query for the zero address')
                    ;
                });
            });
        });

        describe('ownerOf', () => {
            context('when the given token ID was tracked by this token', () => {
                it('returns the owner of the given token ID', async () => {
                    expect(await contract.ownerOf(firstTokenId)).to.be.equal(owner.address);
                });
            });
      
            context('when the given token ID was not tracked by this token', () => {
                it('reverts', async () => {
                    await expect(contract.ownerOf(nonExistentTokenId))
                        .to.be.revertedWith('ERC721: owner query for nonexistent token')
                    ;
                });
            });
        });

        describe('transfers', () => {

            let logs = null;

            beforeEach(async () => {
                // await contract.approve(approved.address, firstTokenId);
                // await contract.setApprovalForAll(operator.address, true);
            });
      
            const transferWasSuccessful = () => {
                it('transfers the ownership of the given token ID to the given address', async () => {
                    expect(await contract.ownerOf(firstTokenId)).to.equal(toWhom.address);
                });
        
                it('emits a Transfer event', async () => {
                    const logs = await ethers.provider.getLogs(contract.filters.Transfer());
                    const events = logs.map((log) => contract.interface.parseLog(log));
                    expect(events.length).to.equal(1);
                    expect(events[0].args['from']).to.equal(owner.address);
                    expect(events[0].args['to']).to.equal(toWhom.address);
                    expect(events[0].args['tokenId']).to.equal(firstTokenId);
                });
        
                it('clears the approval for the token ID', async () => {
                    expect(await contract.getApproved(firstTokenId)).to.be.equal(ethers.constants.AddressZero);
                });
        
                it('emits an Approval event', async () => {
                    const logs = await ethers.provider.getLogs(contract.filters.Approval());
                    const events = logs.map((log) => contract.interface.parseLog(log));
                    expect(events.length).to.equal(1);
                    expect(events[0].args['approved']).to.equal(ethers.constants.AddressZero);
                    expect(events[0].args['tokenId']).to.equal(firstTokenId);
                });
        
                it('adjusts owners balances', async () => {
                    expect(await contract.balanceOf(owner.address)).to.equal(1);
                });
        
                it('adjusts owners tokens by index', async () => {
                    if (!contract.tokenOfOwnerByIndex) return;

                    expect(await contract.tokenOfOwnerByIndex(toWhom.address, 0)).to.equal(firstTokenId);
                    expect(await contract.tokenOfOwnerByIndex(owner.address, 0)).to.not.equal(firstTokenId);
                });
            };

            describe('via transferFrom', () => {
                beforeEach(async () => {
                    await contract.transferFrom(owner.address, toWhom.address, firstTokenId);
                });
                transferWasSuccessful();
            });
        });
    });
}

module.exports = { shouldBehaveLikeERC721 };
