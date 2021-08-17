// Load dependencies
const { expect } = require("chai");
const { keccak256 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

/**
 */
describe('GremlinsAirdrop', function () {

    const CONTRACT_NAME = 'MockGremlinsAirdrop';
    const CONTRACT_SYMBOL = 'MOCKAIRDROP';
    const TOKEN_MAX_SUPPLY = 75;
    const ROLE_ADMIN = ethers.utils.id('ADMIN_ROLE');

    before(async function () {
        [this.owner, this.addr1, this.gnosis, this.owner1, this.owner2] = await ethers.getSigners();

        this.factory = await ethers.getContractFactory("MockGremlinsAirdrop");
    });

    beforeEach(async function () {
        this.contract = await this.factory.deploy(TOKEN_MAX_SUPPLY);
        await this.contract.deployed();
    });

    describe('initialization', function () {

        it('correctly sets the name', async function () {
            expect(await this.contract.name()).to.equal(CONTRACT_NAME);
        });

        it('correctly sets the symbol', async function () {
            expect(await this.contract.symbol()).to.equal(CONTRACT_SYMBOL);
        });

        it('correctly sets admin role', async function () {
            expect(await this.contract.hasRole(ROLE_ADMIN, this.owner.address)).to.be.true;
        });

        it('correctly starts with max supply', async function () {
            expect(await this.contract.totalSupply()).to.equal(0);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
        });
    });

    // describe('minting', function () {

    //     it('correctly reserves tokens', async function () {
    //         await this.contract.reserveCollectibles();
    //         expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - TOKEN_MAX_RESERVED);
    //     });

    //     it('correctly mints after reserved', async function () {
    //         await this.contract.reserveCollectibles();
    //         await this.contract.startSale();
    //         await this.contract.mintCollectibles(1);
            
    //         expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - TOKEN_MAX_RESERVED - 1);
    //     });
    // });

    // describe('enumerable', function () {

    //     it('correctly tracks totalSupply', async function () {
    //         await this.contract.reserveCollectibles();
    //         await this.contract.startSale();
    //         expect(await this.contract.totalSupply()).to.equal(10);
    //         expect(await this.contract.availableSupply()).to.equal(246);

    //         for (var i = 0; i < 246; i++) {
    //             await this.contract.mintCollectibles(1);
    //             expect(await this.contract.totalSupply()).to.equal(i + 11);
    //             expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 11 - i);
    //         }

    //         expect(this.contract.mintCollectibles(1)).to.be.reverted;
    //         expect(await this.contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
    //         expect(await this.contract.availableSupply()).to.equal(0);
    //     });

    //     it('correctly tracks token indexes', async function () {
    //         await this.contract.reserveCollectibles();
    //         await this.contract.startSale();
    //         expect(await this.contract.tokenByIndex(9)).to.equal(10);

    //         for (var i = 0; i < 246; i++) {
    //             await this.contract.mintCollectibles(1);
    //             expect(await this.contract.tokenByIndex(i + 10)).to.equal(i + 11);
    //         }

    //         expect(this.contract.mintCollectibles(1)).to.be.reverted;
    //         expect(await this.contract.tokenByIndex(TOKEN_MAX_SUPPLY - 1)).to.equal(TOKEN_MAX_SUPPLY);
    //     });

    //     it('correctly tracks owner token indexes', async function () {
    //         await this.contract.reserveCollectibles();
    //         await this.contract.startSale();
    //         expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 9)).to.equal(10);

    //         for (var i = 0; i < 246; i++) {
    //             await this.contract.mintCollectibles(1);
    //             expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, i + 10)).to.equal(i + 11);
    //         }

    //         expect(this.contract.mintCollectibles(1)).to.be.reverted;
    //         expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, TOKEN_MAX_SUPPLY - 1)).to.equal(TOKEN_MAX_SUPPLY);
    //     });

    //     it('correctly tracks mixed owner token indexes', async function () {
    //         await this.contract.reserveCollectibles();
    //         await this.contract.startSale();
    //         expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 9)).to.equal(10);

    //         for (var i = 0; i < 10; i++) {
    //             await this.contract.connect(this.owner1).mintCollectibles(1);
    //             expect(await this.contract.tokenOfOwnerByIndex(this.owner1.address, i)).to.equal(i + 1 + 10);
    //         }
            
    //         for (var i = 0; i < 10; i++) {
    //             await this.contract.connect(this.owner2).mintCollectibles(1);
    //             expect(await this.contract.tokenOfOwnerByIndex(this.owner2.address, i)).to.equal(i + 1 + 10 + 10);
    //         }

    //         expect(await this.contract.tokenByIndex(29)).to.equal(30);
    //     });
    // });
});
