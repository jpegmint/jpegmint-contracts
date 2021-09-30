// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    let wallet = ethers.Wallet.createRandom();
    let randomMnemonic = wallet.mnemonic;
    console.log(randomMnemonic);
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
