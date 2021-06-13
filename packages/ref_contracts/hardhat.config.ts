/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-abi-exporter";

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
    hardhat: {},
  },
  solidity: {
    compilers: [
      {
        version: "0.5.17",
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
      },
      {
        version: "0.8.4",
      },
    ],
    overrides: {
      "contracts/aaveProtocol/flashloan/base/FlashLoanReceiverBase.sol": {
        version: "0.6.12",
        settings: {},
      },
      "contracts/aaveProtocol/dependencies/openzeppelin/contracts/Ownable.sol":
        {
          version: "0.6.12",
          settings: {},
        },
      "contracts/aaveProtocol/dependencies/openzeppelin/contracts/Context.sol":
        {
          version: "0.6.12",
          settings: {},
        },
    },
  },
  abiExporter: {
    path: "./abi",
    clear: true,
    flat: true,
  },
};

export default config;
