// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./aave/FlashLoanReceiverBase.sol";
import "./aave/ILendingPoolAddressesProvider.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

interface IBZx {
    function liquidate(
        bytes32 loanId,
        address receiver,
        uint256 closeAmount
    )
        external
        payable
        returns (
            uint256 loanCloseAmount,
            uint256 seizedAmount,
            address seizedToken
        );
}

contract BzxLiquidationEth is FlashLoanReceiverBase, Ownable {
    using SafeMath for uint256;
    IBZx internal constant bzxProtocol =
        IBZx(0xD8Ee69652E4e4838f2531732a46d1f7F584F0b7f);
    IUniswapV2Router02 internal constant sushiswap =
        IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    constructor(ILendingPoolAddressesProvider _addressProvider)
        FlashLoanReceiverBase(_addressProvider)
    {}

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(LENDING_POOL), "Invalid caller");
        bytes32 loanId = abi.decode(params, (bytes32));

        // Approve bzx to take our tokens to liquidate
        IERC20(assets[0]).approve(address(bzxProtocol), amounts[0]);
        (, , address seizedToken) =
            bzxProtocol.liquidate(loanId, address(this), amounts[0]);

        // swap enough to repay
        // Calc slippage 0.5%
        uint256 amountOut = amounts[0].add(premiums[0]);
        uint256 amountInMax = amountOut.mul(995).div(1000);
        address[] memory path = new address[](2);
        path[0] = seizedToken;
        path[1] = assets[0];
        // Approve router to take our tokens
        IERC20(seizedToken).approve(address(sushiswap), type(uint256).max);
        sushiswap.swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            owner(),
            block.timestamp + 30 minutes
        );

        // approve lendingpool to pull the owed amount
        IERC20(assets[0]).approve(address(LENDING_POOL), amountOut);
        return true;
    }

    function liquidate(
        address tokenToLoan,
        uint256 amountToLoan,
        bytes32 loanId
    ) external onlyOwner {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = tokenToLoan;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amountToLoan;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0; // 0 = no debt, revert if insufficient

        address onBehalfOf = address(this);
        bytes memory params = abi.encode(loanId);
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }
}
