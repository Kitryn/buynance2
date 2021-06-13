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

let accounts: Signer[];
let owner: Signer;
let chainId: number;

before(async () => {
  accounts = await ethers.getSigners();
  owner = accounts[0];
  chainId = await owner.getChainId();
});

describe("Test infrastructure", async () => {
  let TokenContract: ContractFactory;
  let TokenInstance: Contract;

  before(async () => {
    TokenContract = await ethers.getContractFactory("TestERC20");
    TokenInstance = await TokenContract.deploy();
  });

  it("Should mint and assign total supply of tokens to the owner", async () => {
    const ownerBalance = await TokenInstance.balanceOf(
      await owner.getAddress()
    );
    expect(await TokenInstance.totalSupply()).to.equal(ownerBalance);
  });

  it("Should have 0 balance in another account", async () => {
    const otherBalance = await TokenInstance.balanceOf(
      await accounts[1].getAddress()
    );
    expect(otherBalance).to.equal(ethers.utils.parseEther("0"));
  });

  it("Should transfer from owner to accounts[1]", async () => {
    const response = await TokenInstance.transfer(
      await accounts[1].getAddress(),
      ethers.utils.parseEther("1")
    );

    const otherBalance = await TokenInstance.balanceOf(
      await accounts[1].getAddress()
    );
    expect(otherBalance).to.equal(ethers.utils.parseEther("1"));
  });
});
