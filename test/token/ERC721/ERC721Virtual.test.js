// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldSupportInterfaces } = require('../../behaviors/SupportsInterface.behavior');
const { shouldBehaveLikeERC721 } = require('../../behaviors/ERC721.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Enumerable } = require('../../behaviors/ERC721Enumerable.behavior');

/**
 */
describe('ERC721Virtual', () =>  {

    const CONTRACT_NAME = 'MockERC721Virtual';
    const CONTRACT_SYMBOL = 'MockERC721Virtual';

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

    shouldSupportInterfaces(() => contract, ['ERC165', 'ERC721', 'ERC721Enumerable']);

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    });

    describe('minting', () =>  {

        it('correctly mints', async () =>  {
            
            await contract.mint();

            let filter = await contract.filters.Transfer();
            let logs = await ethers.provider.getLogs(filter);
            logs.forEach((log) => {
                let logDescription = contract.interface.parseLog(log);
                console.log(logDescription);
            });

        });
    });
});
