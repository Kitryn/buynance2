import path from "path";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.join(__dirname, "..", "..", "..", ".env"),
  });
}

import { ethers } from "ethers";
import { CONTRACT_ADDRESSES_MAINNET } from "./lib/constants";
const TroveManagerABI = require("./abi/TroveManager.json");
const WETHABI = require("./abi/WETH9.json");

// const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_URL);
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function main() {
  // console.log(
  //   await provider.getBalance("0x53860B7272A63E09459418092AE892c778F0a1bB")
  // );
  // const TroveManagerContract = new ethers.Contract(
  //   CONTRACT_ADDRESSES_MAINNET.TroveManager,
  //   TroveManagerABI,
  //   provider
  // );
  // const result = await TroveManagerContract.callStatic.liquidateTroves(1);
  // console.log(result);

  let overrides = {
    from: "0x53860B7272A63E09459418092AE892c778F0a1bB",
    value: ethers.utils.parseEther("0.1"),
  };
  const WETHContract = new ethers.Contract(WETH_ADDRESS, WETHABI, provider);
  const result = await WETHContract.populateTransaction.deposit(overrides);
  console.log(result);
  // const response = await provider.send("debug_traceCall", [result]);
  const response = await provider.getGasPrice();
  console.log(ethers.utils.formatUnits(response, "gwei"));
}

main();

//On every block:
//Fetch lastGoodPrice?
//If lastGoodPrice < storedLiqPrice
//    Send readonly liquidate transaction
//    If fail: sleep until next block
//    If successful:
//        send a liquidate transaction
