import path from "path";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.join(__dirname, "..", "..", "..", ".env"),
  });
}

import { ethers, BigNumber } from "ethers";
import { addresses } from "@buynance2/shared";

// const Tokens = addresses.BSC.Tokens;
// const Contracts = addresses.BSC.Contracts;
const Tokens = addresses.ETH.Tokens;
const Contracts = addresses.ETH.Contracts;

const PriceFeedsBSC_abi = require("@buynance2/ref_contracts/abi/PriceFeeds_BSC.json");
const LoanMaintenance_abi = require("@buynance2/ref_contracts/abi/LoanMaintenance.json");
const LoanClosings_abi = require("@buynance2/ref_contracts/abi/LoanClosings.json");
const BZXProtocol_abi = require("@buynance2/ref_contracts/abi/IBZx.json");

const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
// const PriceFeedReadOnly = new ethers.Contract(
//   Contracts.BZXPriceFeeds,
//   PriceFeedsBSC_abi,
//   provider
// );
const LoanMaintenanceReadOnly = new ethers.Contract(
  Contracts.BZXProtocol,
  LoanMaintenance_abi,
  provider
);
const BZXProtocolReadOnly = new ethers.Contract(
  Contracts.BZXProtocol,
  BZXProtocol_abi,
  provider
);
const LoanClosingsSigner = new ethers.Contract(
  Contracts.BZXProtocol,
  LoanClosings_abi,
  wallet
);

function getKeyByValue(object: any, value: string) {
  return Object.keys(object).find(
    (key) => object[key].toLowerCase() === value.toLowerCase()
  );
}

async function main() {
  // let temp = await BZXProtocolReadOnly.getLoanPoolsList(0, 50);
  // console.log(temp);
  // return;
  // ---
  // let response = await PriceFeedReadOnly.pricesFeeds(BBTC_address);
  // let response = await BZXProtocolReadOnly.getActiveLoansCount();
  // console.log(ethers.utils.formatUnits(response, "wei"));
  // return;
  // let response = await LoanMaintenanceReadOnly.getActiveLoans(200, 100, true);
  let loan = await LoanMaintenanceReadOnly.getLoan(
    "0xbfc95b8ee33c68ed2cede3b1b865878ebf2d02e079e423389be3d9d3a2805283"
  );
  const response = [loan];
  console.log(response);
  // BSC $50 possible liquidation? 0x2670368b4f6326d7bf158473055a9ab32607046dc85062f18a439d519f937ebd
  // ETH $2000 possible? 0x3acfc7c3796c1cb56e792344f81ff2794a10a57180731e14f2122df33469c8ad
  // BZRX DAI $9000?? 0x1564a6644c078cd1f86a94e90412d39967bf0b2fcaa3bd30abf7f48987271ae2
  // BZXRX DAI $3909?? 0x106fe995252b2a9d11c4dfd3217f80b20f4dbfc40a20bd31a983b931e4b3e095
  // Liquidatable DAI: 0xbfc95b8ee33c68ed2cede3b1b865878ebf2d02e079e423389be3d9d3a2805283 $891
  // console.log(response);

  for (const loan of response) {
    const date = new Date(
      parseInt(ethers.utils.formatUnits(loan.endTimestamp, "wei")) * 1000
    );
    console.log(`==> Loan ID ${loan.loanId}`);
    console.log(`timestamp ${date.toDateString()}`);
    const collateralTokenName = getKeyByValue(Tokens, loan.collateralToken);
    console.log(loan.collateralToken);
    const loanTokenName = getKeyByValue(Tokens, loan.loanToken);
    console.log(loan.loanToken);
    console.log(
      `Coll: ${collateralTokenName} || Amount: ${ethers.utils.formatEther(
        loan.collateral
      )}`
    );
    console.log(
      `Loan: ${loanTokenName} || Amount: ${ethers.utils.formatEther(
        loan.principal
      )}`
    );
    console.log(
      `Liquidatable ${loanTokenName}: ${ethers.utils.formatEther(
        loan.maxLiquidatable
      )}`
    );
  }

  // let response = await LoanClosingsSigner.liquidate(
  //   "0xd4292d506736ed8c72cf03c5e9034331ae90b04703f48511f21f0d2325a4a1ce",
  //   "0x53860B7272A63E09459418092AE892c778F0a1bB",
  //   loanAmount
  // );
}

main();
