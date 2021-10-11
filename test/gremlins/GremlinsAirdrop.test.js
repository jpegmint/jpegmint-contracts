// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');
const { shouldBehaveLikeAccessControl } = require('../behaviors/AccessControl.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Enumerable } = require('../behaviors/ERC721Enumerable.behavior');

describe('GremlinsAirdrop', () => {

    const CONTRACT_NAME = 'MockGremlinsAirdrop';
    const CONTRACT_SYMBOL = 'MOCKAIRDROP';
    const TOKEN_MAX_SUPPLY = 10;
    const AIRDROP_ROLE = ethers.utils.id('AIRDROP_ROLE');

    let factory, contract;
    let accounts, owner, newOwner, approved, operator, other, authorized;
    let wallets;

    beforeEach(async () => {
        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy(TOKEN_MAX_SUPPLY);
        await contract.deployed();
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other, authorized ] = accounts;
        
        wallets = [];
        for (let i = 0; i < TOKEN_MAX_SUPPLY; i++) {
            wallets.push(owner.address);
        }
    });

    describe('Ownable', () => {
        shouldBehaveLikeOwnable(() => [ contract, accounts ]);
    });

    describe('AccessControl', () => {
        shouldBehaveLikeAccessControl(() => [ contract, accounts ]);
    });

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], CONTRACT_NAME, CONTRACT_SYMBOL);
    });

    describe('ERC721', () => {

        let firstTokenId, secondTokenId;

        beforeEach(async () => {
            await contract.airdrop([owner.address, owner.address]);
            firstTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 0)).toNumber();
            secondTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 1)).toNumber();
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, firstTokenId, secondTokenId, 100 ]);
    });

    describe('ERC721enumerable', () => {

        let firstTokenId, secondTokenId;

        beforeEach(async () => {
            await contract.airdrop([owner.address, owner.address]);
            firstTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 0)).toNumber();
            secondTokenId = (await contract.tokenOfOwnerByIndex(owner.address, 1)).toNumber();
        });

        shouldBehaveLikeERC721Enumerable(() => [ contract, accounts, firstTokenId, secondTokenId, 100 ]);
    });

    describe('GremlinsAirdrop', () => {
        describe('default admin', () => {
            it('deployer has airdrop role', async () => {
                expect(await contract.hasRole(AIRDROP_ROLE, owner.address)).to.equal(true);
            });
        });

        describe('minting', () => {

            it('correctly mints all', async () => {
                await contract.airdrop(wallets);
                expect(await contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
                expect(await contract.availableSupply()).to.equal(0);
                expect(await contract.balanceOf(owner.address)).to.equal(TOKEN_MAX_SUPPLY);
            });
    
            it('correctly mints in batches', async () => {
                await contract.airdrop(wallets.slice(0, 4));
                expect(await contract.totalSupply()).to.equal(4);
    
                await contract.airdrop(wallets.slice(0, 4));
                expect(await contract.totalSupply()).to.equal(8);
    
                await contract.airdrop(wallets.slice(0, 2));
                expect(await contract.totalSupply()).to.equal(10);
    
                expect(await contract.availableSupply()).to.equal(0);
                expect(await contract.balanceOf(owner.address)).to.equal(10);
            });
    
            it('correctly mints one at a time', async () => {
                await contract.airdrop(wallets.slice(0, 1));
                expect(await contract.totalSupply()).to.equal(1);
                expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 1);
            });
    
            it('correctly mints even if non-ERC721 receiver', async () => {
                factory = await ethers.getContractFactory("ERC721");
                erc721 = await factory.deploy('Mock', 'MOCK');
                await erc721.deployed();
    
                wallets = wallets.slice(0,9);
                wallets.push(erc721.address);
                await contract.airdrop(wallets);
                expect(await contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
                expect(await contract.availableSupply()).to.equal(0);
            });
    
            it('correctly mints to multiple wallets', async () => {
                let wallets = [owner.address, newOwner.address, approved.address, other.address];
                await contract.airdrop(wallets);
                expect(await contract.totalSupply()).to.equal(4);
                expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY - 4);
                for (let i = 0; i < wallets.length; i++) {
                    expect(await contract.balanceOf(wallets[i])).to.equal(1);
                }
            });
    
            it('correctly mints from another admin', async () => {
                await contract.grantRole(AIRDROP_ROLE, authorized.address);
                await contract.connect(authorized).airdrop(wallets);
                expect(await contract.connect(authorized).totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
                expect(await contract.connect(authorized).availableSupply()).to.equal(0);
                expect(await contract.connect(authorized).balanceOf(owner.address)).to.equal(TOKEN_MAX_SUPPLY);
            });
    
            it('reverts if non-admin mints', async () => {
                await expect(contract.connect(other).airdrop(wallets.slice(0, 1)))
                    .to.be.revertedWith(`AccessControl: account ${other.address.toLowerCase()} is missing role ${AIRDROP_ROLE}`)
                ;
                expect(await contract.totalSupply()).to.equal(0);
                expect(await contract.availableSupply()).to.equal(TOKEN_MAX_SUPPLY);
            });
    
            it('reverts if over minted', async () => {
                await contract.airdrop(wallets);
                await expect(contract.airdrop(wallets)).to.be.revertedWith('Airdrop: More wallets provided than available supply');
                await expect(contract.airdrop(wallets.slice(0, 1))).to.be.revertedWith('Airdrop: More wallets provided than available supply');
                expect(await contract.totalSupply()).to.equal(TOKEN_MAX_SUPPLY);
                expect(await contract.availableSupply()).to.equal(0);
                expect(await contract.balanceOf(owner.address)).to.equal(TOKEN_MAX_SUPPLY);
            });
        });

        describe('randomization', () => {
    
            const MOCK_MINT_ORDER = [7, 2, 4, 1, 8, 10, 6, 3, 5, 9];
            const FORCED_MINT_ORDER = [9, 1, 7, 4, 10, 8, 3, 6, 5, 2];
    
            it('correctly mints randomly and uniquely', async () => {
                await contract.airdrop(wallets);
                for (let i = 0; i < TOKEN_MAX_SUPPLY; i++) {
                    let tokenId = MOCK_MINT_ORDER[i];
                    expect(await contract.tokenOfOwnerByIndex(owner.address, i)).to.equal(tokenId);
                }
            });
    
            it('correctly mints if random is all the same number', async () => {
                await contract.setSeedOverride(1);
                await contract.airdrop(wallets);
                
                for (let i = 0; i < TOKEN_MAX_SUPPLY; i++) {
                    let tokenId = FORCED_MINT_ORDER[i];
                    expect(await contract.tokenOfOwnerByIndex(owner.address, i)).to.equal(tokenId);
                }
            });
        });

        describe('metadata', () => {

            it('correctly updates metadataURI', async () => {
                await contract.airdrop(wallets.slice(0, 1));
                const tokenId = await contract.tokenOfOwnerByIndex(owner.address, 0);
                await contract.setMetadataURI('mock_uri');
                expect(await contract.tokenURI(tokenId)).to.equal('mock_uri');
            });

            it('correctly updates baseURI multiple times', async () => {
                await contract.airdrop(wallets.slice(0, 1));
                const tokenId = await contract.tokenOfOwnerByIndex(owner.address, 0);
                await contract.setMetadataURI('mock_uri');
                expect(await contract.tokenURI(tokenId)).to.equal('mock_uri');
                await contract.setMetadataURI('mock_uri2');
                expect(await contract.tokenURI(tokenId)).to.equal('mock_uri2');
            });

            it('correctly updates baseURI from another admin', async () => {
                await contract.grantRole(AIRDROP_ROLE, authorized.address);
                await contract.connect(authorized).airdrop(wallets.slice(0, 1));
                const tokenId = await contract.connect(authorized).tokenOfOwnerByIndex(owner.address, 0);
                await contract.connect(authorized).setMetadataURI('mock_uri');
                expect(await contract.connect(authorized).tokenURI(tokenId)).to.equal('mock_uri');
            });

            it('reverts if non-admin updates baseURI', async () => {
                await contract.airdrop(wallets.slice(0, 1));
                const tokenId = await contract.tokenOfOwnerByIndex(owner.address, 0);
                await contract.setMetadataURI('mock_uri');
                await expect(contract.connect(other).setMetadataURI('notthis'))
                    .to.be.revertedWith(`AccessControl: account ${other.address.toLowerCase()} is missing role ${AIRDROP_ROLE}`)
                ;
                expect(await contract.tokenURI(tokenId)).to.equal('mock_uri');
            });
        });
    });
});
