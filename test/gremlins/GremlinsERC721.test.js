// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { shouldBehaveLikeERC721 } = require('../behaviors/ERC721.behavior');
const { shouldBehaveLikeOwnable } = require('../behaviors/Ownable.behavior');
const { shouldBehaveLikeAccessControl } = require('../behaviors/AccessControl.behavior');
const { shouldBehaveLikeERC721Metadata } = require('../behaviors/ERC721Metadata.behavior');
const { shouldBehaveLikeERC721Royalties } = require('../behaviors/ERC721Royalties.behavior');

describe.only('GremlinsERC721', () => {
    
    const CONTRACT_NAME = 'GremlinsERC721';
    const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
    const WHITELISTED_ROLE = ethers.utils.id('WHITELISTED_ROLE');
    const AIRDROP_ADMIN_ROLE = ethers.utils.id('AIRDROP_ADMIN_ROLE');

    let wallets = [
        "0x2238af3a398d2417567cc9ae7fb9aa3b1b1a1203",
        "0x99840b92dd11b66ed2862bbb7d35b68d90e6bf8b",
        "0xd7510a925475cb8377bc8d2a7f1c792022b68df8",
        "0x675ebc88bd62310a49762722fc0cf3a725c02e6e",
        "0xeee5eb24e7a0ea53b75a1b9ad72e7d20562f4283",
        "0x1766255e71a11f9f9d13abe3f2840e3f6942aa29",
        "0x09238a2aa20600e9773990677d17fef91e688523",
        "0xecf494b4ea6fc8bd0209fc942b28a899969445a6",
        "0x720a4fab08cb746fc90e88d1924a98104c0822cf",
        "0x5a418d8bc0c074a4a8fa88d1322dc51cc1cb9d29",
        "0xe7ad5a0fcdfefce6cf203f94a1bf7ca01fdcb060",
        "0x00668bd79ede077b99bbe1c4db59418bc333d4cf",
        "0x2585b94bd758107e6d1698a0786e84efabc36882",
        "0xc9d25b9a3496c776688833d6ccfe507ef4f41645",
        "0x071489b287c20c413f28a17729b1c954bc01d5b8",
        "0xe91cbc483a8fda6bc377ad8b8c717f386a93d349",
        "0x8b51c1ba09ee33e7649cac62ccb6d0f410f5647a",
        "0x5b93ff82faaf241c15997ea3975419dddd8362c5",
        "0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459",
        "0x7d21dac0342215cf5c4b46d0300bbf8c9c5978cd",
        "0xc18690e2cf66442aea1f2bd2249f2dc87215677c",
        "0x31e99699bccde902afc7c4b6b23bb322b8459d22",
        "0x77d38e690a35b376dd99bf9b3ae8cb0d9e9fd2e6",
        "0x442dccee68425828c106a3662014b4f131e3bd9b",
        "0xf2f083bf4313c96acab7136a761899a88fd88c5b",
        "0xa22ad2bcda63cb91e32a4b34c7fafd5013f5f09d",
        "0x51787a2c56d710c68140bdadefd3a98bff96feb4",
        "0xeb1fbb2d250d7a20ecd76a33c079d7c0b74f965e",
        "0x5a3e28c2bf04989e6a7506a9ef845ae2dbc6d90a",
        "0x3e099af007cab8233d44782d8e6fe80fecdc321e",
        "0x2d5e03d9064a55b96d34290a176656398df91379",
        "0xb0b2b405c9d09d129e9f9b18c9dd218c532f2b2a",
        "0x7d8391a9d2199b3afa76e7824164503bb2fcc4bd",
        "0xd30b579be7da30c903c96c7de3729f8977e614e4",
        "0x716eb921f3b346d2c5749b5380dc740d359055d7",
        "0xf598aadf12a2fc4709b5db0c4c169715efaf2038",
        "0x290fbe4d4745f6b5267c209c92c8d81cebb5e9f0",
        "0xb4a9f08e1addaa8ce1837e3c73093d2970aae7ea",
        "0x9f0004e85ab1a65d569cbd9a59a46ef0c84cf470",
        "0xd2aff66959ee0e6f92ee02d741071ddb5084bebb",
        "0x6d938cbe86b4763691f702577d4046f656acb3c8",
        "0xc33411f5dae18253ab23068b700b5a0c9c44da2c",
        "0x19847a32b0eb348b006c79c1fb2d3ae1276c6028",
        "0x5ad7b8fb5bb2e3f92ab902a1cde48b45735152a8",
        "0x403afdf9ea925d3b48e719a44610da1679a57651",
        "0x6761bcaf2b2156c058634d9772f07374d6edef1d",
        "0xd4a08cf067c83d1b2cc1d26831569b7850804be7",
        "0x44a3ccddccae339d05200a8f4347f83a58847e52",
        "0xf0d6999725115e3ead3d927eb3329d63afaec09b",
        "0x72b40caa258c237c6f5947e291650808b913e9fc",
        "0x1e341aa44c293d95d13d778492d417d1be4e63d5",
        "0x055f86a0aaf702d7324076ae9c5b9aa203204ccd",
        "0x8a32af4affd816978c2fdfa7c08c27681d05d4fe",
        "0x3753fa57980fd180655c281158e428ca994d6dfa",
        "0x3b073ad23a1b8c962892d739fc59ae9128742448",
        "0x063a48f3b73957b6d0640352525eae313d4426c3",
        "0x148e2ed011a9eaaa200795f62889d68153eeacde",
        "0xceab2935e06c646e560e2f6083c55db6e8e12099",
        "0x3a2ae0dd0bc9e14e2399d209b98fb2705d3d0160",
        "0x7405fe24003a50e4f4117d35e9b5a9f5e512fede",
        "0xc8c90c83fd08d7e66703982de7a6177732240ca0",
        "0x00bd53913a82f36e5796ed7d30f1b2a15cd31c20",
        "0x54be3a794282c030b15e43ae2bb182e14c409c5e",
        "0x1d4b9b250b1bd41daa35d94bf9204ec1b0494ee3",
        "0x80c939f8a66c59b37330f93f1002541fd4e51aa2",
        "0x3f849f47f5b372d80407e442f360ad7b17f5fac4",
        "0x39f4662bf97200dbfa00ed05e3141c8959151cfa",
        "0xac4361f56c82ed59d533d45129f407015d84702a",
        "0xb95e4c8ce45f76489b050bdc3abe2bf8d2aaa479",
        "0x750a31fa07184caf87b6cce251d2f0d7928badde",
        "0x5438de398e6dc40b801f161ed2e086c9ada216b4",
        "0xcf88fa6ee6d111b04be9b06ef6fad6bd6691b88c",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ];

    let baseFactory, base, factory, proxy, contract;
    let accounts, owner, newOwner, approved, operator, other, authorized;

    beforeEach(async () => {
        baseFactory = await ethers.getContractFactory('GremlinsERC721');
        base = await baseFactory.deploy();
        await base.deployed();

        factory = await ethers.getContractFactory(CONTRACT_NAME);
        contract = await factory.deploy();
        await contract.deployed();
        
        accounts = await ethers.getSigners();
        [ owner, newOwner, approved, operator, other, authorized ] = accounts;
    });

    describe('SHARED TESTS', () => {
        describe('Ownable', () => {
            shouldBehaveLikeOwnable(() => [ contract, accounts ]);
        });

        describe('AccessControl', () => {
            shouldBehaveLikeAccessControl(() => [ contract, accounts ]);
        });
    });


    describe('UNIQUE TESTS', () => {

        describe('initialize()', () => {
            it('base is initialized', async () => {
                await expect(contract.initialize('Fail', 'FAIL'))
                    .to.be.revertedWith('Initializable: contract is already initialized')
                ;
            });
        });

        describe('name()', () => {
            it('base contract should not have a name', async () => {
                expect(await base.name()).to.be.empty;
            });
        });

        describe('symbol()', () => {
            it('base contract should not have a symbol', async () => {
                expect(await base.symbol()).to.be.empty;
            });
        });

        describe('mint()', () => {
            it("reverts calling mint() from base", async () => {
                await expect(contract.mint(owner.address, 1, ""))
                    .to.be.revertedWith('Transaction reverted: function call to a non-contract account')
                ;
            });
        });

        describe('setBaseURI()', () => {
            it("reverts on base contract", async () => {
                await expect(contract.setBaseURI("mock")).to.be.revertedWith("Transaction reverted: function call to a non-contract account");
            });
        });

        describe('initial roles', () => {
            it('deployer has the default admin role', async function () {
                expect(contract.hasRole(DEFAULT_ADMIN_ROLE, owner.address));
            });
            
            it('deployer has the airdrop admin role', async function () {
                expect(contract.hasRole(AIRDROP_ADMIN_ROLE, owner.address));
            });
            
            it('airdrop admin role is own role admin', async function () {
                expect(await contract.getRoleAdmin(AIRDROP_ADMIN_ROLE)).to.equal(AIRDROP_ADMIN_ROLE);
            });
            
            it('airdrop admin role is whistlisted role admin', async function () {
                expect(await contract.getRoleAdmin(WHITELISTED_ROLE)).to.equal(AIRDROP_ADMIN_ROLE);
            });
        });

        describe('grantRole()', () => {

            const NEW_ROLE = ethers.utils.id("NEW_ROLE");

            it("can add more airdrop admins", async () => {
                expect(await contract.hasRole(AIRDROP_ADMIN_ROLE, authorized.address)).to.be.false;
                await contract.grantRole(AIRDROP_ADMIN_ROLE, authorized.address);
                expect(await contract.hasRole(AIRDROP_ADMIN_ROLE, authorized.address)).to.be.true;
            });

            it("airdrop admins can grant", async () => {
                await contract.grantRole(AIRDROP_ADMIN_ROLE, authorized.address);
                await contract.connect(authorized).grantRole(AIRDROP_ADMIN_ROLE, other.address);
                expect(await contract.hasRole(AIRDROP_ADMIN_ROLE, other.address)).to.be.true;
            });

            it('defaultAdmin can create arbitrary roles', async () => {
                await contract.grantRole(NEW_ROLE, other.address);
                expect(await contract.hasRole(NEW_ROLE, other.address)).to.be.true;
            });
        });

        describe('addWhitelist()', () => {

            it("airdrop admins can add whitelist", async () => {
                await contract.grantRole(AIRDROP_ADMIN_ROLE, authorized.address);
                await contract.connect(authorized).addWhitelist([other.address]);
                expect(await contract.checkWhitelist(other.address)).to.be.true;
            });

            it('reverts if non airdrop admin adds', async () => {
                await expect(contract.connect(other).addWhitelist([other.address]))
                    .to.be.revertedWith(`AccessControl: account ${other.address.toLowerCase()} is missing role ${AIRDROP_ADMIN_ROLE}`)
                ;
            });
        });

        describe('removeWhitelist()', () => {

            it("airdrop admins can remove whitelist", async () => {
                await contract.grantRole(AIRDROP_ADMIN_ROLE, authorized.address);
                await contract.connect(authorized).removeWhitelist([other.address]);
                expect(await contract.checkWhitelist(other.address)).to.be.false;
            });

            it('reverts if non airdrop admin removes', async () => {
                await expect(contract.connect(other).removeWhitelist([other.address]))
                    .to.be.revertedWith(`AccessControl: account ${other.address.toLowerCase()} is missing role ${AIRDROP_ADMIN_ROLE}`)
                ;
            });
        });

        describe('setApprovalForAll()', () => {
            it("setApprovalForAll sets", async () => {
                expect(await contract.isApprovedForAll(owner.address, operator.address)).to.be.false;
                await contract.setApprovalForAll(operator.address, true);
                expect(await contract.isApprovedForAll(owner.address, operator.address)).to.be.true;
            });
        });
    });
});
