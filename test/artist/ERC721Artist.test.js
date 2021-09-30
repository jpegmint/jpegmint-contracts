// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Royalties } = require('../behaviors/ERC721Royalties.behavior');
const { shouldBehaveLikeERC721Enumerable } = require('../behaviors/ERC721Enumerable.behavior');

describe('ERC721Artist', () => {

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

    describe('Ownable', () => {
        shouldBehaveLikeOwnable(() => [ contract, accounts ]);
    });

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    });

    describe('ERC721', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'uri1');
            await contract.mint(owner.address, 2, 'uri2');
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, 1, 2, 100 ]);
    });

    describe('ERC721Royalties', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'uri1');
            await contract.mint(owner.address, 2, 'uri2');
        });
        
        shouldBehaveLikeERC721Royalties(() => [ contract, accounts ]);
    });

    describe('ERC721enumerable', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'uri1');
            await contract.mint(owner.address, 2, 'uri2');
        });

        shouldBehaveLikeERC721Enumerable(() => [ contract, accounts, 1, 2, 100 ]);
    });
});
