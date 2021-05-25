import { ethers, BigNumber } from "ethers";

export function computeCR(
  debt: BigNumber,
  coll: BigNumber,
  price: BigNumber
): BigNumber {
  if (debt.gt(ethers.BigNumber.from(0))) {
    return coll.mul(price).div(debt);
  }
  return ethers.constants.MaxUint256;
}

export function computeLiquidationPrice(
  debt: BigNumber,
  coll: BigNumber,
  crThreshold: BigNumber
): BigNumber {
  if (coll.gt(ethers.BigNumber.from(0))) {
    return crThreshold.mul(debt).div(coll);
  }
  return ethers.constants.Zero;
}

export function isLiquidatable(
  currentCR: BigNumber,
  minCR: BigNumber
): boolean {
  return currentCR.lt(minCR);
}
