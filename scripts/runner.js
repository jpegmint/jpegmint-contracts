// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    await hre.run("compile");

    const [owner] = await ethers.getSigners();

    const baseFactory = await ethers.getContractFactory("GremlinsBase");
    const base = await baseFactory.deploy();
    await base.deployed();

    const proxyFactory = await ethers.getContractFactory("MockGremlinsAirdrop");
    const proxy = await proxyFactory.deploy(base.address);
    await proxy.deployed();
    const airdrop = await baseFactory.attach(proxy.address);
    
    await base.airdrop(proxy.address, owner.address);
}
  
main()
.then(() => {
    console.log("Completed runner.", '\n');
    process.exit(0);
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
