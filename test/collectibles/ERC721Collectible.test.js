// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 */
describe('ERC721Collectible', function () {

    const CONTRACT_NAME = 'MockCollectible';
    const CONTRACT_SYMBOL = 'MOCKCOLLECTIBLE';
    const TOKEN_MAX_SUPPLY = 100;
    const TOKEN_PRICE = 0;
    const TOKEN_MAX_PER_TXN = 10;

    before(async function () {
        [this.owner, this.addr1, this.gnosis, this.owner1, this.owner2] = await ethers.getSigners();

        this.factory = await ethers.getContractFactory("MockCollectible");
    });

    beforeEach(async function () {
        this.contract = await this.factory.deploy(TOKEN_MAX_SUPPLY, TOKEN_PRICE, TOKEN_MAX_PER_TXN);
        await this.contract.deployed();
    });

    describe('initialization', function () {

        it('correctly sets the name', async function () {
            expect(await this.contract.name()).to.equal(CONTRACT_NAME);
        });

        it('correctly sets the symbol', async function () {
            expect(await this.contract.symbol()).to.equal(CONTRACT_SYMBOL);
        });

        it('correctly sets owner', async function () {
            expect(await this.contract.owner()).to.equal(this.owner.address);
        });

        it('correctly starts paused', async function () {
            expect(await this.contract.isPaused()).to.be.true;
        });

        it('correctly starts with max supply', async function () {
            expect(await this.contract.totalSupply()).to.equal(0);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
        });
    });

    describe('minting', function () {

        it('correctly mints', async function () {
            await this.contract.startSale();
            await this.contract.mintCollectibles(1);
            
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 1);
        });
    });

    describe('enumerable', function () {

        it('correctly tracks totalSupply', async function () {
            await this.contract.startSale();
            expect(await this.contract.totalSupply()).to.equal(0);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);

            for (var i = 0; i < TOKEN_MAX_SUPPLY; i++) {
                await this.contract.mintCollectibles(1);
                expect(await this.contract.totalSupply()).to.equal(i + 1);
                expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - i - 1);
            }

            expect(this.contract.mintCollectibles(1)).to.be.reverted;
            expect(await this.contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
            expect(await this.contract.availableSupply()).to.equal(0);
        });
    });
});
