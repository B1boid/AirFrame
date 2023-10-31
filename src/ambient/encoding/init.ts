import { ethers } from "ethers";
import { encodeCrocPrice } from "../utils/price";

type Address = string;
type PoolType = number;

export class PoolInitEncoder {

  constructor (baseToken: Address, quoteToken: Address, poolIdx: PoolType) {
    this.baseToken = baseToken
    this.quoteToken = quoteToken
    this.poolIdx = poolIdx
    this.abiCoder = new ethers.utils.AbiCoder();
  }

  encodeInitialize (initPrice: number): string {
    const crocPrice = encodeCrocPrice(initPrice)
    const POOL_INIT_TYPES = ["uint8", "address", "address", "uint256", "uint128"]
    return this.abiCoder.encode(POOL_INIT_TYPES,
      [71, this.baseToken, this.quoteToken, this.poolIdx, crocPrice])
  }

  private baseToken: Address
  private quoteToken: Address
  private poolIdx: PoolType
  private abiCoder: ethers.utils.AbiCoder;
}