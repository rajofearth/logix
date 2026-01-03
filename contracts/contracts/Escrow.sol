// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is Ownable {
    IERC20 public token;

    event Deposited(address indexed from, uint256 amount, string reason);
    event Released(address indexed to, uint256 amount, string reason);
    event BatchReleased(address[] tos, uint256[] amounts);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function deposit(uint256 amount, string calldata reason) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Deposited(msg.sender, amount, reason);
    }

    function release(address to, uint256 amount, string calldata reason) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
        emit Released(to, amount, reason);
    }

    function batchRelease(address[] calldata tos, uint256[] calldata amounts) external onlyOwner {
        require(tos.length == amounts.length, "Mismatch");
        for (uint i = 0; i < tos.length; i++) {
            require(token.transfer(tos[i], amounts[i]), "Transfer failed");
        }
        emit BatchReleased(tos, amounts);
    }
}
