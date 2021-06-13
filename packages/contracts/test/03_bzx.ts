import { ethers } from "hardhat";
import {
  BigNumber,
  Contract,
  ContractFactory,
  ContractReceipt,
  ContractTransaction,
  Signer,
} from "ethers";
import { expect } from "chai";

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

let accounts: Signer[];
let owner: Signer;
let chainId: number;

before(async () => {
  accounts = await ethers.getSigners();
  owner = accounts[0];
  chainId = await owner.getChainId();
});

describe("Deploying BZX liquidation contract", () => {
  let bzxContract: ContractFactory;
  let bzxInstance: Contract;

  beforeEach(async () => {
    bzxContract = await ethers.getContractFactory("BzxLiquidationEth");
    bzxInstance = await bzxContract.deploy(
      "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
    );
  });

  it("Should deploy?", async () => {
    console.log(bzxInstance.address);
  });
});
