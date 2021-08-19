// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 */
describe.only('GremlinsAirdrop', function () {

    const CONTRACT_NAME = 'MockGremlinsAirdrop';
    const CONTRACT_SYMBOL = 'MOCKAIRDROP';
    const TOKEN_MAX_SUPPLY = 10;
    const ROLE_ADMIN = ethers.utils.id('ADMIN_ROLE');

    before(async function () {
        [this.owner, this.addr1, this.gnosis, this.owner1, this.owner2] = await ethers.getSigners();

        this.wallets = [];
        for (let i = 0; i < TOKEN_MAX_SUPPLY; i++) {
            this.wallets.push(this.owner.address);
        }

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

        it('correctly sets admin roles', async function () {
            expect(await this.contract.hasRole(ethers.constants.HashZero, this.owner.address)).to.be.true;
            expect(await this.contract.hasRole(ROLE_ADMIN, this.owner.address)).to.be.true;
        });

        it('correctly starts with max supply', async function () {
            expect(await this.contract.totalSupply()).to.equal(0);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
        });
    });

    describe('minting', function () {

        it('correctly mints all', async function() {
            await this.contract.airdrop(this.wallets);
            expect(await this.contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
            expect(await this.contract.availableSupply()).to.equal(0);
            expect(await this.contract.balanceOf(this.owner.address)).to.equal(TOKEN_MAX_SUPPLY);
        });

        it('correctly mints in batches', async function() {
            await this.contract.airdrop(this.wallets.slice(0, 4));
            expect(await this.contract.totalSupply()).to.equal(4);

            await this.contract.airdrop(this.wallets.slice(0, 4));
            expect(await this.contract.totalSupply()).to.equal(8);

            await this.contract.airdrop(this.wallets.slice(0, 2));
            expect(await this.contract.totalSupply()).to.equal(10);

            expect(await this.contract.availableSupply()).to.equal(0);
            expect(await this.contract.balanceOf(this.owner.address)).to.equal(10);
        });

        it('correctly mints one at a time', async function() {
            await this.contract.airdrop(this.wallets.slice(0, 1));
            expect(await this.contract.totalSupply()).to.equal(1);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 1);
        });

        it('correctly mints even if non-ERC721 receiver', async function() {
            factory = await ethers.getContractFactory("ERC721");
            erc721 = await factory.deploy('Mock', 'MOCK');
            await erc721.deployed();

            let wallets = this.wallets.slice(0,9);
            wallets.push(erc721.address);
            await this.contract.airdrop(wallets);
            expect(await this.contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
            expect(await this.contract.availableSupply()).to.equal(0);
        });

        it('correctly mints to multiple wallets', async function() {
            let wallets = [this.owner.address, this.addr1.address, this.owner1.address, this.owner2.address];
            await this.contract.airdrop(wallets);
            expect(await this.contract.totalSupply()).to.equal(4);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 4);
            for (let i = 0; i < wallets.length; i++) {
                expect(await this.contract.balanceOf(wallets[i])).to.equal(1);
            }
        });

        it('correctly mints from another admin', async function() {
            await this.contract.grantRole(ROLE_ADMIN, this.addr1.address);
            await this.contract.connect(this.addr1).airdrop(this.wallets);
            expect(await this.contract.connect(this.addr1).totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
            expect(await this.contract.connect(this.addr1).availableSupply()).to.equal(0);
            expect(await this.contract.connect(this.addr1).balanceOf(this.owner.address)).to.equal(TOKEN_MAX_SUPPLY);
        });

        it('reverts if non-admin mints', async function() {
            await expect(this.contract.connect(this.addr1).airdrop(this.wallets.slice(0, 1))).to.be.reverted;
            expect(await this.contract.totalSupply()).to.equal(0);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
        });

        it('reverts if over minted', async function() {
            await this.contract.airdrop(this.wallets);
            await expect(this.contract.airdrop(this.wallets)).to.be.revertedWith('Airdrop: More wallets provided than available supply');
            await expect(this.contract.airdrop(this.wallets.slice(0, 1))).to.be.revertedWith('Airdrop: More wallets provided than available supply');
            expect(await this.contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
            expect(await this.contract.availableSupply()).to.equal(0);
            expect(await this.contract.balanceOf(this.owner.address)).to.equal(TOKEN_MAX_SUPPLY);
        });
    });

    describe('randomization', function () {

        const MOCK_MINT_ORDER = [7, 2, 4, 1, 8, 10, 6, 3, 5, 9];
        const FORCED_MINT_ORDER = [9, 1, 7, 4, 10, 8, 3, 6, 5, 2];

        it('correctly mints randomly and uniquely', async function() {
            await this.contract.setBaseURI('/');
            
            for (let i = 0; i < TOKEN_MAX_SUPPLY; i++) {
                await this.contract.airdrop([this.owner.address]);
                let tokenId = MOCK_MINT_ORDER[i];
                expect(await this.contract.tokenURI(tokenId)).to.equal('/' + tokenId);
                expect(await this.contract.tokenByIndex(i)).to.equal(tokenId);
            }
        });

        it('correctly mints if random is all the same number', async function() {
            await this.contract.setBaseURI('/');
            await this.contract.setSeedOverride(1);
            
            for (let i = 0; i < TOKEN_MAX_SUPPLY; i++) {
                await this.contract.airdrop([this.owner.address]);
                let tokenId = FORCED_MINT_ORDER[i];
                expect(await this.contract.tokenURI(tokenId)).to.equal('/' + tokenId);
                expect(await this.contract.tokenByIndex(i)).to.equal(tokenId);
            }
        });
    });

    describe('metadata', function () {
        it('correctly updates baseURI', async function() {
            await this.contract.airdrop(this.wallets.slice(0, 1));
            const tokenId = await this.contract.tokenByIndex(0);
            await this.contract.setBaseURI('base/');
            expect(await this.contract.tokenURI(tokenId)).to.equal('base/' + tokenId.toString());
        });

        it('correctly updates baseURI multiple times', async function() {
            await this.contract.grantRole(ROLE_ADMIN, this.addr1.address);
            await this.contract.airdrop(this.wallets.slice(0, 1));
            const tokenId = await this.contract.tokenByIndex(0);
            await this.contract.setBaseURI('base/');
            expect(await this.contract.tokenURI(tokenId)).to.equal('base/' + tokenId.toString());
            await this.contract.connect(this.addr1).setBaseURI('base2/');
            expect(await this.contract.tokenURI(tokenId)).to.equal('base2/' + tokenId.toString());
            await this.contract.setBaseURI('base/');
            expect(await this.contract.tokenURI(tokenId)).to.equal('base/' + tokenId.toString());
        });

        it('correctly updates baseURI from another admin', async function() {
            await this.contract.grantRole(ROLE_ADMIN, this.addr1.address);
            await this.contract.connect(this.addr1).airdrop(this.wallets.slice(0, 1));
            const tokenId = await this.contract.connect(this.addr1).tokenByIndex(0);
            await this.contract.connect(this.addr1).setBaseURI('base/');
            expect(await this.contract.connect(this.addr1).tokenURI(tokenId)).to.equal('base/' + tokenId.toString());
        });

        it('reverts if non-admin updates baseURI', async function() {
            await this.contract.airdrop(this.wallets.slice(0, 1));
            const tokenId = await this.contract.tokenByIndex(0);
            await this.contract.setBaseURI('base/');
            await expect(this.contract.connect(this.addr1).setBaseURI('notthis/')).to.be.reverted;
            expect(await this.contract.tokenURI(tokenId)).to.equal('base/' + tokenId.toString());
        });
    });
});
