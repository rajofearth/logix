// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LogixINR is ERC20, Ownable {
    constructor() ERC20("Logix INR", "LINR") Ownable(msg.sender) {
        _mint(msg.sender, 10000000000 * 10**18); // 10B INR
    }

    function mint(address to, uint amount) external onlyOwner {
        _mint(to, amount);
    }

    function batchMint(address[] calldata tos, uint[] calldata amounts) external onlyOwner {
        require(tos.length == amounts.length, "Mismatch");
        for (uint i = 0; i < tos.length; i++) {
            _mint(tos[i], amounts[i]);
        }
    }
}
