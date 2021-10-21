const { expect } = require("chai");
const { shouldBehaveLikeOwnable } = require('./Ownable.behavior');

const shouldBehaveLikeMultiOwnable = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other, toWhom;

    beforeEach(() => {
        [ contract, accounts ] = contractFn();
        [ owner, newOwner, approved, operator, other, toWhom ] = accounts;
    });

    describe('Ownable', () => {
        shouldBehaveLikeOwnable(() => [ contract, accounts ]);
    });

    describe('MultiOwnable', () => {

        context('with fresh contract', () => {
            it('has only one owner', async () => {
                expect(await contract.isOwner(owner.address)).to.be.true;
                expect((await contract.getOwners()).length).to.equal(1);
            });
        });
        
        describe('isOwner', () => {

            it('returns true for initial owner', async () => {
                expect(await contract.isOwner(owner.address)).to.be.true;
            });

            it('returns true after adding owner', async () => {
                await contract.approveOwner(newOwner.address);
                expect(await contract.isOwner(owner.address)).to.be.true;
                expect(await contract.isOwner(newOwner.address)).to.be.true;
            });

            it('returns false for non-approved owner', async () => {
                expect(await contract.isOwner(other.address)).to.be.false;
            });

            it('returns false after revoking owner', async () => {
                await contract.approveOwner(newOwner.address);
                expect(await contract.isOwner(newOwner.address)).to.be.true;
                await contract.revokeOwner(newOwner.address);
                expect(await contract.isOwner(owner.address)).to.be.true;
                expect(await contract.isOwner(newOwner.address)).to.be.false;
            });

            it('returns false for zero address', async () => {
                expect(await contract.isOwner(ethers.constants.AddressZero)).to.be.false;
            });

            it('allows anyone to query owners', async () => {
                expect(await contract.connect(other).isOwner(owner.address)).to.be.true;
            });
        });

        describe('approveOwner', () => {

            it('captures approved owner', async () => {
                await contract.approveOwner(newOwner.address);
                expect(await contract.owner()).to.equal(owner.address);
                expect(await contract.isOwner(newOwner.address)).to.be.true;
                expect((await contract.getOwners()).length).to.equal(2);
            });

            it('prevents non-owners from approving', async () => {
                await expect(contract.connect(other).approveOwner(newOwner.address))
                    .to.be.revertedWith('Ownable: caller is not the owner');
            });

            it('guards ownership against stuck state', async () => {
                await expect(contract.approveOwner(ethers.constants.AddressZero))
                    .to.be.revertedWith('Ownable: new owner is the zero address');
            });
        });

        describe('revokeOwner', () => {

            beforeEach(async () => {
                await contract.approveOwner(newOwner.address);
            });

            it('loses approval after revoke', async () => {
                expect(await contract.isOwner(newOwner.address)).to.be.true;
                await contract.revokeOwner(newOwner.address);
                expect(await contract.isOwner(newOwner.address)).to.be.false;
                expect((await contract.getOwners()).length).to.equal(1);
            });

            it('prevents non-owners from revoking', async () => {
                await expect(contract.connect(other).revokeOwner(newOwner.address))
                    .to.be.revertedWith('Ownable: caller is not the owner');
            });

            it('revokes last owner', async () => {
                await contract.revokeOwner(newOwner.address);
                await contract.revokeOwner(owner.address);
                expect(await contract.isOwner(owner.address)).to.be.false;
                expect(await contract.isOwner(newOwner.address)).to.be.false;
                expect((await contract.getOwners()).length).to.equal(0);
            });

            it('reverts after revoking last owner', async () => {
                await contract.revokeOwner(newOwner.address);
                await contract.revokeOwner(owner.address);
                await expect(contract.revokeOwner(owner.address))
                    .to.be.revertedWith('Ownable: caller is not the owner');
            });
        });

        describe('renounceOwnership', () => {

            beforeEach(async () => {
                await contract.approveOwner(newOwner.address);
                await contract.approveOwner(approved.address);
            });

            it('revokes multiple owners', async () => {
                await contract.renounceOwnership();
                expect((await contract.getOwners()).length).to.equal(0);
            });
            
            it('sets owner as zero address', async () => {
                await contract.renounceOwnership();
                expect(await contract.owner()).to.equal(ethers.constants.AddressZero);
            });

            it('loses approval for all owners', async () => {
                await contract.renounceOwnership();
                expect(await contract.isOwner(owner.address)).to.be.false;
                expect(await contract.isOwner(newOwner.address)).to.be.false;
                expect(await contract.isOwner(approved.address)).to.be.false;
            });
        });
    });
}

module.exports = {
    shouldBehaveLikeMultiOwnable
};
