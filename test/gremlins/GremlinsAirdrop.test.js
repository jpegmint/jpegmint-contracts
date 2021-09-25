// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata,
    shouldBehaveLikeERC721Enumerable,
} = require('../token/ERC721/ERC721.behavior');

/**
 */
describe('GremlinsAirdrop', function () {

    const CONTRACT_NAME = 'MockGremlinsAirdrop';
    const CONTRACT_SYMBOL = 'MOCKAIRDROP';
    const TOKEN_MAX_SUPPLY = 10;
    const AIRDROP_ROLE = ethers.utils.id('AIRDROP_ROLE');

    beforeEach(async function () {
        this.factory = await ethers.getContractFactory(CONTRACT_NAME);
        this.contract = await this.factory.deploy(TOKEN_MAX_SUPPLY);
        await this.contract.deployed();
        
        this.accounts = await ethers.getSigners();
        this.owner = this.accounts[0];
        this.newOwner = this.accounts[1];
        this.approved = this.accounts[2];
        this.anotherApproved = this.accounts[3];
        this.operator = this.accounts[4];
        this.other = this.accounts[5];
        this.toWhom = this.other;
    });

    shouldBehaveLikeERC721('ERC721');
    shouldBehaveLikeERC721Metadata('ERC721', CONTRACT_NAME, CONTRACT_SYMBOL);

    describe('roles', function () {

        it('has an owner', async function () {
            expect(await this.contract.owner()).to.equal(this.owner.address);
        });

        it('correctly sets admin roles', async function () {
            expect(await this.contract.hasRole(ethers.constants.HashZero, this.owner.address)).to.be.true;
            expect(await this.contract.hasRole(AIRDROP_ROLE, this.owner.address)).to.be.true;
        });
    });

    describe('totalSupply', function () {

        it('correctly starts with max supply', async function () {
            expect(await this.contract.totalSupply()).to.equal(0);
            expect(await this.contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
        });
    });
});
