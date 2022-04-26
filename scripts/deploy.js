const hre = require("hardhat");

const ethers = hre.ethers;

async function main() {
    const amount = await ethers.utils.parseEther("1");

    const Token = await ethers.getContractFactory("Col");
    const Stake = await ethers.getContractFactory("Stake");
    const LPToken = await ethers.getContractFactory("LPToken");

    const col = await Token.deploy(amount);
    const usdt = await Token.deploy(amount); // for dev
    const rewards = await Token.deploy(amount);
    const lp = await LPToken.deploy();

    await col.deployed();
    await usdt.deployed();
    await rewards.deployed();
    await lp.deployed();

    const stake = await Stake.deploy(
        usdt.address,
        col.address,
        rewards.address,
        lp.address
    );

    console.log("USDT deployed to:", usdt.address);
    console.log("Col deployed to:", col.address);
    console.log("Rewards deployed to: ", rewards.address);
    console.log("LP Token deployed to: ", lp.address);

    console.log("Stake deployed to: ", stake.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
