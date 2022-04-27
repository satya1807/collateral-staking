const hre = require("hardhat");

const ethers = hre.ethers;

async function main() {
    const amount = await ethers.utils.parseEther("1");

    const Token = await ethers.getContractFactory("Col");
    const Stake = await ethers.getContractFactory("Stake");
    const LPToken = await ethers.getContractFactory("LPToken");

    const col = await Token.deploy(amount);
    const usdt = await ethers.getContractAt(
        "IERC20",
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
    );
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

    await stake.deployed();

    await rewards.transfer(stake.address, 100);

    await lp.setPool(stake.address, true);

    console.log("USDT at:", usdt.address);
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
