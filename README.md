# Collateral Staking

A hardhat project for staking contract which allows staking of <strong> USDT Token</strong> with <strong>Token X</strong> token as collateral.

While making a stake, you are required to make a deposit of 10% <strong>Token X</strong> tokens as collateral. If you withdraw before the specified, you will lose the collateral, else once after the tenure completes, the user can withdraw the their stake along with collateral and their interest yielded.

If the user decides to continue the stake, the interest earned will be compuneded in terms of once per tenure.

To deploy contracts

```shell
    npx hardhat run .\scripts\deploy.js
```

To compile

```shell
    npx hardhat compile
```

To test

```shell
    npx hardhat test
```
