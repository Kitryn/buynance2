import path from "path";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.join(__dirname, "..", "..", "..", ".env"),
  });
}

import { ethers, BigNumber } from "ethers";
import { addresses } from "@buynance2/shared";

const PriceFeedsBSC_abi = require("@buynance2/bzx_contracts/abi/PriceFeeds_BSC.json");
const LoanMaintenance_abi = require("@buynance2/bzx_contracts/abi/LoanMaintenance.json");
const LoanClosings_abi = require("@buynance2/bzx_contracts/abi/LoanClosings.json");

const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
const PriceFeedReadOnly = new ethers.Contract(
  addresses.BSC.Contracts.BZXPriceFeeds,
  PriceFeedsBSC_abi,
  provider
);
const LoanMaintenanceReadOnly = new ethers.Contract(
  addresses.BSC.Contracts.BZXProtocol,
  LoanMaintenance_abi,
  provider
);

const LoanClosingsSigner = new ethers.Contract(
  addresses.BSC.Contracts.BZXProtocol,
  LoanClosings_abi,
  wallet
);

async function main() {
  // let response = await PriceFeedReadOnly.pricesFeeds(BBTC_address);
  // let response = await LoanMaintenanceReadOnly.getActiveLoansCount();
  let response = await LoanMaintenanceReadOnly.getActiveLoans(0, 20, true);
  // let loan = await LoanMaintenanceReadOnly.getLoan(
  //   "0x768bdc8919ca69aba498f48fca58278cafd61c49efe6765a9b08b739aea80b35"
  // );
  console.log(response);

  for (const loan of response) {
    let loanAmount = loan.maxLiquidatable;
    console.log(loan.loanId);
    console.log(ethers.utils.formatUnits(loanAmount, "wei"));
  }

  // let response = await LoanClosingsSigner.liquidate(
  //   "0xd4292d506736ed8c72cf03c5e9034331ae90b04703f48511f21f0d2325a4a1ce",
  //   "0x53860B7272A63E09459418092AE892c778F0a1bB",
  //   loanAmount
  // );
}

main();
