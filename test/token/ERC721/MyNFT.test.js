// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldSupportInterfaces } = require('../../behaviors/SupportsInterface.behavior');
const { shouldBehaveLikeERC721Mint } = require('../../behaviors/ERC721Mint.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../../behaviors/ERC721Metadata.behavior');

describe('MyNFT', function () {

    const CONTRACT_NAME = 'MyNFT';
    const TOKEN_NAME = 'MyNFT';
    const TOKEN_SYMBOL = 'MYNFT';

    let factory, contract;
    let accounts, owner, newOwner, approved, operator, other;

    beforeEach(async () => {
        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy(TOKEN_NAME, TOKEN_SYMBOL);
        await contract.deployed();
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other ] = accounts;
    });
    
    shouldSupportInterfaces(() => contract, ['ERC165', 'ERC721', 'Ownable']);

    describe('ERC721Metadata', () => {
        shouldBehaveLikeERC721Metadata(() => [ contract, accounts ], TOKEN_NAME, TOKEN_SYMBOL);
    });

    describe('ERC721Mint', () => {

        let tokenId, tx, tokenUri;

        beforeEach(async () => {
            tokenId = 1;
            tokenUri = 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
            tx = await contract.mint(tokenId, tokenUri);
        });

        shouldBehaveLikeERC721Mint(() => [ contract, accounts, tokenId, tx, tokenUri, 100]);
    });

    describe('Ownable', () => {

        describe('owner', () => {
            it('allows anyone to query owner', async () => {
                expect(await contract.connect(other).owner()).to.equal(owner.address);
            });
        });

        describe('transferOwnership', () => {

            it('emits OwnershipTransferred event', async () => {
                const tx = await contract.transferOwnership(newOwner.address);
                expect(tx)
                    .to.emit(contract, 'OwnershipTransferred')
                    .withArgs(owner.address, newOwner.address)
                ; 
            });

            it('changes owner after transfer', async () => {
                await contract.transferOwnership(newOwner.address);
                expect(await contract.owner()).to.equal(newOwner.address);
            });

            it('prevents non-owners from transferring', async () => {
                await expect(contract.connect(other).transferOwnership(newOwner.address))
                    .to.be.revertedWith('')
                ;
            });

            it('guards ownership against stuck state', async () => {
                await expect(contract.transferOwnership(ethers.constants.AddressZero))
                    .to.be.revertedWith('')
                ;
            });
        });
    });

    describe('ERC721', () => {

        beforeEach(async () => {
            await contract.mint(1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });

        describe('balanceOf', () => {
            context('when the given address owns some tokens', () => {
                it('returns the amount of tokens owned by the given address', async () => {
                    expect(await contract.balanceOf(owner.address)).to.equal(2);
                });
            });

            context('when the given address does not own any tokens', () => {
                it('returns 0', async () => {
                    expect(await contract.balanceOf(other.address)).to.equal(0);
                });
            });

            context('when querying the zero address', () => {
                it('throws', async () => {
                    await expect(contract.balanceOf(ethers.constants.AddressZero))
                        .to.be.revertedWith('')
                    ;
                });
            });
        });

        describe('ownerOf', () => {

            context('when token has been minted', () => {
                it('returns the owner of the given token ID', async () => {
                    expect(await contract.ownerOf(1)).to.be.equal(owner.address);
                });
            });
      
            context('when token has not been minted', () => {
                it('reverts', async () => {
                    await expect(contract.ownerOf(100))
                        .to.be.revertedWith('')
                    ;
                });
            });
        });

        describe('approvals', () => {

            describe('approve', () => {

                context('when token has been minted', () => {
                    it('reverts', async () => {
                        await expect(contract.approve(other.address, 1))
                            .to.be.revertedWith('')
                        ;
                    });
                });

                context('when token has not been minted', () => {
                    it('reverts non-existing token', async () => {
                        await expect(contract.approve(other.address, 1000))
                            .to.be.revertedWith('')
                        ;
                    });
                });
            });

            describe('setApprovalForAll', () => {
                
                context('when approving an operator', () => {
                    it('reverts', async () => {
                        await expect(contract.setApprovalForAll(other.address, true))
                            .to.be.revertedWith('')
                        ;
                    });
                });

                context('when revoking an operator', () => {
                    it('reverts', async () => {
                        await expect(contract.setApprovalForAll(other.address, false))
                            .to.be.revertedWith('')
                        ;
                    });
                });
            });
            
            describe('getApproved', () => {

                context('when token has been minted', () => {
                    it('returns zero address', async () => {
                        expect(await contract.getApproved(1)).to.equal(ethers.constants.AddressZero);
                    });
                });
                
                context('when token has not been minted', () => {
                    it('returns zero address', async () => {
                        expect(await contract.getApproved(100)).to.equal(ethers.constants.AddressZero);
                    });
                });
            });

            describe('isApprovedForAll', () => {
                it('returns false', async () => {
                    expect(await contract.isApprovedForAll(owner.address, other.address)).to.be.false;
                });
            });
        });

        describe('transfers', () => {

            it('reverts via transferFrom', async () => {
                await expect(contract.transferFrom(owner.address, other.address, 1))
                    .to.be.revertedWith('')
                ;
            });

            it('reverts via safeTransferFrom', async () => {
                await expect(contract["safeTransferFrom(address,address,uint256)"](owner.address, other.address, 1))
                    .to.be.revertedWith('')
                ;
            });
            
            it('reverts via safeTransferFrom with data', async () => {
                await expect(contract["safeTransferFrom(address,address,uint256,bytes)"](owner.address, other.address, 1, 0))
                    .to.be.revertedWith('')
                ;
            });
        });
    });

    describe('ERC721Enumerable', () => {

        beforeEach(async () => {
            await contract.mint(1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
            await contract.mint(2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
        });

        describe('totalSupply', () => {
            it('returns total token supply', async () => {
                expect(await contract.totalSupply()).to.equal(2);
            });

            it('returns supply after burning first token', async () => {
                await contract.burn(1);
                expect(await contract.totalSupply()).to.equal(1);
            });

            it('returns supply after burning last token', async () => {
                await contract.burn(2);
                expect(await contract.totalSupply()).to.equal(1);
            });

            it('returns zero after burning all tokens', async () => {
                await contract.burn(1);
                await contract.burn(2);
                expect(await contract.totalSupply()).to.equal(0);
            });

            it('returns supply after re-minting', async () => {
                await contract.burn(1);
                await contract.burn(2);
                expect(await contract.totalSupply()).to.equal(0);
                await contract.mint(1, 'mock://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
                await contract.mint(2, 'mock://QmSMvNG99QTD3WVFAy8zzJbDecCR5TRyZzJYoz6YSbQP7F');
                expect(await contract.totalSupply()).to.equal(2);
            });
        });
    });
});
