const { network, ethers } = require("hardhat");
const chai = require("chai");
const { expect } = chai;
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

describe("Stake", function () {
    beforeEach(async () => {
        amount = await ethers.utils.parseEther("1");

        const Token = await ethers.getContractFactory("Col");
        const Stake = await ethers.getContractFactory("Stake");
        const LPToken = await ethers.getContractFactory("LPToken");

        col = await Token.deploy(amount);
        usdt = await Token.deploy(amount);
        rewards = await Token.deploy(amount);
        lp = await LPToken.deploy();

        await col.deployed();
        await rewards.deployed();
        await lp.deployed();

        stake = await Stake.deploy(
            usdt.address,
            col.address,
            rewards.address,
            lp.address
        );
        await stake.deployed();

        signer = stake.signer;
        addr = signer.address;

        await rewards.transfer(stake.address, 100);
        await lp.setPool(stake.address, true);
    });

    it(".. should deploy correctly 👍", async () => {
        expect(await stake.tenure()).equal(30);
        expect(await stake.totalDeposits()).equal(0);
        expect(await stake.rate()).equal(5);
        expect(await stake.totalCollateral()).equal(0);
        expect(await rewards.balanceOf(stake.address)).equal(100);
        expect(await lp.balanceOf(stake.address)).to.equal(0);
    });

    it(".. should deposit correctly 👍", async () => {
        await usdt.approve(stake.address, 100);
        await col.approve(stake.address, 10);

        await stake.deposit(100);

        const depo = await stake.accounts(addr);
        expect(depo.amount).equal(100);
        expect(await lp.balanceOf(addr)).to.equal(100);
    });

    it(".. should test getCalculated interest 👍", async () => {
        await usdt.approve(stake.address, 100);
        await col.approve(stake.address, 10);
        const time = (await ethers.provider.getBlock()).timestamp;

        await stake.deposit(100);

        let interest = await stake.calculateInterest(100, time);
        // Before tenure
        expect(interest).to.be.equal(0);

        await advanceTime(30);

        interest = await stake.calculateInterest(100, time);
        // After tenure
        expect(interest).to.be.equal(5);

        await advanceTime(120);
        interest = await stake.calculateInterest(100, time);
        // After tenure
        expect(interest).to.be.equal(27);
        // Should be around 28.34 but solidity can not calculate decimals
    });

    it(".. should withdraw correctly 👍", async () => {
        await usdt.approve(stake.address, 100);
        await col.approve(stake.address, 10);
        await stake.deposit(100);

        // before tenure
        let bf = await lp.balanceOf(addr);
        let bfR = await rewards.balanceOf(addr);
        let bfD = await usdt.balanceOf(addr);
        await stake.withdraw(50);
        let af = await lp.balanceOf(addr);
        let afR = await rewards.balanceOf(addr);
        let afD = await usdt.balanceOf(addr);
        expect(bf.sub(af)).to.equal(50);
        expect(afR.sub(bfR)).to.equal(0);
        expect(afD.sub(bfD)).to.equal(50);

        // after tenure
        await advanceTime(30);

        bf = await lp.balanceOf(addr);
        bfR = await rewards.balanceOf(addr);
        bfD = await usdt.balanceOf(addr);
        await stake.withdraw(50);
        af = await lp.balanceOf(addr);
        afR = await rewards.balanceOf(addr);
        afD = await usdt.balanceOf(addr);
        expect(bf.sub(af)).to.equal(50);
        expect(afR.sub(bfR)).to.equal(5);
        expect(afD.sub(bfD)).to.equal(50);
    });
});

async function advanceTime(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
}
