// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldSupportInterfaces } = require('../behaviors/SupportsInterface.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');

describe.only('MockHarvester', () => {

    const CONTRACT_NAME = 'MockHarvester';
    const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

    let contract, erc721, erc1155;
    let accounts, owner, newOwner, approved, operator, other;

    beforeEach(async () => {

        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other ] = accounts;

        const TokenFarm = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await TokenFarm.deploy();
        await contract.deployed();

        const MockERC721 = await ethers.getContractFactory("MockERC721");
        erc721 = await MockERC721.deploy();
        await erc721.deployed();

        const MockERC1155 = await ethers.getContractFactory("MockERC1155");
        erc1155 = await MockERC1155.deploy();
        await erc1155.deployed();
    });
    
    shouldSupportInterfaces(() => contract, ['ERC721Receiver', 'ERC1155Receiver']);

    describe('Ownable', () => {
        shouldBehaveLikeOwnable(() => [ contract, accounts ]);
    });

    describe('receive', () => {
        it('receives ether', async () => {
            expect(await ethers.provider.getBalance(contract.address)).to.equal(0);
            expect(await owner.sendTransaction( { to: contract.address, value: 1 }))
                .to.changeEtherBalances([owner, contract], [-1, 1])
            ;
        });
    });

    describe('BURN_ADDRESS', () => {
        it('burn address is 0xdEaD', async () => {
            expect(await contract.BURN_ADDRESS()).to.equal(BURN_ADDRESS);
        });
    });

    describe('HARVEST_ADDRESS', () => {
        it('harvest address is contract address', async () => {
            expect(await contract.HARVEST_ADDRESS()).to.equal(contract.address);
        });
    });

    describe('PAID_PER_TOKEN', () => {
        it('default price is 1 gwei', async () => {
            const amount = ethers.utils.parseUnits("1", "gwei");
            expect(await contract.PAID_PER_TOKEN()).to.equal(amount);
        });
    });

    describe('COST_PER_TOKEN', () => {
        it('default paid is 0.01 ether', async () => {
            const amount = ethers.utils.parseUnits("0.01", "ether");
            expect(await contract.COST_PER_TOKEN()).to.equal(amount);
        });
    });

    context('Harvest', () => {

        beforeEach(async () => {
            const tokenIds = [...Array(20).keys()];
            tokenIds.map(async tokenId => await erc721.mint(owner.address, tokenId));
            await erc1155.mint(owner.address, 0, 20);
        });

        describe('onERC721Received', () => {

            beforeEach(async () => {
                await owner.sendTransaction( { to: contract.address, value: ethers.utils.parseUnits('1', 'gwei') });
            });
            
            it('receives erc721 via safeTransferFrom', async () => {
                await erc721['safeTransferFrom(address,address,uint256)'](owner.address, contract.address, 0);

                expect(await erc721.ownerOf(0)).to.equal(contract.address);
                expect(await erc721.balanceOf(contract.address)).to.equal(1);
            });

            it('pays for erc721 via safeTransferFrom', async () => {
                expect(await erc721['safeTransferFrom(address,address,uint256)'](owner.address, contract.address, 0))
                    .to.changeEtherBalances([owner, contract], [1000000000, -1000000000])
                ;
            });

            it('reverts if insufficient balance', async () => {
                await erc721['safeTransferFrom(address,address,uint256)'](owner.address, contract.address, 0);
                await expect(erc721['safeTransferFrom(address,address,uint256)'](owner.address, contract.address, 1))
                    .to.be.revertedWith('402')
                ;
            });

            it('reverts if paused', async () => {
                await contract.pause();
                await expect(erc721['safeTransferFrom(address,address,uint256)'](owner.address, contract.address, 0))
                    .to.be.revertedWith('Pausable: paused')
                ;
            });
        });

        describe('onERC1155Received', () => {

            beforeEach(async () => {
                await owner.sendTransaction( { to: contract.address, value: ethers.utils.parseUnits('10', 'gwei') });
            });
            
            it('receives erc1155 via safeTransferFrom', async () => {
                await erc1155.safeTransferFrom(owner.address, contract.address, 0, 1, []);

                expect(await erc1155.balanceOf(contract.address, 0)).to.equal(1);
            });
            
            it('receives multiple erc1155 via safeTransferFrom', async () => {
                await erc1155.safeTransferFrom(owner.address, contract.address, 0, 10, []);

                expect(await erc1155.balanceOf(contract.address, 0)).to.equal(10);
            });

            it('pays for erc1155 via safeTransferFrom', async () => {
                expect(await erc1155.safeTransferFrom(owner.address, contract.address, 0, 1, []))
                    .to.changeEtherBalances([owner, contract], [1000000000, -1000000000])
                ;
            });

            it('pays for multiple erc1155 via safeTransferFrom', async () => {
                expect(await erc1155.safeTransferFrom(owner.address, contract.address, 0, 10, []))
                    .to.changeEtherBalances([owner, contract], [10000000000, -10000000000])
                ;
            });

            it('reverts if insufficient balance', async () => {
                await expect(erc1155.safeTransferFrom(owner.address, contract.address, 0, 11, []))
                    .to.be.revertedWith('402')
                ;
            });

            it('reverts if paused', async () => {
                await contract.pause();
                await expect(erc1155.safeTransferFrom(owner.address, contract.address, 0, 11, []))
                    .to.be.revertedWith('Pausable: paused')
                ;
            });
        });
        
        describe('onERC1155BatchReceived', () => {

            it('reverts', async () => {
                await expect(erc1155.safeBatchTransferFrom(owner.address, contract.address, [0], [11], []))
                    .to.be.revertedWith('ERC1155: ERC1155Receiver rejected tokens')
                ;
            });

            it('reverts if paused', async () => {
                await contract.pause();
                await expect(erc1155.safeBatchTransferFrom(owner.address, contract.address, [0], [11], []))
                    .to.be.revertedWith('ERC1155: ERC1155Receiver rejected tokens')
                ;
            });
        });

        describe('sellTokens', () => {

            context('with approvalForAll', () => {
                
                beforeEach(async () => {
                    await owner.sendTransaction( { to: contract.address, value: ethers.utils.parseEther("1.0") });
                    await erc721.setApprovalForAll(contract.address, true);
                    await erc1155.setApprovalForAll(contract.address, true);
                });

                describe('receives token', () => {
            
                    it('via sellTokens', async () => {
                        await contract.sellTokens(erc721.address, [0]);

                        expect(await erc721.ownerOf(0)).to.equal(contract.address);
                        expect(await erc721.balanceOf(contract.address)).to.equal(1);
                    });
            
                    it('erc721 sellAndBurnTokens', async () => {
                        await contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [0]);

                        expect(await erc721.ownerOf(0)).to.equal(BURN_ADDRESS);
                        expect(await erc721.balanceOf(BURN_ADDRESS)).to.equal(1);
                    });
            
                    it('erc1155 sellAndBurnTokens', async () => {
                        await contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 1);

                        expect(await erc1155.balanceOf(BURN_ADDRESS, 0)).to.equal(1);
                    });
                });

                describe('receives multiple tokens', () => {
                
                    it('via sellTokens', async () => {
                        await contract.sellTokens(erc721.address, [...Array(20).keys()]);

                        expect(await erc721.balanceOf(contract.address)).to.equal(20);
                    });
                
                    it('erc721 sellAndBurnTokens', async () => {
                        await contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [...Array(20).keys()]);
    
                        expect(await erc721.balanceOf(BURN_ADDRESS)).to.equal(20);
                    });
            
                    it('erc1155 sellAndBurnTokens', async () => {
                        await contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 20);

                        expect(await erc1155.balanceOf(BURN_ADDRESS, 0)).to.equal(20);
                    });
                });

                describe('pays for one token', () => {

                    it('via sellTokens', async () => {
                        expect(await contract.sellTokens(erc721.address, [0]))
                            .to.changeEtherBalances([owner, contract], [1000000000, -1000000000])
                        ;
                    });

                    it('erc721 sellAndBurnTokens', async () => {
                        expect(await contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [0]))
                            .to.changeEtherBalances([owner, contract], [1000000000, -1000000000])
                        ;
                    });
            
                    it('erc1155 sellAndBurnTokens', async () => {
                        expect(await contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 1))
                            .to.changeEtherBalances([owner, contract], [1000000000, -1000000000])
                        ;
                    });
                });

                describe('pays for multiple tokens', () => {

                    it('via sellTokens', async () => {
                        expect(await contract.sellTokens(erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
                            .to.changeEtherBalances([owner, contract], [10000000000, -10000000000])
                        ;
                    });

                    it('erc721 sellAndBurnTokens', async () => {
                        expect(await contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
                            .to.changeEtherBalances([owner, contract], [10000000000, -10000000000])
                        ;
                    });

                    it('erc1155 sellAndBurnTokens', async () => {
                        expect(await contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 10))
                            .to.changeEtherBalances([owner, contract], [10000000000, -10000000000])
                        ;
                    });
                });

                describe('reverts if not token owner', () => {

                    it('sellTokens', async () => {
                        await expect(contract.connect(other).sellTokens(erc721.address, [0]))
                            .to.be.revertedWith('403')
                        ;
                    });

                    it('erc721 sellAndBurnTokens', async () => {
                        await expect(contract.connect(other)['sellAndBurnTokens(address,uint256[])'](erc721.address, [0]))
                            .to.be.revertedWith('403')
                        ;
                    });

                    it('erc1155 sellAndBurnTokens', async () => {
                        await expect(contract.connect(other)['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 1))
                            .to.be.revertedWith('403')
                        ;
                    });
                });
            });

            context('with partial balance', () => {
                
                beforeEach(async () => {
                    await owner.sendTransaction( { to: contract.address, value: ethers.utils.parseUnits("10", "gwei") });
                    await erc721.setApprovalForAll(contract.address, true);
                    await erc1155.setApprovalForAll(contract.address, true);
                });

                it('sellTokens reverts', async () => {
                    await expect(contract.sellTokens(erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))
                        .to.be.revertedWith('402')
                    ;
                });

                it('erc721 sellAndBurnTokens reverts', async () => {
                    await expect(contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))
                        .to.be.revertedWith('402')
                    ;
                });

                it('erc1155 sellAndBurnTokens reverts', async () => {
                    await expect(contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 11))
                        .to.be.revertedWith('402')
                    ;
                });
            });

            context('without balance', () => {
                beforeEach(async () => {
                    await erc721.setApprovalForAll(contract.address, true);
                });

                it('sellTokens reverts', async () => {
                    await expect(contract.sellTokens(erc721.address, [0]))
                        .to.be.revertedWith('402')
                    ;
                });

                it('erc721 sellAndBurnTokens reverts', async () => {
                    await expect(contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [0]))
                        .to.be.revertedWith('402')
                    ;
                });

                it('erc1155 sellAndBurnTokens reverts', async () => {
                    await expect(contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 1))
                        .to.be.revertedWith('402')
                    ;
                });
            });

            
            context('without approvalForAll', () => {
                
                beforeEach(async () => {
                    await owner.sendTransaction( { to: contract.address, value: ethers.utils.parseEther("1.0") });
                });
            
                it('sellTokens reverts', async () => {
                    await expect(contract.connect(other).sellTokens(erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
                        .to.be.revertedWith('403')
                    ;
                });
            
                it('erc721 sellAndBurnTokens reverts', async () => {
                    await expect(contract.connect(other)['sellAndBurnTokens(address,uint256[])'](erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
                        .to.be.revertedWith('403')
                    ;
                });
            
                it('erc1155 sellAndBurnTokens reverts', async () => {
                    await expect(contract.connect(other)['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 10))
                        .to.be.revertedWith('403')
                    ;
                });
            });

            context('paused', () => {

                beforeEach(async () => {
                    await owner.sendTransaction( { to: contract.address, value: ethers.utils.parseUnits("10", "gwei") });
                    await erc721.setApprovalForAll(contract.address, true);
                    await erc1155.setApprovalForAll(contract.address, true);
                    await contract.pause();
                });

                it('sellTokens reverts', async () => {
                    await expect(contract.sellTokens(erc721.address, [0]))
                        .to.be.revertedWith('Pausable: paused')
                    ;
                });

                it('erc721 sellAndBurnTokens reverts', async () => {
                    await expect(contract['sellAndBurnTokens(address,uint256[])'](erc721.address, [0]))
                        .to.be.revertedWith('Pausable: paused')
                    ;
                });

                it('erc1155 sellAndBurnTokens reverts', async () => {
                    await expect(contract['sellAndBurnTokens(address,uint256,uint256)'](erc1155.address, 0, 1))
                        .to.be.revertedWith('Pausable: paused')
                    ;
                });
            });
        });
    });

    describe('purchaseTokens', () => {

        const COST_PER_TOKEN = ethers.utils.parseUnits('0.01', 'ether');

        beforeEach(async () => {

            const amount = ethers.utils.parseEther("1.0");
            await owner.sendTransaction( { to: contract.address, value: amount });

            const tokenIds = [...Array(20).keys()];
            tokenIds.map(async tokenId => await erc721.mint(owner.address, tokenId));
            await erc1155.mint(owner.address, 0, 20);
            await erc1155.mint(owner.address, 1, 20);

            await erc721.setApprovalForAll(contract.address, true);
            await contract.sellTokens(erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            await erc1155.safeTransferFrom(owner.address, contract.address, 0, 20, []);
        });

        describe('transfers tokens', () => {

            it('one via purchaseERC721Tokens', async () => {
                await contract.purchaseERC721Tokens(erc721.address, [0], { value: COST_PER_TOKEN });

                expect(await erc721.ownerOf(0)).to.equal(owner.address);
            });

            it('multiple via purchaseERC721Tokens', async () => {
                await contract.purchaseERC721Tokens(erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], { value: COST_PER_TOKEN.mul(10) });
    
                for (let i = 0; i < 10; i++) {
                    expect(await erc721.ownerOf(i)).to.equal(owner.address);
                }
            });

            it('one via purchaseERC1155Tokens', async () => {
                await contract.purchaseERC1155Tokens(erc1155.address, 0, 1, { value: COST_PER_TOKEN });
                expect(await erc1155.balanceOf(owner.address, 0)).to.equal(1);
            });

            it('multiple via purchaseERC1155Tokens', async () => {
                await contract.purchaseERC1155Tokens(erc1155.address, 0, 20, { value: COST_PER_TOKEN.mul(20) });
                expect(await erc1155.balanceOf(owner.address, 0)).to.equal(20);
            });
        })

        describe('receives payment', () => {

            it('receives payment for one via purchaseERC721Tokens', async () => {
                expect(await contract.purchaseERC721Tokens(erc721.address, [0], { value: COST_PER_TOKEN }))
                    .to.changeEtherBalances([owner, contract], [COST_PER_TOKEN.mul(-1), COST_PER_TOKEN])
                ;
            });

            it('receives payment for one via purchaseERC1155Tokens', async () => {
                expect(await contract.purchaseERC1155Tokens(erc1155.address, 0, 1, { value: COST_PER_TOKEN }))
                    .to.changeEtherBalances([owner, contract], [COST_PER_TOKEN.mul(-1), COST_PER_TOKEN])
                ;
            });

            it('receives payment for multiple via purchaseERC721Tokens', async () => {
                expect(await contract.purchaseERC721Tokens(erc721.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], { value: COST_PER_TOKEN.mul(10) }))
                    .to.changeEtherBalances([owner, contract], [COST_PER_TOKEN.mul(-10), COST_PER_TOKEN.mul(10)])
                ;
            });

            it('receives payment for multiple via purchaseERC1155Tokens', async () => {
                expect(await contract.purchaseERC1155Tokens(erc1155.address, 0, 20, { value: COST_PER_TOKEN.mul(20) }))
                    .to.changeEtherBalances([owner, contract], [COST_PER_TOKEN.mul(-20), COST_PER_TOKEN.mul(20)])
                ;
            });
        });

        context('with insufficient balance', () => {

            const LOW_AMOUNT = ethers.utils.parseUnits('0.001', 'ether');

            it('purchaseERC721Tokens reverts', async () => {
                await expect(contract.purchaseERC721Tokens(erc721.address, [10], { value: LOW_AMOUNT }))
                    .to.be.revertedWith('402')
                ;
            });

            it('purchaseERC1155Tokens reverts', async () => {
                await expect(contract.purchaseERC1155Tokens(erc1155.address, 0, 1, { value: LOW_AMOUNT }))
                    .to.be.revertedWith('402')
                ;
            });
        });

        context('not owner', () => {

            it('purchaseERC721Tokens reverts', async () => {
                await expect(contract.purchaseERC721Tokens(erc721.address, [10], { value: COST_PER_TOKEN }))
                    .to.be.revertedWith('403')
                ;
            });

            it('purchaseERC721Tokens reverts batch', async () => {
                await expect(contract.purchaseERC721Tokens(erc721.address, [0, 1, 2, 3, 10], { value: COST_PER_TOKEN.mul(5) }))
                    .to.be.revertedWith('403')
                ;
            });

            it('purchaseERC1155Tokens reverts', async () => {
                await expect(contract.purchaseERC1155Tokens(erc1155.address, 1, 1, { value: COST_PER_TOKEN }))
                    .to.be.revertedWith('403')
                ;
            });
        });

        context('paused', () => {

            beforeEach(async () => {
                await contract.pause();
            });

            it('purchaseERC721Tokens reverts', async () => {
                await expect(contract.purchaseERC721Tokens(erc721.address, [1], { value: COST_PER_TOKEN }))
                    .to.be.revertedWith('Pausable: paused')
                ;
            });

            it('purchaseERC1155Tokens reverts', async () => {
                await expect(contract.purchaseERC1155Tokens(erc1155.address, 0, 1, { value: COST_PER_TOKEN }))
                    .to.be.revertedWith('Pausable: paused')
                ;
            });
        });
    });
});
