// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { shouldSupportInterfaces } = require('../../utils/SupportsInterface.behavior');


/**
 */
describe.only('ERC721Full', function () {

    const CONTRACT_NAME = 'MockERC721Full';
    const CONTRACT_SYMBOL = 'MockERC721Full';

    before(async function () {
        [this.owner, this.addr1, this.gnosis, this.owner1, this.owner2] = await ethers.getSigners();
    });

    beforeEach(async function () {
        this.factory = await ethers.getContractFactory(CONTRACT_NAME);
        this.contract = await this.factory.deploy();
        await this.contract.deployed();
    });

    describe('interfaces', function () {
        shouldSupportInterfaces([
            'ERC165',
            'ERC721',
            'ERC721Metadata',
            'ERC721Enumerable'
        ]);
    });

    // describe('initialization', function () {

    //     it('correctly sets the name', async function () {
    //         expect(await this.contract.name()).to.equal(CONTRACT_NAME);
    //     });

    //     it('correctly sets the symbol', async function () {
    //         expect(await this.contract.symbol()).to.equal(CONTRACT_SYMBOL);
    //     });
    // });

    // context('with minted tokens', function () {

    //     beforeEach(async function () {
    //         this.firstTokenId = 1;
    //         this.secondTokenId = 2;
    //         await this.contract.mint(this.owner.address, this.firstTokenId);
    //         await this.contract.mint(this.owner.address, this.secondTokenId);
    //     });

    //     describe('totalSupply', function () {
    //         it('returns total token supply', async function () {
    //             expect(await this.contract.totalSupply()).to.equal(2);
    //         });
    //     });

    //     describe('balanceOf', function () {
    //         context('when the given address owns some tokens', function () {
    //             it('returns the amount of tokens owned by the given address', async function () {
    //                 expect(await this.contract.balanceOf(this.owner.address)).to.equal(2);
    //             });
    //         });

    //         context('when the given address does not own any tokens', function () {
    //             it('returns 0', async function () {
    //               expect(await this.contract.balanceOf(this.addr1.address)).to.equal(0);
    //             });
    //         });

    //         context('when querying the zero address', function () {
    //             it('throws', async function () {
    //                 await expect(this.contract.balanceOf(ethers.constants.AddressZero))
    //                     .to.be.revertedWith('ERC721: balance query for the zero address')
    //                 ;
    //             });
    //         });
    //     });

    //     describe('tokenOfOwnerByIndex', function () {
    //         context('when the given index is lower than the amount of tokens owned by the given address', function () {
    //             it('returns the token ID placed at the given index', async function () {
    //                 expect(await this.contract.tokenOfOwnerByIndex(this.owner.address, 0)).to.equal(this.firstTokenId);
    //             });
    //         });
      
    //         context('when the index is greater than or equal to the total tokens owned by the given address', function () {
    //             it('reverts', async function () {
    //                 await expect(this.contract.tokenOfOwnerByIndex(this.owner.address, 2))
    //                     .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
    //                 ;
    //             });
    //         });
      
    //         describe('when the given address does not own any token', function () {
    //             it('reverts', async function () {
    //                 await expect(this.contract.tokenOfOwnerByIndex(this.addr1.address, 0))
    //                     .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
    //                 ;
    //             });
    //         });
      
    //         describe('after transferring all tokens to another user', function () {

    //             beforeEach(async function () {
    //                 await this.contract.transferFrom(this.owner.address, this.addr1.address, this.firstTokenId);
    //                 await this.contract.transferFrom(this.owner.address, this.addr1.address, this.secondTokenId);
    //             });
      
    //             it('returns correct token IDs for target', async function () {
    //                 expect(await this.contract.balanceOf(this.addr1.address)).to.equal(2);
    //                 const tokensListed = await Promise.all(
    //                     [0, 1].map(i => this.contract.tokenOfOwnerByIndex(this.addr1.address, i)),
    //                 );
    //                 expect(tokensListed.map(t => t.toNumber()))
    //                     .to.have.members([this.firstTokenId, this.secondTokenId])
    //                 ;
    //             });
      
    //             it('returns empty collection for original owner', async function () {
    //                 expect(await this.contract.balanceOf(this.owner.address)).to.equal(0);
    //                 await expect(this.contract.tokenOfOwnerByIndex(this.owner.address, 0))
    //                     .to.be.revertedWith('ERC721Enumerable: owner index out of bounds')
    //                 ;
    //             });
    //         });
    //     });      
    // });
});
