const { expect } = require("chai");
const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const shouldBehaveLikeERC721 = (contractFn, accountsFn) => {

    const ZERO_ADDRESS = ethers.constants.AddressZero;

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

        describe('approve', () => {
    
            context('when clearing approval', () => {
                it('clears when there was no prior approval', async () => {
                    let txn = await contract.approve(ZERO_ADDRESS, firstTokenId);
    
                    expect(await contract.getApproved(firstTokenId)).to.be.equal(ZERO_ADDRESS);
                    expect(txn).to.emit(contract, 'Approval').withArgs(owner.address, ZERO_ADDRESS, firstTokenId);
                });
    
                it('clears when there was a prior approval', async () => {
                    await contract.approve(approved.address, firstTokenId);
                    let txn = await contract.approve(ZERO_ADDRESS, firstTokenId);
    
                    expect(await contract.getApproved(firstTokenId)).to.be.equal(ZERO_ADDRESS);
                    expect(txn).to.emit(contract, 'Approval').withArgs(owner.address, ZERO_ADDRESS, firstTokenId);
                });
            });
    
            context('when approving a non-zero address', () => {
                it('approves when there was no prior approval', async () => {
                    let txn = await contract.approve(approved.address, firstTokenId);
    
                    expect(await contract.getApproved(firstTokenId)).to.be.equal(approved.address);
                    expect(txn).to.emit(contract, 'Approval').withArgs(owner.address, approved.address, firstTokenId);
                });
    
                it('approves when there was a prior approval to the same address', async () => {
                    await contract.approve(approved.address, firstTokenId);
                    let txn = await contract.approve(approved.address, firstTokenId);
    
                    expect(await contract.getApproved(firstTokenId)).to.be.equal(approved.address);
                    expect(txn).to.emit(contract, 'Approval').withArgs(owner.address, approved.address, firstTokenId);
                });
    
                it('approves when there was a prior approval to a different address', async () => {
                    await contract.approve(approved.address, firstTokenId);
                    txn = await contract.approve(other.address, firstTokenId);
    
                    expect(await contract.getApproved(firstTokenId)).to.be.equal(other.address);
                    expect(txn).to.emit(contract, 'Approval').withArgs(owner.address, other.address, firstTokenId);
                });
            });
    
            it('reverts when the address that receives the approval is the owner', async () => {
                await expect(contract.approve(owner.address, firstTokenId)).to.be.revertedWith('ERC721: approval to current owner');
            });
    
            it('reverts when the sender does not own the given token ID', async () => {
                await expect(contract.connect(approved).approve(approved.address, firstTokenId))
                    .to.be.revertedWith('ERC721: approve caller is not owner nor approved')
                ;
            });
        
            it('reverts when the sender is approved for the given token ID', async () => {
                await contract.approve(approved.address, firstTokenId);
                await expect(contract.connect(approved).approve(other.address, firstTokenId))
                    .to.be.revertedWith('ERC721: approve caller is not owner nor approved for all')
                ;
            });
        
            it('approves when the sender is an operator', async () => {
                await contract.setApprovalForAll(operator.address, true);
                let txn = await contract.connect(operator).approve(approved.address, firstTokenId);
    
                expect(await contract.getApproved(firstTokenId)).to.be.equal(approved.address);
                expect(txn).to.emit(contract, 'Approval').withArgs(owner.address, approved.address, firstTokenId);
            });
            
            it('reverts when the given token ID does not exist', async () => {
                await expect(contract.approve(approved.address, nonExistentTokenId))
                    .to.be.revertedWith('ERC721: owner query for nonexistent token')
                ;
            });
        });
    });

}

module.exports = { shouldBehaveLikeERC721 };
