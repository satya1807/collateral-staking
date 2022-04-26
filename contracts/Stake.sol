//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./tokens/LPToken.sol";

// change LP Token
contract Stake is Ownable {
    using Address for address;

    IERC20 depositToken;
    IERC20 collateralToken;
    IERC20 rewardsToken;
    LPToken lpToken;

    uint256 rewards;
    uint256 totalDeposits;
    uint256 totalCollateral;
    uint256 public constant tenure = 30 seconds; // for dev
    uint256 public constant rate = 5;

    struct Account {
        uint256 amount;
        uint256 depositTime;
    }

    mapping(address => Account) public accounts;

    event Deposit(address user, uint256 amount, uint256 timestamp);
    event Withdraw(address user, uint256 amount, uint256 interest);

    constructor(
        address _deposit,
        address _collateral,
        address _rewards,
        address _lp
    ) {
        require(_deposit.isContract(), "Invalid Deposit Token");
        require(_collateral.isContract(), "Invalid Collateral Token");
        require(_lp.isContract(), "Invalid LP Token");
        require(_rewards.isContract(), "Invalid Rewards Token");

        depositToken = IERC20(_deposit);
        collateralToken = IERC20(_collateral);
        rewardsToken = IERC20(_rewards);
        lpToken = LPToken(_lp);
    }

    function deposit(uint256 amount) external returns (bool) {
        require(amount > 0, "Deposit must be greater than 0");
        uint256 col = (amount * 10) / 100;

        bool rec = depositToken.transferFrom(msg.sender, address(this), amount);
        require(rec, "Token transfer failed");
        rec = collateralToken.transferFrom(msg.sender, address(this), col);
        require(rec, "Token transfer failed");

        address user = msg.sender;
        uint256 time = block.timestamp;

        accounts[user] = Account({amount: amount, depositTime: time});
        totalDeposits += amount;
        totalCollateral += col;
        lpToken.mint(user, amount);
        emit Deposit(user, amount, time);
        return true;
    }

    function calculateInterest(uint256 amount, uint256 depositTime)
        public
        view
        returns (uint256)
    {
        uint256 currentTime = block.timestamp;
        uint256 inteverals = (currentTime - depositTime) % tenure;
        if (inteverals == 0) return 0;

        uint256 total = amount * (1 + rate)**inteverals;
        uint256 interest = total - amount;
        return interest;
    }

    function withdraw(uint256 amount) external returns (bool) {
        address user = msg.sender;
        uint256 col;
        Account storage acc = accounts[msg.sender];
        require(acc.amount != 0, "Invalid account");
        require(acc.amount >= amount, "Invalid amount");
        uint256 interest = calculateInterest(acc.amount, acc.depositTime);
        lpToken.burn(user, amount);

        bool sent = depositToken.transfer(user, amount);
        require(sent, "Token Transfer failed");
        if (interest > 0) {
            require(
                rewardsToken.balanceOf(address(this)) >= interest,
                "Invalid rewards in Pool"
            );
            sent = rewardsToken.transfer(user, interest);
            require(sent, "Token Transfer failed");
            col = (amount * 10) / 100;
            sent = collateralToken.transfer(user, col);
            require(sent, "Token Transfer failed");
        }

        totalDeposits -= amount;
        rewards -= interest;
        totalCollateral -= col;

        emit Withdraw(user, amount, interest);
        return true;
    }
}
