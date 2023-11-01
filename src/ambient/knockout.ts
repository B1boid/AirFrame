import { BigNumber } from "ethers";
import { TransactionResponse } from '@ethersproject/providers';
import { CrocContext } from './context';
import { CrocEthView, CrocTokenView, sortBaseQuoteViews, TokenQty } from './tokens';
import { AddressZero } from '@ethersproject/constants';
import { KnockoutEncoder } from "./encoding/knockout";
import { ChainSpec } from "./constants";
import { CrocSurplusFlags, decodeSurplusFlag, encodeSurplusArg } from "./encoding/flags";
import { baseTokenForQuoteConc, bigNumToFloat, floatToBigNum, quoteTokenForBaseConc, roundForConcLiq } from "./utils";


export class CrocKnockoutHandle {

  constructor (sellToken: CrocTokenView, buyToken: CrocTokenView, qty: TokenQty, inSellQty: boolean,
    knockoutTick: number, context: Promise<CrocContext>) {
    [this.baseToken, this.quoteToken] = sortBaseQuoteViews(sellToken, buyToken)
    this.sellBase = (this.baseToken === sellToken)
    this.qtyInBase = inSellQty ? this.sellBase : !this.sellBase

    const tokenView = this.qtyInBase ? this.baseToken : this.quoteToken
    const specQty = tokenView.normQty(qty)

    this.qty = inSellQty ? specQty : 
      calcSellQty(specQty, !this.sellBase, knockoutTick, context)

    this.knockoutTick = knockoutTick
    this.context = context
  }

  async mint (opts?: CrocKnockoutOpts): Promise<TransactionResponse> {
    const chain = (await this.context).chain
    const encoder = new KnockoutEncoder(this.baseToken.tokenAddr, 
      this.quoteToken.tokenAddr, chain.poolIndex)
    const [lowerTick, upperTick] = this.tickRange(chain)
    const surplus = this.maskSurplusFlags(opts)

    const cmd = encoder.encodeKnockoutMint(await this.qty, lowerTick, upperTick, 
      this.sellBase, surplus);
    return (await this.context).dex.userCmd(KNOCKOUT_PATH, cmd, { value: this.msgVal(surplus) })
  }

  async burn (opts?: CrocKnockoutOpts): Promise<TransactionResponse> {
    const chain = (await this.context).chain
    const encoder = new KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, 
      chain.poolIndex)
    const [lowerTick, upperTick] = this.tickRange(chain)
    const surplus = this.maskSurplusFlags(opts)

    const cmd = encoder.encodeKnockoutBurnQty(await this.qty, lowerTick, upperTick, 
      this.sellBase, surplus);
    return (await this.context).dex.userCmd(KNOCKOUT_PATH, cmd)
  }

  async burnLiq (liq: BigNumber, opts?: CrocKnockoutOpts): Promise<TransactionResponse> {
    const chain = (await this.context).chain
    const encoder = new KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, 
      chain.poolIndex)
    const [lowerTick, upperTick] = this.tickRange(chain)
    const surplus = this.maskSurplusFlags(opts)

    const cmd = encoder.encodeKnockoutBurnLiq(roundForConcLiq(liq), lowerTick, upperTick, 
      this.sellBase, surplus);
    return (await this.context).dex.userCmd(KNOCKOUT_PATH, cmd)
  }

  async recoverPost (pivotTime: number, opts?: CrocKnockoutOpts): Promise<TransactionResponse> {
    const chain = (await this.context).chain
    const encoder = new KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, 
      chain.poolIndex)
    const [lowerTick, upperTick] = this.tickRange(chain)
    const surplus = this.maskSurplusFlags(opts)

    const cmd = encoder.encodeKnockoutRecover(pivotTime, lowerTick, upperTick, 
      this.sellBase, surplus);
    return (await this.context).dex.userCmd(KNOCKOUT_PATH, cmd)
  }

  async willMintFail(): Promise<boolean> {
    const gridSize = this.context.then(c => c.chain.gridSize)
    const marketTick = this.context.then(c => c.query.queryCurveTick
      (this.baseToken.tokenAddr, this.quoteToken.tokenAddr, c.chain.poolIndex))
    return this.sellBase ?
      (this.knockoutTick + await gridSize >= await marketTick) :
      (this.knockoutTick - await gridSize <= await marketTick)
  }


  private maskSurplusFlags (opts?: CrocKnockoutOpts): number {
    if (!opts || !opts.surplus) { return encodeSurplusArg(false) }
    else { 
      return encodeSurplusArg(opts.surplus) }
  }

  private async msgVal (surplusFlags: number): Promise<BigNumber> {
    if (this.baseToken.tokenAddr !== AddressZero || !this.sellBase) {
      return BigNumber.from(0)
    }

    const useSurp = decodeSurplusFlag(surplusFlags)[0]
    if (useSurp) {
        return new CrocEthView(this.context).msgValOverSurplus(await this.qty)
    } else {
      return this.qty
    }
  }

  private tickRange (chain: ChainSpec): [number, number] {
    return tickRange(chain, this.knockoutTick, this.sellBase)
  }

  readonly baseToken: CrocTokenView
  readonly quoteToken: CrocTokenView
  readonly qty: Promise<BigNumber>
  readonly sellBase: boolean
  readonly qtyInBase: boolean
  readonly knockoutTick: number
  readonly context: Promise<CrocContext>
}

export interface CrocKnockoutOpts {
  surplus?: CrocSurplusFlags
}

const KNOCKOUT_PATH = 7

async function calcSellQty (buyQty: Promise<BigNumber>, isQtyInBase: boolean, knockoutTick: number,
  context: Promise<CrocContext>): Promise<BigNumber> {
  const sellQty = calcSellFloat(bigNumToFloat(await buyQty), isQtyInBase, knockoutTick, context)
  return sellQty.then(floatToBigNum)
}

async function calcSellFloat (buyQty: number, isQtyInBase: boolean, knockoutTick: number,
  context: Promise<CrocContext>): Promise<number> {
  const [lowerTick, upperTick] = tickRange((await context).chain, knockoutTick, !isQtyInBase)
  const lowerPrice = Math.pow(1.0001, lowerTick)
  const upperPrice = Math.pow(1.0001, upperTick)

  return isQtyInBase ? 
    baseTokenForQuoteConc(buyQty, lowerPrice, upperPrice) :
    quoteTokenForBaseConc(buyQty, lowerPrice, upperPrice)
}

function tickRange (chain: ChainSpec, knockoutTick: number, sellBase: boolean): [number, number] {
  return sellBase ? 
      [knockoutTick, knockoutTick + chain.gridSize] :
      [knockoutTick - chain.gridSize, knockoutTick]
}