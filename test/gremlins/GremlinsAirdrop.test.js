// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Enumerable } = require('../behaviors/ERC721Enumerable.behavior');

describe('GremlinsAirdrop', () => {

    const CONTRACT_NAME = 'MockGremlinsAirdrop';
    const CONTRACT_SYMBOL = 'MOCKAIRDROP';
    const TOKEN_MAX_SUPPLY = 10;
    const AIRDROP_ROLE = ethers.utils.id('AIRDROP_ROLE');

    let factory;
    let contract;
    let accounts, owner, newOwner, approved, operator, other;

    beforeEach(async () => {
        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy(TOKEN_MAX_SUPPLY);
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
            await contract.airdrop([owner.address, owner.address]);
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, 1, 2, 100 ]);
    });

    describe('ERC721enumerable', () => {

        beforeEach(async () => {
            await contract.airdrop([owner.address, owner.address]);
        });

        shouldBehaveLikeERC721Enumerable(() => [ contract, accounts, 1, 2, 100 ]);
    });
});
