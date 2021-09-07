const { ethers } = require("hardhat");
 
async function generateAccounts(count) {
    const signers = await ethers.getSigners();
    let accounts = [];
    for (let i = 0; i < count; i++) {
        accounts.push(signers[i]);
    }
    return accounts;
}

module.exports = (async function() {
    const allAccounts = await generateAccounts(10);
    const defaultSender = allAccounts[0];
    const accounts = allAccounts.slice(1);

    return { defaultSender, accounts }
})();
