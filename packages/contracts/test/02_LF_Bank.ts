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

describe("Bank functions on Liquiflash", async () => {
  let TokenContract: ContractFactory;
  let TokenInstance: Contract;
  let LiquiContract: ContractFactory;
  let LiquiInstance: Contract;

  beforeEach(async () => {
    TokenContract = await ethers.getContractFactory("TestERC20");
    TokenInstance = await TokenContract.deploy();

    const overrides = {
      value: ethers.utils.parseEther("1"),
    };

    LiquiContract = await ethers.getContractFactory("Liquiflash");
    LiquiInstance = await LiquiContract.deploy(ETH_ADDRESS, overrides);
  });

  it("Should not have a token balance", async () => {
    const tokenBal = await TokenInstance.balanceOf(LiquiInstance.address);
    expect(tokenBal).to.equal(ethers.utils.parseEther("0"));
  });

  it("Should have a balance of 1 eth", async () => {
    const contractBal = await ethers.provider.getBalance(LiquiInstance.address);
    expect(contractBal).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should receive 1.0 token from owner", async () => {
    await TokenInstance.transfer(
      LiquiInstance.address,
      ethers.utils.parseEther("1")
    );
    const tokenBal = await TokenInstance.balanceOf(LiquiInstance.address);
    expect(tokenBal).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should withdraw 1.0 token from contract to owner", async () => {
    const tokenBal = await TokenInstance.balanceOf(LiquiInstance.address);
    expect(tokenBal).to.equal(ethers.utils.parseEther("0"));

    await TokenInstance.transfer(
      LiquiInstance.address,
      ethers.utils.parseEther("1")
    );
    const tokenBal2 = await TokenInstance.balanceOf(LiquiInstance.address);
    expect(tokenBal2).to.equal(ethers.utils.parseEther("1"));

    const ownerBal: BigNumber = await TokenInstance.balanceOf(
      await owner.getAddress()
    );
    await LiquiInstance.withdraw(
      TokenInstance.address,
      ethers.utils.parseEther("1")
    );

    const ownerBal2 = await TokenInstance.balanceOf(await owner.getAddress());

    expect(ownerBal2).to.equal(ownerBal.add(ethers.utils.parseEther("1")));
    const tokenBal3 = await TokenInstance.balanceOf(LiquiInstance.address);
    expect(tokenBal3).to.equal(ethers.utils.parseEther("0"));
  });

  it("Should withdraw 1 ETH to owner", async () => {
    const overrides = {
      gasPrice: ethers.utils.parseEther("0"),
    };
    const ownerBal: BigNumber = await owner.getBalance();
    await LiquiInstance.withdraw(
      ETH_ADDRESS,
      ethers.utils.parseEther("1"),
      overrides
    );
    const ownerBal2 = await owner.getBalance();

    expect(ownerBal2).to.equal(ownerBal.add(ethers.utils.parseEther("1")));
    expect(await ethers.provider.getBalance(LiquiInstance.address)).to.equal(
      ethers.utils.parseEther("0")
    );
  });
});
