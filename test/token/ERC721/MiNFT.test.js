// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldSupportInterfaces } = require('../../behaviors/SupportsInterface.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../../behaviors/ERC721Metadata.behavior');

describe('MiNFT', function () {

    const CONTRACT_NAME = 'MiNFT';
    const PROXY_NAME = 'MiNFTProxy';
    const TOKEN_NAME = 'MiNFT';
    const TOKEN_SYMBOL = 'MiNFT';

    let factory, proxyFactory, contract, logic, proxy;
    let accounts, owner, newOwner, approved, operator, other;

    before(async () => {

        factory = await ethers.getContractFactory(CONTRACT_NAME);
        logic = await factory.deploy();
        await logic.deployed();

        console.log(logic.address);
    });

    beforeEach(async () => {

        proxyFactory = await ethers.getContractFactory(PROXY_NAME);
        proxy = await proxyFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL);
        await proxy.deployed();

        contract = factory.attach(proxy.address);
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other ] = accounts;
    });
    
    shouldSupportInterfaces(() => contract, ['ERC165', 'ERC721', 'Ownable']);

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], TOKEN_NAME, TOKEN_SYMBOL);
    });

    describe('mint', () => {
        it('mints', async () => {
            await contract.mint(1, 'test.mp4');
        });
    });
});
