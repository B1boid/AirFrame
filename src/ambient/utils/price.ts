import { BigNumber } from "ethers";
import { MIN_TICK, MAX_TICK } from "../constants";

type Tick = number;

export function encodeCrocPrice(price: number): BigNumber {
  let floatPrice = Math.sqrt(price) * 2 ** 64;
  let scale = 0;

  const PRECISION_BITS = 16;
  while (floatPrice > Number.MAX_SAFE_INTEGER) {
    floatPrice = floatPrice / 2 ** PRECISION_BITS;
    scale = scale + PRECISION_BITS;
  }

  const pinPrice = Math.round(floatPrice);
  const bnSeed = BigNumber.from(pinPrice);

  return bnSeed.mul(BigNumber.from(2).pow(scale));
}

export function decodeCrocPrice(val: BigNumber) {
  const x = val.lt(Number.MAX_SAFE_INTEGER - 1)
    ? val.toNumber()
    : parseFloat(val.toString());
  const sq = x / 2 ** 64;
  return sq * sq;
}

export function toDisplayPrice(
  price: number,
  baseDecimals: number,
  quoteDecimals: number,
  isInverted = false
): number {
  const scaled = price * Math.pow(10, quoteDecimals - baseDecimals)
  return isInverted ? 1 / scaled : scaled
}

export function fromDisplayPrice(
  price: number,
  baseDecimals: number,
  quoteDecimals: number,
  isInverted = false
): number {
  const scaled = isInverted ? 1 / price : price
  return scaled * Math.pow(10, baseDecimals - quoteDecimals)
}

export function pinTickLower(
  price: number,
  nTicksGrid: number): Tick {
  const priceInTicks = Math.log(price) / Math.log(1.0001);
  const tickGrid = Math.floor(priceInTicks / nTicksGrid) * nTicksGrid;
  const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
  return Math.max(tickGrid, horizon);
}

export function priceHalfBelowTick(
  tick: number,
  nTicksGrid: number): Tick {
  const halfTickBelow = (tick - (.5 * nTicksGrid))
  return Math.pow(1.0001, halfTickBelow);
}
  
export function pinTickUpper(
  price: number,
  nTicksGrid: number): Tick {
  const priceInTicks = priceToTick(price)
  const tickGrid = Math.ceil(priceInTicks / nTicksGrid) * nTicksGrid;
  const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
  return Math.min(tickGrid, horizon);
}


/* Returns the closest on-grid tick tick that's to the outside of a given price
 * relative to a pool price. */
export function pinTickOutside(
  price: number,
  poolPrice: number,
  nTicksGrid: number): { tick: Tick, isTickBelow: boolean } {

  const priceInTicks = priceToTick(price)
  const poolInTicks = priceToTick(poolPrice)
  const [poolLower, poolUpper] = 
    [pinTickLower(poolPrice, nTicksGrid), pinTickUpper(poolPrice, nTicksGrid)]

  if (priceInTicks < poolInTicks) {
    if (priceInTicks >= poolLower) {
      return { tick: poolLower - nTicksGrid, isTickBelow: true }
    } else {
      return { tick: pinTickLower(price, nTicksGrid), isTickBelow: true }
    }
    
  } else {
    if (priceInTicks <= poolUpper) {
      return { tick: poolUpper + nTicksGrid, isTickBelow: false }
    } else {
      return { tick: pinTickUpper(price, nTicksGrid), isTickBelow: false }
    }
  }
}


/* Returns the neighboring N on-grid ticks to a given price. Ticks will be
 * sorted from closest to furthers */
export function neighborTicks (price: number, nTicksGrid: number, 
  nNeighbors: number = 1): {
  below: number[], above: number[] } {
  const priceInTicks = pinTickLower(price, nTicksGrid)

  return { 
    below: Array.from({length: nNeighbors}).
      map((_, idx: number) => priceInTicks - idx * nTicksGrid),
    above: Array.from({length: nNeighbors}).
      map((_, idx: number) => priceInTicks + (idx + 1) * nTicksGrid)
  }
}

export function priceToTick (price: number): Tick {
  return Math.floor(Math.log(price) / Math.log(1.0001))
}
  
export function tickToPrice(tick: Tick): number {
  return Math.pow(1.0001, tick);
}
  
export function priceHalfAboveTick(
  tick: number,
  nTicksGrid: number): Tick {
  const halfTickAbove = (tick + (.5 * nTicksGrid))
  return Math.pow(1.0001, halfTickAbove);
  }

/* Returns the ratio of quote to base tokens necessary to support the collateral for a given
 * range order over the specified ticks. If no quote token collateral is required returns 0
 * if no base token collateral is required returns Infinity */
export function calcRangeTilt(
  mktPrice: number,
  lowerTick: Tick,
  upperTick: Tick
): number {
  const lowerPrice = tickToPrice(lowerTick);
  const upperPrice = tickToPrice(upperTick);

  if (mktPrice > upperPrice) {
    return Infinity;
  } else if (mktPrice < lowerPrice) {
    return 0;
  } else {
    const basePartial = Math.sqrt(lowerPrice / mktPrice);
    const quotePartial = Math.sqrt(mktPrice / upperPrice);
    return quotePartial / basePartial;
  }
}
