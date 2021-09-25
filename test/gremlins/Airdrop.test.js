// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Enumerable } = require('../behaviors/ERC721Enumerable.behavior');

describe.only('GremlinsAirdrop', () => {

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

    // shouldBehaveLikeOwnable(() => [ contract, accounts ]);
    shouldBehaveLikeERC721(() => {
        contract.airdrop([owner.address, owner.address]);
        return [ contract, accounts, 1, 2, 100 ];
    });
    // shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    shouldBehaveLikeERC721Enumerable(() => {
        contract.airdrop([owner.address, owner.address]);
        return [ contract, accounts, 1, 2, 100 ];
    });
});
