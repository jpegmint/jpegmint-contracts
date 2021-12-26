// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");
const ethers = hre.ethers;
const upgrades = hre.upgrades;

async function main() {
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    await hre.run("compile");

    [owner] = await ethers.getSigners();

    console.log("Deploying ...");
    const factory = await ethers.getContractFactory('ERC721Harvest');
    const contract = factory.attach('0x11d6a03491d368ac120791efe2911e1bf3f35d98');

    await contract.recover('0x8e7d7edf3ddd2afc9adf2dc93f3d8f867026494c', 1, '0x59b9076bbb9ea20d50c65419f46a4b8fc1f41033');

    // const contract = await factory.deploy();
    // await contract.deployed();
    // console.log('Deployed at ...', contract.address);

    // console.log(await contract.paused());
    // console.log((await contract.amountPerToken()).toNumber());
}
  
main()
.then(() => {
    console.log("Completed deployment.", '\n');
    process.exit(0);
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
