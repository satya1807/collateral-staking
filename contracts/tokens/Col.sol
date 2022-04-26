//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Col is ERC20 {
    mapping(address => bool) public pools;

    constructor(uint256 amount) ERC20("Token X", "XToken") {
        _mint(msg.sender, amount);
    }
}
