// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Royalties } = require('../behaviors/ERC721Royalties.behavior');

describe('ERC721ContractRoyalties', () => {

    const CONTRACT_NAME = 'MockERC721Royalties';
    const CONTRACT_SYMBOL = 'MockERC721Royalties';

    let factory;
    let contract;
    let accounts, owner, newOwner, approved, operator, other;

    beforeEach(async () => {
        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy();
        await contract.deployed();
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other ] = accounts;
    });

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    });

    describe('ERC721Royalties', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1);
            await contract.mint(owner.address, 2);
        });
        
        shouldBehaveLikeERC721Royalties(() => [ contract, accounts ]);
    });

    describe('ERC721', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1);
            await contract.mint(owner.address, 2);
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, 1, 2, 100 ]);
    });
});
