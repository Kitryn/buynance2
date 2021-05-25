// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Liquiflash is Ownable {
    using SafeERC20 for IERC20;
    address internal troveManager;
    address internal constant TOKEN_ETH =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(address _troveManager) payable {
        troveManager = _troveManager;
    }

    function flashLiquidateTroves() external onlyOwner {}

    function withdraw(address token, uint256 amount) external onlyOwner {
        if (token == TOKEN_ETH) {
            (bool success, ) = msg.sender.call{value: amount}(new bytes(0));
            require(success, "ETH_TRANSFER_FAILED");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }
}
