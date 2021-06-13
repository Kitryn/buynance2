import path from "path";
import findWorkspaceRoot from "find-yarn-workspace-root";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.join(findWorkspaceRoot(__dirname) ?? ".", ".env"),
  });
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@tenderly/hardhat-tenderly";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/UOUa_zJwdb5ZxH3f2SL3PC-hgtcj_o0s",
      },
      throwOnTransactionFailures: false,
    },
    local: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      timeout: 80000,
      throwOnTransactionFailures: false,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  tenderly: {
    username: process.env.USERNAME ?? "",
    project: "project",
  },
};

export default config;
