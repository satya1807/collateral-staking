require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

const dotenv = require("dotenv");

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

module.exports = {
    solidity: "0.8.4",
    networks: {
        hardhat: {
            forking: {
                url: process.env.RPC_URL,
                blockNumber: 27621079,
            },
        },
    },
};
