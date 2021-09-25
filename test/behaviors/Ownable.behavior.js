const { expect } = require("chai");

const shouldBehaveLikeOwnable = (contractFn) => {

    let contract, owner, newOwner, approved, operator, other;

    beforeEach(() => {
        [ contract, [ owner, newOwner, approved, operator, other, toWhom ] ] = contractFn();
    });

    describe('ownable', () => {

        context('with fresh contract', () => {
            it('has an owner', async () => {
                expect(await contract.owner()).to.equal(owner.address);
            });
        });

        describe('transfer ownership', () => {

            it('emits OwnershipTransferred event', async () => {
                expect(await contract.transferOwnership(newOwner.address))
                    .to.emit(contract, 'OwnershipTransferred')
                    .withArgs(owner.address, newOwner.address);
            });

            it('changes owner after transfer', async () => {
                await contract.transferOwnership(newOwner.address);
                expect(await contract.owner()).to.equal(newOwner.address);
            });

            it('prevents non-owners from transferring', async () => {
                await expect(contract.connect(other).transferOwnership(newOwner.address))
                    .to.be.revertedWith('Ownable: caller is not the owner');
            });

            it('guards ownership against stuck state', async () => {
                await expect(contract.transferOwnership(ethers.constants.AddressZero))
                    .to.be.revertedWith('Ownable: new owner is the zero address');
            });
        });

        describe('renounce ownership', () => {
            it('emits OwnershipTransferred event', async () => {
                expect(await contract.renounceOwnership())
                    .to.emit(contract, 'OwnershipTransferred')
                    .withArgs(owner.address, ethers.constants.AddressZero);
            });

            it('loses owner after renouncement', async () => {
                await contract.renounceOwnership();
                expect(await contract.owner()).to.equal(ethers.constants.AddressZero);
            });

            it('prevents non-owners from renouncement', async () => {
                await expect(contract.connect(other).renounceOwnership())
                    .to.be.revertedWith('Ownable: caller is not the owner');
            });
        });
    });
}

module.exports = {
    shouldBehaveLikeOwnable
};
