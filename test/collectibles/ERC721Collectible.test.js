// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Enumerable } = require('../behaviors/ERC721Enumerable.behavior');

/**
 */
describe('ERC721Collectible', function () {

    const CONTRACT_NAME = 'MockCollectible';
    const CONTRACT_SYMBOL = 'MOCKCOLLECTIBLE';
    const TOKEN_MAX_SUPPLY = 100;
    const TOKEN_PRICE = 0;
    const TOKEN_MAX_PER_TXN = 10;

    let factory;
    let contract;
    let accounts, owner, newOwner, approved, operator, other;

    beforeEach(async () => {
        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy(TOKEN_MAX_SUPPLY, TOKEN_PRICE, TOKEN_MAX_PER_TXN);
        await contract.deployed();
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other ] = accounts;
    });

    describe('Ownable', () => {
        shouldBehaveLikeOwnable(() => [ contract, accounts ]);
    });

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    });

    describe('ERC721', () => {

        let firstTokenId, secondTokenId;

        beforeEach(async () => {
            await contract.startSale();
            await contract.mintCollectibles(2);
            firstTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 0)).toNumber();
            secondTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 1)).toNumber();
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, firstTokenId, secondTokenId, 100 ]);
    });

    describe('ERC721enumerable', () => {

        beforeEach(async () => {
            await contract.startSale();
            await contract.mintCollectibles(2);
            firstTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 0)).toNumber();
            secondTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 1)).toNumber();
        });

        shouldBehaveLikeERC721Enumerable(() => [ contract, accounts, firstTokenId, secondTokenId, 100 ]);
    });

    describe('initialization', function () {

        it('correctly starts paused', async function () {
            expect(await contract.isPaused()).to.be.true;
        });

        it('correctly starts with max supply', async function () {
            expect(await contract.totalSupply()).to.equal(0);
            expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
        });
    });

    describe('minting', function () {

        it('correctly mints', async function () {
            await contract.startSale();
            await contract.mintCollectibles(1);
            
            expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 1);
        });
    });

    describe('enumerable', function () {

        it('correctly tracks totalSupply', async function () {
            await contract.startSale();
            expect(await contract.totalSupply()).to.equal(0);
            expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);

            for (var i = 0; i < TOKEN_MAX_SUPPLY; i++) {
                await contract.mintCollectibles(1);
                expect(await contract.totalSupply()).to.equal(i + 1);
                expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - i - 1);
            }

            expect(contract.mintCollectibles(1)).to.be.reverted;
            expect(await contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
            expect(await contract.availableSupply()).to.equal(0);
        });
    });
});
