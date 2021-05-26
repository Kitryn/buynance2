import path from "path";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.join(__dirname, "..", "..", "..", ".env"),
  });
}

import { ethers, BigNumber } from "ethers";
import { CONTRACT_ADDRESSES_MAINNET } from "./lib/constants";
import { computeCR, computeLiquidationPrice } from "./lib/LiquidityMath";
import { promisify } from "util";
const sleep = promisify(setTimeout);
const TroveManagerABI = require("./abi/TroveManager.json");
const PriceFeedABI = require("./abi/PriceFeed.json");
const SortedTrovesABI = require("./abi/SortedTroves.json");
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
// const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_URL);
// const provider = new ethers.providers.WebSocketProvider(
//   process.env.INFURA_WSS_URL ?? ""
// );
// const provider = new ethers.providers.WebSocketProvider(
//   process.env.GANACHE_WSS_URL ?? ""
// );
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
const TroveManagerReadOnly = new ethers.Contract(
  CONTRACT_ADDRESSES_MAINNET.TroveManager,
  TroveManagerABI,
  provider
);
const TroveManagerSigner = new ethers.Contract(
  CONTRACT_ADDRESSES_MAINNET.TroveManager,
  TroveManagerABI,
  wallet
);
const PriceFeedReadOnly = new ethers.Contract(
  CONTRACT_ADDRESSES_MAINNET.PriceFeed,
  PriceFeedABI,
  provider
);
const SortedTrovesReadOnly = new ethers.Contract(
  CONTRACT_ADDRESSES_MAINNET.SortedTroves,
  SortedTrovesABI,
  provider
);
const NormalModeCR = ethers.utils.parseEther("1.1");
const RecoveryModeCR = ethers.utils.parseEther("1.5");

async function main() {
  let lastGoodPrice: BigNumber;
  let totalSystemCR: BigNumber;
  let liquidatee: string;
  let liquidateeDebt: BigNumber;
  let liquidateeColl: BigNumber;
  let liquidationPrice: BigNumber;

  let iterations: number = 0;
  let cachedBlockNumber: number;

  provider.on("block", async (blockNumber) => {
    console.log(`Iteration ${iterations++}: block ${blockNumber}`);
    cachedBlockNumber = blockNumber;

    try {
      [lastGoodPrice, liquidatee] = await Promise.all([
        PriceFeedReadOnly.lastGoodPrice(),
        SortedTrovesReadOnly.getLast(),
      ]);

      let _temp: any;
      [totalSystemCR, _temp] = await Promise.all([
        TroveManagerReadOnly.getTCR(lastGoodPrice),
        TroveManagerReadOnly.getEntireDebtAndColl(liquidatee),
      ]);
      [liquidateeDebt, liquidateeColl] = [_temp.debt, _temp.coll];
    } catch (e) {
      console.error("Error in web3 request!");
      console.error(e);
      return;
    }

    liquidationPrice = computeLiquidationPrice(
      liquidateeDebt,
      liquidateeColl,
      totalSystemCR.gt(RecoveryModeCR) ? NormalModeCR : RecoveryModeCR
    );

    if (blockNumber !== cachedBlockNumber) {
      console.log(
        `Working block ${blockNumber}: A new block (${cachedBlockNumber}) was already mined, aborting!`
      );
      return;
    }

    console.log(
      `Current price: ${ethers.utils.formatUnits(
        lastGoodPrice,
        "ether"
      )}. Next liq price: ${ethers.utils.formatUnits(
        liquidationPrice,
        "ether"
      )}`
    );
    if (lastGoodPrice.lt(liquidationPrice)) {
      // Time to liquidate
      let _: BigNumber = await provider.getGasPrice();
      let gasPrice = _.add(_.div(ethers.BigNumber.from("3")));
      console.log(
        `Liquidating! Using gas price of ${ethers.utils.formatUnits(
          gasPrice,
          "gwei"
        )} gwei`
      );
      const overrides = {
        gasPrice: gasPrice,
      };
      const result = await TroveManagerSigner.liquidateTroves(1, overrides);
      console.log(result);
      process.exit(0);
    }
  });

  while (true) {
    await sleep(10000);
  }
}

//On every block:
//Fetch lastGoodPrice?
//If lastGoodPrice < storedLiqPrice
//    Send readonly liquidate transaction
//    If fail: sleep until next block
//    If successful:
//        send a liquidate transaction
// get gas price
// add a bit and send?

main();
