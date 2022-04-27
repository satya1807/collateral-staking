require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

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
                url: "https://speedy-nodes-nyc.moralis.io/94a3b3a6adf3f7cb410c0491/polygon/mainnet/archive",
                blockNumber: 27621079,
            },
        },
    },
};
