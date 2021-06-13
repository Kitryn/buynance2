import path from "path";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.join(__dirname, "..", "..", "..", ".env"),
  });
}

import { ethers, BigNumber } from "ethers";
const BOSS_address = "0x041771CBdd2538807d4b09Ca3712008265932aB0";
const BOSS_abi = require("./abi/boss.json");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.POLYGON_URL
  );
  const bossContract = new ethers.Contract(BOSS_address, BOSS_abi, provider);
  const bal = await provider.getBalance(BOSS_address);
  console.log(ethers.utils.formatEther(bal));
}

main();
