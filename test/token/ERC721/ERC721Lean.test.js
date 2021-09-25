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

// /**
//  */
// describe.only('MockERC721', function () {

//     const CONTRACT_NAME = 'MockERC721';
//     const CONTRACT_SYMBOL = 'MockERC721';

//     beforeEach(async function () {
//         const accounts = await ethers.getSigners();
//         this.defaultSender = accounts[0];
//         this.accounts = accounts.slice(1);

//         this.factory = await ethers.getContractFactory(CONTRACT_NAME);
//         this.contract = await this.factory.deploy();
//         await this.contract.deployed();
//     });

//     shouldBehaveLikeERC721('ERC721');
//     shouldBehaveLikeERC721Metadata('ERC721', CONTRACT_NAME, CONTRACT_SYMBOL);
//     // shouldBehaveLikeERC721Enumerable('ERC721');
// });

// describe.only('MockERC721Enumerable', function () {

//     const CONTRACT_NAME = 'MockERC721Enumerable';
//     const CONTRACT_SYMBOL = 'MockERC721Enumerable';

//     beforeEach(async function () {
//         const accounts = await ethers.getSigners();
//         this.defaultSender = accounts[0];
//         this.accounts = accounts.slice(1);

//         this.factory = await ethers.getContractFactory(CONTRACT_NAME);
//         this.contract = await this.factory.deploy();
//         await this.contract.deployed();
//     });

//     shouldBehaveLikeERC721('ERC721');
//     shouldBehaveLikeERC721Metadata('ERC721', CONTRACT_NAME, CONTRACT_SYMBOL);
//     shouldBehaveLikeERC721Enumerable('ERC721');
// });

describe('MockERC721Lean', function () {

    const CONTRACT_NAME = 'MockERC721Lean';
    const CONTRACT_SYMBOL = 'MockERC721Lean';

    beforeEach(async function () {
        this.accounts = await ethers.getSigners();

        this.factory = await ethers.getContractFactory(CONTRACT_NAME);
        this.contract = await this.factory.deploy();
        await this.contract.deployed();
    });

    shouldBehaveLikeERC721('ERC721');
    shouldBehaveLikeERC721Metadata('ERC721', CONTRACT_NAME, CONTRACT_SYMBOL);
    shouldBehaveLikeERC721Enumerable('ERC721');
});
