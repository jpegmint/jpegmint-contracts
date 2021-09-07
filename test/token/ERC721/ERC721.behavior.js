// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { shouldSupportInterfaces } = require('../../utils/SupportsInterface.behavior');

const firstTokenId = 1;
const secondTokenId = 2;
const nonExistentTokenId = 13;
const fourthTokenId = 4;

function shouldBehaveLikeERC721(errorPrefix) {
    shouldSupportInterfaces([
        'ERC165',
        'ERC721'
    ]);

    context('with minted tokens', function () {

        beforeEach(async function () {
            this.owner = this.accounts[0];
            this.newOwner = this.accounts[1];
            this.approved = this.accounts[2];
            this.anotherApproved = this.accounts[3];
            this.operator = this.accounts[4];
            this.other = this.accounts[5];
            this.toWhom = this.other;
            await this.contract.mint(this.owner.address, firstTokenId);
            await this.contract.mint(this.owner.address, secondTokenId);
        });

        describe('balanceOf', function () {
            context('when the given address owns some tokens', function () {
                it('returns the amount of tokens owned by the given address', async function () {
                    expect(await this.contract.balanceOf(this.owner.address)).to.equal(2);

                    for (let i = 3; i < 100; i++) {
                        await this.contract.mint(this.owner.address, i);
                    }
                });
            });

            context('when the given address does not own any tokens', function () {
                it('returns 0', async function () {
                    expect(await this.contract.balanceOf(this.other.address)).to.equal(0);
                });
            });

            context('when querying the zero address', function () {
                it('throws', async function () {
                    await expect(this.contract.balanceOf(ethers.constants.AddressZero))
                        .to.be.revertedWith('ERC721: balance query for the zero address')
                    ;
                });
            });
        });

        describe('ownerOf', function () {
            context('when the given token ID was tracked by this token', function () {
                const tokenId = firstTokenId;
        
                it('returns the owner of the given token ID', async function () {
                    expect(await this.contract.ownerOf(tokenId)).to.be.equal(this.owner.address);
                });
            });
      
            context('when the given token ID was not tracked by this token', function () {
                const tokenId = nonExistentTokenId;
        
                it('reverts', async function () {
                    await expect(this.contract.ownerOf(tokenId))
                        .to.be.revertedWith('ERC721: owner query for nonexistent token')
                    ;
                });
            });
        });

        describe.only('transfers', function () {
            const tokenId = firstTokenId;
            const data = '0x42';
      
            let logs = null;

            beforeEach(async function () {
                await this.contract.approve(this.approved.address, tokenId);
                await this.contract.setApprovalForAll(this.operator.address, true);
            });
      
            const transferWasSuccessful = function () {
                it('transfers the ownership of the given token ID to the given address', async function () {
                    expect(await this.contract.ownerOf(tokenId)).to.equal(this.toWhom.address);
                });
        
                it('emits a Transfer event', async function () {
                    const logs = await ethers.provider.getLogs(this.contract.filters.Transfer());
                    const events = logs.map((log) => this.contract.interface.parseLog(log));
                    expect(events.length).to.equal(1);
                    expect(events[0].args['from']).to.equal(this.owner.address);
                    expect(events[0].args['to']).to.equal(this.toWhom.address);
                    expect(events[0].args['tokenId']).to.equal(tokenId);
                });
        
                it('clears the approval for the token ID', async function () {
                    expect(await this.contract.getApproved(tokenId)).to.be.equal(ethers.constants.AddressZero);
                });
        
                it('emits an Approval event', async function () {
                    const logs = await ethers.provider.getLogs(this.contract.filters.Approval());
                    const events = logs.map((log) => this.contract.interface.parseLog(log));
                    expect(events.length).to.equal(1);
                    expect(events[0].args['approved']).to.equal(ethers.constants.AddressZero);
                    expect(events[0].args['tokenId']).to.equal(tokenId);
                });
        
                it('adjusts owners balances', async function () {
                    expect(await this.contract.balanceOf(this.owner.address)).to.equal(1);
                });
        
                it('adjusts owners tokens by index', async function () {
                    if (!this.contract.tokenOfOwnerByIndex) return;

                    expect(await this.contract.tokenOfOwnerByIndex(this.toWhom.address, 0)).to.equal(tokenId);
                    expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 0)).to.not.equal(tokenId);
                });
            };

            describe('via transferFrom', function () {
                beforeEach(async function () {
                    await this.contract.transferFrom(this.owner.address, this.toWhom.address, tokenId);
                });
                transferWasSuccessful();
            });
        });
    });
}

function shouldBehaveLikeERC721Enumerable(errorPrefix) {
    shouldSupportInterfaces([
      'ERC721Enumerable',
    ]);

    context('with minted tokens', function () {

        beforeEach(async function () {
            await this.contract.mint(this.owner.address, firstTokenId);
            await this.contract.mint(this.owner.address, secondTokenId);
        });

        describe('totalSupply', function () {
            it('returns total token supply', async function () {
                expect(await this.contract.totalSupply()).to.equal(2);
            });
        });

        describe('tokenOfOwnerByIndex', function () {
            context('when the given index is lower than the amount of tokens owned by the given address', function () {
                it('returns the token ID placed at the given index', async function () {
                    expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 0)).to.equal(firstTokenId);
                });
            });
            
            context('when the given index is exact number of tokens owned by the given address', function () {
                it('returns the token ID placed at the given index', async function () {
                    console.log(await this.contract.walletOfOwner(this.owner.address));
                    expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 0)).to.equal(firstTokenId);
                    expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 1)).to.equal(secondTokenId);
                    await this.contract.transferFrom(this.owner.address, this.newOwner.address, secondTokenId);
                    console.log(await this.contract.walletOfOwner(this.owner.address));
                    expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 0)).to.equal(firstTokenId);
                });
            });
        
            context('when the index is greater than or equal to the total tokens owned by the given address', function () {
                it('reverts', async function () {
                    await expect(this.contract.tokenOfOwnerByIndex(this.owner.address, 2))
                        .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
                    ;
                });
            });
        
            describe('when the given address does not own any token', function () {
                it('reverts', async function () {
                    await expect(this.contract.tokenOfOwnerByIndex(this.other.address, 0))
                        .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
                    ;
                });
            });
        
            describe('after transferring all tokens to another user', function () {
    
                beforeEach(async function () {
                    await this.contract.transferFrom(this.owner.address, this.newOwner.address, firstTokenId);
                    await this.contract.transferFrom(this.owner.address, this.newOwner.address, secondTokenId);
                });
        
                it('returns correct token IDs for target', async function () {
                    expect(await this.contract.balanceOf(this.newOwner.address)).to.equal(2);
                    const tokensListed = await Promise.all(
                        [0, 1].map(i => this.contract.tokenOfOwnerByIndex(this.newOwner.address, i)),
                    );
                    expect(tokensListed.map(t => t.toNumber()))
                        .to.have.members([firstTokenId, secondTokenId])
                    ;
                });
        
                it('returns empty collection for original owner', async function () {
                    expect(await this.contract.balanceOf(this.owner.address)).to.equal(0);
                    await expect(this.contract.tokenOfOwnerByIndex(this.owner.address, 0))
                        .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
                    ;
                });
            });
        });

        describe('tokenByIndex', function () {
            it('returns all tokens', async function () {
                const tokensListed = await Promise.all(
                    [0, 1].map(i => this.contract.tokenByIndex(i)),
                );
                expect(tokensListed.map(t => t.toNumber())).to.have.members([firstTokenId, secondTokenId]);
            });
        
            it('reverts if index is greater than supply', async function () {
                await expect(this.contract.tokenByIndex(2))
                    .to.be.revertedWith('ERC721Enumerable: global index out of bounds')
                ;
            });
        });  
    });
};

function shouldBehaveLikeERC721Metadata(errorPrefix, name, symbol, owner) {
    shouldSupportInterfaces([
      'ERC721Metadata',
    ]);
  
    describe('metadata', function () {
        it('has a name', async function () {
            expect(await this.contract.name()).to.be.equal(name);
        });
    
        it('has a symbol', async function () {
            expect(await this.contract.symbol()).to.be.equal(symbol);
        });
    
        // describe('token URI', function () {
        //     beforeEach(async function () {
        //         await this.contract.mint(this.owner.address, firstTokenId);
        //     });
    
        //     it('return empty string by default', async function () {
        //     expect(await this.token.tokenURI(firstTokenId)).to.be.equal('');
        //     });
    
        //     it('reverts when queried for non existent token id', async function () {
        //         await expectRevert(
        //             this.token.tokenURI(nonExistentTokenId), 'ERC721Metadata: URI query for nonexistent token',
        //         );
        //     });
    
        //     describe('base URI', function () {
        //         beforeEach(function () {
        //             if (this.token.setBaseURI === undefined) {
        //             this.skip();
        //             }
        //         });
        
        //         it('base URI can be set', async function () {
        //             await this.token.setBaseURI(baseURI);
        //             expect(await this.token.baseURI()).to.equal(baseURI);
        //         });
        
        //         it('base URI is added as a prefix to the token URI', async function () {
        //             await this.token.setBaseURI(baseURI);
        //             expect(await this.token.tokenURI(firstTokenId)).to.be.equal(baseURI + firstTokenId.toString());
        //         });
        
        //         it('token URI can be changed by changing the base URI', async function () {
        //             await this.token.setBaseURI(baseURI);
        //             const newBaseURI = 'https://api.example.com/v2/';
        //             await this.token.setBaseURI(newBaseURI);
        //             expect(await this.token.tokenURI(firstTokenId)).to.be.equal(newBaseURI + firstTokenId.toString());
        //         });
        //     });
        // });
    });
}

module.exports = {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata,
    shouldBehaveLikeERC721Enumerable,
};
