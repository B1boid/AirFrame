import { BigNumber } from "ethers";
import {
  bigNumToFloat,
  floatToBigNum,
  truncateRightBits,
} from "./";

/* Converts a fixed base token collateral amount to pool liquidity units. This conversion only applies
 * to the current pool price. If price moves the ratio between token collateral and liquidity will also
 * change. Note that this function will only work when token qty or liquidity is less than 2^64

 * @param price The current (non-display) price ratio in the pool.
 * @param qty The quantity (in non-display wei) of base token to convert
 * @return The amount of virtual liquidity (in sqrt(X*Y)) supported by this base token quantity. */
export function liquidityForBaseQty(
  price: number,
  qty: BigNumber,
  mult: number = 1.0
): BigNumber {
  return floatToBigNum(
    Math.floor((bigNumToFloat(qty) / Math.sqrt(price)) * mult)
  );
}

/* Converts a fixed quote token collateral amount to pool liquidity units. This conversion only applies
 * to the current pool price. If price moves the ratio between token collateral and liquidity will also
 * change. Note that this function will only work when token qty or liquidity is less than 2^64
 *
 * @param price The current (non-display) price ratio in the pool.
 * @param qty The quantity (in non-display wei) of quote token to convert
 * @return The amount of virtual liquidity (in sqrt(X*Y)) supported by this quote token quantity. */
export function liquidityForQuoteQty(
  price: number,
  qty: BigNumber,
  mult = 1.0
): BigNumber {
  return floatToBigNum(
    Math.floor(bigNumToFloat(qty) * Math.sqrt(price) * mult)
  );
}

export function baseVirtualReserves(
  price: number,
  liq: BigNumber,
  mult: number = 1.0
): BigNumber {
  return floatToBigNum(bigNumToFloat(liq) * Math.sqrt(price) * mult);
}

export function quoteVirtualReserves(
  price: number,
  liq: BigNumber,
  mult: number = 1.0
): BigNumber {
  return floatToBigNum((bigNumToFloat(liq) / Math.sqrt(price)) * mult);
}

/* Converts a fixed amount of base token deposits to liquidity for a concentrated range order
 *
 * @param price The current (non-display) price ratio in the pool.
 * @param qty The quantity (in non-display wei) of base token to convert
 * @param lower The lower boundary price of the range order
 * @param upper The upper boundary price of the range order
 * @return The amount of virtual liquidity (in sqrt(X*Y)) supported by this base token quantity. */
export function liquidityForBaseConc(
  price: number,
  qty: BigNumber,
  lower: number,
  upper: number
): BigNumber {
  const concFactor = baseConcFactor(price, lower, upper);
  return liquidityForBaseQty(price, qty, concFactor);
}

/* Converts a fixed amount of quote token deposits to liquidity for a concentrated range order
 *
 * @param price The current (non-display) price ratio in the pool.
 * @param qty The quantity (in non-display wei) of base token to convert
 * @param lower The lower boundary price of the range order
 * @param upper The upper boudnary price of the range order
 * @return The amount of virtual liquidity (in sqrt(X*Y)) supported by this quote token quantity. */
export function liquidityForQuoteConc(
  price: number,
  qty: BigNumber,
  lower: number,
  upper: number
): BigNumber {
  const concFactor = quoteConcFactor(price, lower, upper);
  return liquidityForQuoteQty(price, qty, concFactor);
}

export function baseTokenForConcLiq(
  price: number,
  liq: BigNumber,
  lower: number,
  upper: number
): BigNumber {
  const concFactor = baseConcFactor(price, lower, upper);
  return baseVirtualReserves(price, liq, 1 / concFactor);
}

export function quoteTokenForConcLiq(
  price: number,
  liq: BigNumber,
  lower: number,
  upper: number
): BigNumber {
  const concFactor = quoteConcFactor(price, lower, upper);
  return quoteVirtualReserves(price, liq, 1 / concFactor);
}

export function baseTokenForQuoteConc (baseQty: number, 
  lower: number, upper: number): number {
  const growth = Math.sqrt(upper/lower) - 1
  const virtBase = baseQty / growth;
  const virtQuote = virtBase / lower
  return virtQuote * (1 / (1 - growth) - 1)
}

export function quoteTokenForBaseConc (quoteQty: number, 
  lower: number, upper: number): number {
  return baseTokenForQuoteConc(quoteQty, 1/upper, 1/lower)
}

/* Calculates the concentration leverage factor for the base token given the range relative to
 * the current price in the pool.
 *
 * @param price The current price of the pool
 * @param lower The lower price boundary of the range order
 * @param upper The upper price boundary of the range order
 * @return The fraction of base tokens needed relative to an ambient position with the same
 *         liquidity */
export function baseConcFactor(
  price: number,
  lower: number,
  upper: number
): number {
  if (price < lower) {
    return Infinity;
  } else if (price > upper) {
    return Math.sqrt(price) / (Math.sqrt(upper) - Math.sqrt(lower));
  } else {
    return 1 / (1 - Math.sqrt(lower) / Math.sqrt(price));
  }
}

/* Calculates the concentration leverage factor for the quote token given the range relative to
 * the current price in the pool.
 *
 * @param price The current price of the pool
 * @param lower The lower price boundary of the range order
 * @param upper The upper price boundary of the range order
 * @return The fraction of quote tokens needed relative to an ambient position with the same
 *         liquidity */
export function quoteConcFactor(
  price: number,
  lower: number,
  upper: number
): number {
  return baseConcFactor(1 / price, 1 / upper, 1 / lower);
}

/* Calculates the deposit ratio multiplier for a concentrated liquidity range order.
 *
 * @param price The current price of the pool
 * @param lower The lower price boundary of the range order
 * @param upper The upper price boundary of the range order
 * @return The ratio of base to quote token deposit amounts for this concentrated range
 *         order *relative* to full-range ambient deposit ratio. */
export function concDepositSkew(
  price: number,
  lower: number,
  upper: number
): number {
  const base = baseConcFactor(price, lower, upper);
  const quote = quoteConcFactor(price, lower, upper);

  return quote / base;
}

export function concDepositBalance(
  price: number,
  lower: number,
  upper: number
): number {
const base = baseConcFactor(price, lower, upper);
const quote = quoteConcFactor(price, lower, upper);

return quote / (base + quote);
}

export function capitalConcFactor(
  price: number,
  lower: number,
  upper: number
): number {
  const base = 1 / baseConcFactor(price, lower, upper);
  const quote = 1 / quoteConcFactor(price, lower, upper);
  return 1 / ((base + quote) / 2.0)
}




/* Rounds a liquidity magnitude to a multiple that can be used inside the protocol. */
export function roundForConcLiq(liq: BigNumber): BigNumber {
  const CONC_LOTS_BITS = 11;
  return truncateRightBits(liq, CONC_LOTS_BITS);
}
