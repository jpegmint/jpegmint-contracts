const { expect } = require("chai");
const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
const ROLE = ethers.utils.id('ROLE');
const OTHER_ROLE = ethers.utils.id('OTHER_ROLE');

const shouldBehaveLikeAccessControl = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other, authorized;

    beforeEach(() => {
        [ contract, accounts ] = contractFn();
        [ owner, newOwner, approved, operator, other, authorized ] = accounts;
    });
    
    shouldSupportInterfaces(() => contract, ['AccessControl']);

    describe('default admin', () => {
        it('deployer has default admin role', async () => {
            expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
        });

        it('other roles\'s admin is the default admin role', async () => {
            expect(await contract.getRoleAdmin(ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
        });
    
        it('default admin role\'s admin is itself', async () => {
            expect(await contract.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
        });
    });

    describe('granting', () => {

        beforeEach(async () => {
            await contract.grantRole(ROLE, authorized.address);
        });

        it('non-admin cannot grant role to other accounts', async () => {
            await expect(contract.connect(other).grantRole(ROLE, authorized.address))
                .to.be.revertedWith(`AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`)
            ;
        });

        it('accounts can be granted a role multiple times', async () => {
            expect(await contract.grantRole(ROLE, authorized.address)).to.not.emit(contract, 'RoleGranted');
        });
    });

    describe('revoking', () => {

        it('roles that are not had can be revoked', async () => {
            expect(await contract.hasRole(ROLE, authorized.address)).to.equal(false);
            expect(await contract.revokeRole(ROLE, authorized.address)).to.not.emit(contract, 'RoleRevoked');
        });

        context('with granted role', () => {

            beforeEach(async () => {
                await contract.grantRole(ROLE, authorized.address);
            });

            it('admin can revoke role', async () => {
                expect(await contract.revokeRole(ROLE, authorized.address))
                    .to.emit(contract, 'RoleRevoked').withArgs(ROLE, authorized.address, owner.address);

                expect(await contract.hasRole(ROLE, authorized.address)).to.equal(false);
            });

            it('non-admin cannot revoke role', async () => {
                await expect(contract.connect(other).revokeRole(ROLE, authorized.address))
                    .to.be.revertedWith(`AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`)
                ;
            });

            it('a role can be revoked multiple times', async () => {
                await contract.revokeRole(ROLE, authorized.address);
                expect(await contract.revokeRole(ROLE, authorized.address)).to.not.emit(contract, 'RoleRevoked');
            });
        });
    });

    describe('renouncing', () => {
        it('roles that are not had can be renounced', async () => {
            expect(await contract.connect(authorized).renounceRole(ROLE, authorized.address)).to.not.emit(contract, 'RoleRevoked');
        });

        context('with granted role', () => {
            beforeEach(async () => {
                await contract.grantRole(ROLE, authorized.address);
            });

            it('bearer can renounce role', async () => {
                expect(await contract.connect(authorized).renounceRole(ROLE, authorized.address))
                    .to.emit(contract, 'RoleRevoked').withArgs(ROLE, authorized.address, authorized.address)
                ;

                expect(await contract.hasRole(ROLE, authorized.address)).to.equal(false);
            });

            it('only the sender can renounce their roles', async () => {
                await expect(contract.renounceRole(ROLE, authorized.address))
                    .to.be.revertedWith(`AccessControl: can only renounce roles for self`)
                ;
            });

            it('a role can be renounced multiple times', async () => {
                expect(await contract.connect(authorized).renounceRole(ROLE, authorized.address));
                expect(await contract.connect(authorized).renounceRole(ROLE, authorized.address)).to.not.emit(contract, 'RoleRevoked');
            });
        });
    });
}

module.exports = {
    shouldBehaveLikeAccessControl
};
