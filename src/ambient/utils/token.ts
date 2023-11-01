import { ethers, BigNumber } from "ethers";

export function getBaseTokenAddress(token1: string, token2: string): string {
  let baseTokenAddress = "";

  if (!!token1 && !!token2) {
    const token1BigNum = BigNumber.from(token1);
    const token2BigNum = BigNumber.from(token2);
    // On-chain base token is always the smaller of the two
    baseTokenAddress = token1BigNum.lt(token2BigNum) ? token1 : token2;
  }
  return baseTokenAddress;
}

export function getQuoteTokenAddress(token1: string, token2: string): string {
  let quoteTokenAddress = "";

  if (!!token1 && !!token2) {
    const token1BigNum = BigNumber.from(token1);
    const token2BigNum = BigNumber.from(token2);
    // On-chain quote token is always the larger of the two
    quoteTokenAddress = token1BigNum.gt(token2BigNum) ? token1 : token2;
  }
  return quoteTokenAddress;
}

export function sortBaseQuoteTokens(
  token1: string,
  token2: string
): [string, string] {
  return [
    getBaseTokenAddress(token1, token2),
    getQuoteTokenAddress(token1, token2),
  ];
}

export function fromDisplayQty(qty: string, tokenDecimals: number): BigNumber {
  try {
    // First try to directly parse the string, so there's no loss of precision for
    // long fixed strings.
    return ethers.utils.parseUnits(qty, tokenDecimals);

  } catch {
    // If that fails (e.g. with scientific notation floats), then cast to float and
    // back to fixed string
    const sanitQty = parseFloat(qty).toFixed(tokenDecimals)
    return ethers.utils.parseUnits(sanitQty, tokenDecimals)
  }
}

export function toDisplayQty(
  qty: string | number | BigNumber,
  tokenDecimals: number
): string {

  // formatUnits is temperamental with Javascript numbers, so convert string to
  // fullwide string to avoid scientific notation (which BigNumber pukes on)
  if (typeof(qty) === "number" ) {
    const qtyString = qty.toLocaleString('fullwide', {useGrouping:false})
    return toDisplayQty(qtyString, tokenDecimals)
  }

  return ethers.utils.formatUnits(qty, tokenDecimals);
}
