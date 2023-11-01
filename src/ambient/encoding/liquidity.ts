import { BigNumber, ethers } from "ethers";
import { MAX_LIQ } from "../constants";
import { encodeCrocPrice } from "../utils/price";
import { AddressZero } from "@ethersproject/constants";

type Address = string;
type PoolType = number;

export class WarmPathEncoder {
  constructor(base: Address, quote: Address, poolIdx: PoolType) {
    this.base = base;
    this.quote = quote;
    this.poolIdx = poolIdx;
    this.abiCoder = new ethers.utils.AbiCoder();
  }

  private base: Address;
  private quote: Address;
  private poolIdx: PoolType;
  private abiCoder: ethers.utils.AbiCoder;

  encodeMintConc(
    lowerTick: number,
    upperTick: number,
    qty: BigNumber,
    qtyIsBase: boolean,
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ) {
    return this.encodeWarmPath(
      qtyIsBase ? MINT_CONC_BASE : MINT_CONC_QUOTE,
      lowerTick,
      upperTick,
      qty,
      limitLow,
      limitHigh,
      useSurplus
    );
  }

  encodeBurnConc(
    lowerTick: number,
    upperTick: number,
    liq: BigNumber,
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ) {
    return this.encodeWarmPath(
      BURN_CONCENTRATED,
      lowerTick,
      upperTick,
      liq,
      limitLow,
      limitHigh,
      useSurplus
    );
  }

  encodeHarvestConc(
    lowerTick: number,
    upperTick: number,
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ) {
    return this.encodeWarmPath(
      HARVEST_CONCENTRATED,
      lowerTick,
      upperTick,
      BigNumber.from(0),
      limitLow,
      limitHigh,
      useSurplus
    );
  }

  encodeMintAmbient(
    qty: BigNumber,
    qtyIsBase: boolean,
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ) {
    return this.encodeWarmPath(
      qtyIsBase ? MINT_AMBIENT_BASE : MINT_AMBIENT_QUOTE,
      0,
      0,
      qty,
      limitLow,
      limitHigh,
      useSurplus
    );
  }

  encodeBurnAmbient(
    liq: BigNumber,
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ) {
    return this.encodeWarmPath(
      BURN_AMBIENT,
      0,
      0,
      liq,
      limitLow,
      limitHigh,
      useSurplus
    );
  }

  encodeBurnAmbientAll(
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ) {
    return this.encodeWarmPath(
      BURN_AMBIENT,
      0,
      0,
      MAX_LIQ,
      limitLow,
      limitHigh,
      useSurplus
    );
  }

  private encodeWarmPath(
    callCode: number,
    lowerTick: number,
    upperTick: number,
    qty: BigNumber,
    limitLow: number,
    limitHigh: number,
    useSurplus: number
  ): string {
    return this.abiCoder.encode(WARM_ARG_TYPES, [
      callCode,
      this.base,
      this.quote,
      this.poolIdx,
      lowerTick,
      upperTick,
      qty,
      encodeCrocPrice(limitLow),
      encodeCrocPrice(limitHigh),
      useSurplus,
      AddressZero,
    ]);
  }
}

const MINT_CONCENTRATED: number = 1;
const MINT_CONC_BASE: number = 11;
const MINT_CONC_QUOTE: number = 12
const BURN_CONCENTRATED: number = 2;
const MINT_AMBIENT: number = 3;
const MINT_AMBIENT_BASE: number = 31;
const MINT_AMBIENT_QUOTE: number = 32;
const BURN_AMBIENT: number = 4;
const HARVEST_CONCENTRATED: number = 5

const WARM_ARG_TYPES = [
  "uint8", // Type call
  "address", // Base
  "address", // Quote
  "uint24", // Pool Index
  "int24", // Lower Tick
  "int24", // Upper Tick
  "uint128", // Liquidity
  "uint128", // Lower limit
  "uint128", // Upper limit
  "uint8", // reserve flags
  "address", // deposit vault
];

export function isTradeWarmCall(txData: string): boolean {
  const USER_CMD_METHOD = "0xa15112f9";
  const LIQ_PATH = 2
  const encoder = new ethers.utils.AbiCoder();

  if (txData.slice(0, 10) === USER_CMD_METHOD) {
    const result = encoder.decode(
      ["uint16", "bytes"],
      "0x".concat(txData.slice(10))
    );
    return result[0] == LIQ_PATH;
  }
  return false;
}

interface WarmPathArgs {
  isMint: boolean;
  isAmbient: boolean;
  base: string;
  quote: string;
  poolIdx: number;
  lowerTick: number;
  upperTick: number;
  qty: BigNumber;
}

export function decodeWarmPathCall(txData: string): WarmPathArgs {
  const argData = "0x".concat(txData.slice(10 + 192));
  const encoder = new ethers.utils.AbiCoder();
  const result = encoder.decode(WARM_ARG_TYPES, argData);
  return {
    isMint: [MINT_AMBIENT, MINT_CONCENTRATED].includes(result[0]),
    isAmbient: [MINT_AMBIENT, BURN_AMBIENT].includes(result[0]),
    base: result[1],
    quote: result[2],
    poolIdx: result[3],
    lowerTick: result[4],
    upperTick: result[5],
    qty: result[6],
  };
}
