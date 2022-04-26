//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract LPToken is ERC20, Ownable {
    using Address for address;

    mapping(address => bool) public pools;

    constructor() ERC20("LPToken", "TESTLP") {}

    modifier onlyPool(address addr) {
        require(pools[addr], "Caller is not a pool");
        _;
    }

    function setPool(address pool, bool enable) external onlyOwner {
        require(pool.isContract(), "Invalid address");
        pools[pool] = enable;
    }

    function mint(address user, uint256 amount)
        external
        onlyPool(msg.sender)
        returns (bool)
    {
        _mint(user, amount);
        return true;
    }

    function burn(address user, uint256 amount)
        external
        onlyPool(msg.sender)
        returns (bool)
    {
        _burn(user, amount);
        return true;
    }
}
