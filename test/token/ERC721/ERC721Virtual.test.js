// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 */
describe.only('VirtualLoot', function () {

    const CONTRACT_NAME = 'VirtualLoot';
    const CONTRACT_SYMBOL = 'vLOOT';

    before(async function () {
        [this.owner, this.addr1, this.gnosis, this.owner1, this.owner2] = await ethers.getSigners();

    });

    beforeEach(async function () {
        this.factory = await ethers.getContractFactory(CONTRACT_NAME);
        this.contract = await this.factory.deploy();
        await this.contract.deployed();
    });

    describe('initialization', function () {

        it('correctly sets the name', async function () {
            expect(await this.contract.name()).to.equal(CONTRACT_NAME);
        });

        it('correctly sets the symbol', async function () {
            expect(await this.contract.symbol()).to.equal(CONTRACT_SYMBOL);
        });
    });

    describe('minting', function () {

        it('correctly mints', async function () {
            
            await this.contract.mintLoot();

            let filter = await this.contract.filters.Transfer();
            let logs = await ethers.provider.getLogs(filter);
            logs.forEach((log) => {
                let logDescription = this.contract.interface.parseLog(log);
                console.log(logDescription);
            });

        });
    });
});
