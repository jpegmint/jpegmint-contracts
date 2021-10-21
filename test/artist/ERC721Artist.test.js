// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeMultiOwnable } = require('../behaviors/MultiOwnable.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Royalties } = require('../behaviors/ERC721Royalties.behavior');

describe.only('ERC721Artist', () => {

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
            await contract.mint(owner.address, 1, 'ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(owner.address, 2, 'ipfs://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });

        shouldBehaveLikeERC721(() => [ contract, accounts, 1, 2, 100 ]);
    });

    describe('ERC721Royalties', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(owner.address, 2, 'ipfs://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });
        
        shouldBehaveLikeERC721Royalties(() => [ contract, accounts ]);
    });

    describe('mint', () => {

        context('default owner', () => {
            it('can mint tokens', async () => {
                await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                expect(await contract.tokenURI(1)).to.equal('mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                expect(await contract.totalSupply()).to.equal(1);
            });
        });

        context('additional owners', () => {
            it('can mint tokens', async () => {
                await contract.approveOwner(newOwner.address);
                await contract.connect(newOwner).mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                expect(await contract.tokenURI(1)).to.equal('mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                expect(await contract.totalSupply()).to.equal(1);
            });
        });

        context('non-owners', () => {
            it('reverts', async () => {
                await expect(contract.connect(other).mint(other.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'))
                    .to.be.revertedWith('Ownable: caller is not the owner')
                ;
            });
        });

        context('with minted tokens', () => {
            beforeEach(async () => {
                await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            });

            it('reverts if re-using id', async () => {
                await expect(contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'))
                    .to.be.revertedWith('ERC721: token already minted')
                ;
            });
        });
    });

    describe('burn', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
        });

        context('default owner', () => {
            it('can burn tokens', async () => {
                await contract.burn(1);
                expect(await contract.totalSupply()).to.equal(0);
                await expect(contract.tokenURI(1))
                    .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token')
                ;
            });

            it('can re-mint burned tokenId', async () => {
                await contract.burn(1);
                await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                expect(await contract.tokenURI(1)).to.equal('mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                expect(await contract.totalSupply()).to.equal(1);
            });
        });

        context('non-owner', () => {
            it('can burn if approved', async () => {
                await contract.approve(approved.address, 1);
                await contract.connect(approved).burn(1);
                expect(await contract.totalSupply()).to.equal(0);
                await expect(contract.tokenURI(1))
                    .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token')
                ;
            });

            it('reverts if not owner or approved', async () => {
                await expect(contract.connect(other).burn(1))
                    .to.be.revertedWith('ERC721Burnable: caller is not owner nor approved')
                ;
            });
        });
    });

    describe('totalSupply', () => {

        beforeEach(async () => {
            await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(owner.address, 2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });

        it('returns total token supply', async () => {
            expect(await contract.totalSupply()).to.equal(2);
        });

        it('returns supply after burn', async () => {
            await contract.burn(1);
            expect(await contract.totalSupply()).to.equal(1);
            await contract.burn(2);
            expect(await contract.totalSupply()).to.equal(0);
        });

        it('returns supply after burn and re-mint', async () => {
            await contract.burn(1);
            expect(await contract.totalSupply()).to.equal(1);
            await contract.burn(2);
            expect(await contract.totalSupply()).to.equal(0);
            await contract.mint(owner.address, 1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            expect(await contract.totalSupply()).to.equal(1);
            await contract.mint(owner.address, 2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
            expect(await contract.totalSupply()).to.equal(2);
        });
    });

    describe('tokenURI', () => {

        const tokenId1 = 1;
        const tokenUri1 = 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
        
        beforeEach(async () => {
            await contract.mint(owner.address, tokenId1, tokenUri1);
        });

        it('returns correct uri', async () => {
            expect(await contract.tokenURI(tokenId1)).to.equal(tokenUri1);
        });

        it('reverts when queried for non existent token id', async () => {
            await expect(contract.tokenURI(2898))
                .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token')
            ;
        });

        it('reverts when queried after burn', async () => {
            await contract.burn(tokenId1);
            await expect(contract.tokenURI(tokenId1))
                .to.be.revertedWith('ERC721URIStorage: URI query for nonexistent token')
            ;
        });
    });

    describe('setTokenURI', () => {

        const tokenId1 = 1;
        const tokenUri1 = 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
        
        beforeEach(async () => {
            await contract.mint(owner.address, tokenId1, tokenUri1);
        });

        it('can be set for a token id', async () => {
            await contract.setTokenURI(tokenId1, 'mock://newuri');
            expect(await contract.tokenURI(tokenId1)).to.equal('mock://newuri');
        });

        it('reverts when setting for non existent token id', async () => {
            await expect(contract.setTokenURI(2898, 'mock://newuri'))
                .to.be.revertedWith('ERC721URIStorage: URI set of nonexistent token')
            ;
        });

        it('reverts if non-owner', async () => {
            await expect(contract.connect(other).setTokenURI(tokenId1, 'mock://newuri'))
                .to.be.revertedWith('Ownable: caller is not the owner')
            ;
        });
    });

    describe('setRoyalties', () => {
        it('reverts if non-owner', async () => {
            await expect(contract.connect(other).setRoyalties(owner.address, 1000))
                .to.be.revertedWith('Ownable: caller is not the owner')
            ;
        });
    });
});
