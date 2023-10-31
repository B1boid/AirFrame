import { BigNumber } from 'ethers';

export const sum = (a: number, b: number): number => {
  return a + b;
};

export function toFixedNumber(num: number, digits: number, base?: number) {
  const pow = Math.pow(base || 10, digits);
  return Math.round(num * pow) / pow;
}

export function bigNumToFloat (val: BigNumber): number {
  return val.lt(Number.MAX_SAFE_INTEGER - 1)
    ? val.toNumber()
    : parseFloat(val.toString());
}

export function floatToBigNum (x: number): BigNumber {
  let floatPrice = x
  let scale = 0;

  const PRECISION_BITS = 16;
  while (floatPrice > Number.MAX_SAFE_INTEGER) {
    floatPrice = floatPrice / (2 ** PRECISION_BITS);
    scale = scale + PRECISION_BITS;
  }

  const pinPrice = Math.round(floatPrice);
  const mult = BigNumber.from(2).pow(scale)
  return BigNumber.from(pinPrice).mul(mult);
}

export function truncateRightBits (x: BigNumber, bits: number): BigNumber {
  const mult = BigNumber.from(2).pow(bits)
  return x.div(mult).mul(mult)
}

export function fromFixedGrowth (x: BigNumber): number {
  return 1 + bigNumToFloat(x) / (2 ** 48)
}