require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
    version: "0.8.7",
    settings: {
        optimizer: {
        enabled: true,
        runs: 200
        }
    }
    },
    networks: {
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: { mnemonic: process.env.MNEMONIC }
        },
        mainnet: {
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: { mnemonic: process.env.MNEMONIC }
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true
    }
};
