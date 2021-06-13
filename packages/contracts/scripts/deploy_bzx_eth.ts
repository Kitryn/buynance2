import { run, ethers, network, tenderly } from "hardhat";

async function main() {
  const walletAdd = "0x53860B7272A63E09459418092AE892c778F0a1bB";
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [walletAdd],
  });
  const signer = await ethers.getSigner(walletAdd);

  const liquiContract = await ethers.getContractFactory(
    "BzxLiquidationEth",
    signer
  );
  const aaveLendingPoolAddress_eth =
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
  const DAIAddress_eth = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const WETHAddress_eth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const DAIInstance = await ethers.getContractAt("IERC20", DAIAddress_eth);
  const WETHInstance = await ethers.getContractAt("IERC20", WETHAddress_eth);

  const liquideploy = await liquiContract.deploy(aaveLendingPoolAddress_eth);
  await liquideploy.deployed();
  console.log(`Contract deployed to: ${liquideploy.address}`);

  let ETHBal = await ethers.provider.getBalance(walletAdd);
  let WETHBal = await WETHInstance.balanceOf(walletAdd);
  let DAIBal = await DAIInstance.balanceOf(walletAdd);
  console.log(`ETH Bal: ${ethers.utils.formatEther(ETHBal)}`);
  console.log(`WETH Bal: ${ethers.utils.formatEther(WETHBal)}`);
  console.log(`DAI Bal: ${ethers.utils.formatEther(DAIBal)}`);
  console.log(`Expected coll: 0.778 weth, expected debt: 1904 DAI`);

  console.log("Running liquidate!");
  const liquiInstance = liquiContract.attach(liquideploy.address);

  const unsignedTx = await liquiInstance.populateTransaction.liquidate(
    DAIAddress_eth,
    ethers.BigNumber.from("1904457754787135663818"),
    "0xbfc95b8ee33c68ed2cede3b1b865878ebf2d02e079e423389be3d9d3a2805283",
    { gasPrice: ethers.utils.parseUnits("30", "gwei"), gasLimit: 1000000 }
  );
  const response = await signer.sendTransaction(unsignedTx);
  // const response = await liquiInstance.liquidate(
  //   DAIAddress_eth,
  //   ethers.BigNumber.from("1904457754787135663818"),
  //   "0xbfc95b8ee33c68ed2cede3b1b865878ebf2d02e079e423389be3d9d3a2805283"
  // );

  console.log(response);

  ETHBal = await ethers.provider.getBalance(walletAdd);
  WETHBal = await WETHInstance.balanceOf(walletAdd);
  DAIBal = await DAIInstance.balanceOf(walletAdd);
  console.log(`ETH Bal: ${ethers.utils.formatEther(ETHBal)}`);
  console.log(`WETH Bal: ${ethers.utils.formatEther(WETHBal)}`);
  console.log(`DAI Bal: ${ethers.utils.formatEther(DAIBal)}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
