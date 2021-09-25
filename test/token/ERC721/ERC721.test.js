// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata,
    shouldBehaveLikeERC721Enumerable,
} = require('./ERC721.behavior');

const firstTokenId = 1;
const secondTokenId = 2;
const nonExistentTokenId = 13;
const fourthTokenId = 4;

describe('MockERC721', function () {

    const CONTRACT_NAME = 'MockERC721';
    const CONTRACT_SYMBOL = 'MockERC721';

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        this.defaultSender = accounts[0];
        this.accounts = accounts.slice(1);

        this.factory = await ethers.getContractFactory(CONTRACT_NAME);
        this.contract = await this.factory.deploy();
        await this.contract.deployed();
    });

    describe('minting', function () {

        beforeEach(function () {
            this.owner = this.accounts[0];
            this.newOwner = this.accounts[1];
            this.approved = this.accounts[2];
            this.anotherApproved = this.accounts[3];
            this.operator = this.accounts[4];
            this.other = this.accounts[5];
            this.toWhom = this.other;
        });

        context('when minting tokens', function () {
            it('uses gas', async function () {
                await this.contract.mint(this.owner.address, firstTokenId);
                await this.contract.mint(this.owner.address, secondTokenId);
            });
        });
    })

    // shouldBehaveLikeERC721('ERC721');
    // shouldBehaveLikeERC721Metadata('ERC721', CONTRACT_NAME, CONTRACT_SYMBOL);
    // shouldBehaveLikeERC721Enumerable('ERC721');
});

describe('MockERC721Enumerable', function () {

    const CONTRACT_NAME = 'MockERC721Enumerable';
    const CONTRACT_SYMBOL = 'MockERC721Enumerable';

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        this.defaultSender = accounts[0];
        this.accounts = accounts.slice(1);

        this.factory = await ethers.getContractFactory(CONTRACT_NAME);
        this.contract = await this.factory.deploy();
        await this.contract.deployed();
    });

    describe('minting', function () {

        beforeEach(function () {
            this.owner = this.accounts[0];
            this.newOwner = this.accounts[1];
            this.approved = this.accounts[2];
            this.anotherApproved = this.accounts[3];
            this.operator = this.accounts[4];
            this.other = this.accounts[5];
            this.toWhom = this.other;
        });

        context('when minting tokens', function () {
            it('uses gas', async function () {
                await this.contract.mint(this.owner.address, firstTokenId);
                await this.contract.mint(this.owner.address, secondTokenId);
            });
        });
    })

    // shouldBehaveLikeERC721('ERC721');
    // shouldBehaveLikeERC721Metadata('ERC721', CONTRACT_NAME, CONTRACT_SYMBOL);
    // shouldBehaveLikeERC721Enumerable('ERC721');
});
