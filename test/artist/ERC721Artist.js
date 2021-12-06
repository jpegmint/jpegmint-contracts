// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721Artist } = require('./ERC721Artist.behavior');
const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeMultiOwnable } = require('../behaviors/MultiOwnable.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Royalties } = require('../behaviors/ERC721Royalties.behavior');

describe.skip('ERC721Artist', () => {

    const CONTRACT_NAME = 'MockERC721Artist';
    const CONTRACT_SYMBOL = 'MockERC721Artist';

    let factory, contract;
    let accounts, owner, newOwner, approved, operator, other;

    beforeEach(async () => {
        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy();
        await contract.deployed();
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other ] = accounts;
    });

    describe('MultiOwnable', () => {
        shouldBehaveLikeMultiOwnable(() => [ contract, accounts ]);
    });

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    });

    describe('ERC721', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(owner.address, 2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, 1, 2, 100 ]);
    });

    describe('ERC721Royalties', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(owner.address, 2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });
        
        shouldBehaveLikeERC721Royalties(() => [ contract, accounts ]);
    });

    describe('ERC721Artist', () => {
        shouldBehaveLikeERC721Artist(() => [ contract, accounts ]);
    });

    describe('TokenMetadata', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1);
        });

        it('sets metadata', async () => {
            const metadata = await contract.setTokenMetadata(1, 'Token 1', 'This is the cool token!', 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR', '');
            console.log(await contract.getTokenMetadata(1));
        });
    });
});
