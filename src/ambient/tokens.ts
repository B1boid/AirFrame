import { CrocContext } from "./context";
import { Contract, BigNumber, ethers } from "ethers";
import { TransactionResponse } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
import { MAX_LIQ } from "./constants";
import { toDisplayQty, fromDisplayQty } from "./utils/token";

// Convention where token quantities can be repesented either as BigNumbers, indicating that it's
// the full wei value. *OR* can be represented as strings/numbers, indicating that the quantity
// represents a decimal norm'ed value. E.g. 1 ETH could either be 1.0, "1.0" or BigNumber(10).pow(10)
export type TokenQty = BigNumber | string | number;

export class CrocTokenView {
  constructor(context: Promise<CrocContext>, tokenAddr: string) {
    this.context = context;
    this.tokenAddr = tokenAddr;
    this.isNativeEth = tokenAddr == AddressZero;
    if (this.isNativeEth) {
      this.decimals = Promise.resolve(18);
    } else {
      this.decimals = this.resolve().then((c) => c.decimals());
    }
  }

  async approve(): Promise<TransactionResponse | undefined> {
    if (this.isNativeEth) {
      return undefined;
    }
    const weiQty = BigNumber.from(2).pow(120); // Lots of 0 bytes in calldata to save gas

    // We want to hardcode the gas limit, so we can manually pad it from the estimated
    // transaction. The default value is low gas calldata, but Metamask and other wallets
    // will often ask users to change the approval amount. Without the padding, approval
    // transactions can run out of gas.
    const gasEst = (await this.resolveWrite()).estimateGas.approve(
      (await this.context).dex.address,
      weiQty
    );

    return (await this.resolveWrite()).approve(
      (await this.context).dex.address,
      weiQty, { gasLimit: (await gasEst).add(2000)}
    );
  }

  async wallet (address: string): Promise<BigNumber> {
    if (this.isNativeEth) {
      return (await this.context).provider.getBalance(address);
    } else {
      return (await this.resolve()).balanceOf(address);
    }
  }

  async walletDisplay (address: string): Promise<string> {
    const balance = this.wallet(address);
    return toDisplayQty(await balance, await this.decimals);
  }

  async balance (address: string): Promise<BigNumber> {
    return (await this.context).query.querySurplus(address, this.tokenAddr)
  }

  async balanceDisplay (address: string): Promise<string> {
    const balance = this.balance(address);
    return toDisplayQty(await balance, await this.decimals);
  }

  async allowance(address: string): Promise<BigNumber> {
    if (this.isNativeEth) {
      return MAX_LIQ;
    }
    return (await this.resolve()).allowance(
      address,
      (await this.context).dex.address
    );
  }

  async roundQty (qty: TokenQty): Promise<BigNumber> {
    if (typeof qty === "number" || typeof qty === "string") {
      return this.normQty(this.truncFraction(qty, await this.decimals))
    } else {
      return qty;
    }
  }

  private truncFraction (qty: string | number, decimals: number): number {
    if (typeof(qty) === "number") {
      let exp = Math.pow(10, decimals)
      return Math.floor(qty * exp) / exp
    } else {
      return this.truncFraction(parseFloat(qty), decimals)
    }
  }

  async normQty(qty: TokenQty): Promise<BigNumber> {
    if (typeof qty === "number" || typeof qty === "string") {
      return fromDisplayQty(qty.toString(), await this.decimals);
    } else {
      return qty;
    }
  }

  async toDisplay(qty: TokenQty): Promise<string> {
    if (typeof qty === "number" || typeof qty === "string") {
      return qty.toString();
    } else {
      return toDisplayQty(qty, await this.decimals);
    }
  }

  private async resolve(): Promise<Contract> {
    return (await this.context).erc20Read.attach(this.tokenAddr);
  }

  private async resolveWrite(): Promise<Contract> {
    return (await this.context).erc20Write.attach(this.tokenAddr);
  }

  async deposit (qty: TokenQty, recv: string): Promise<TransactionResponse> {
    return this.surplusOp(73, qty, recv, this.isNativeEth)
  }

  async withdraw (qty: TokenQty, recv: string): Promise<TransactionResponse> {
    return this.surplusOp(74, qty, recv)
  }

  async transfer (qty: TokenQty, recv: string): Promise<TransactionResponse> {
    return this.surplusOp(75, qty, recv)
  }

  private async surplusOp (subCode: number, qty: TokenQty, recv: string, 
    useMsgVal: boolean = false): Promise<TransactionResponse> {
      const abiCoder = new ethers.utils.AbiCoder()
      const weiQty = this.normQty(qty)
      const cmd = abiCoder.encode(["uint8", "address", "uint128", "address"],
        [subCode, recv, await weiQty, this.tokenAddr])
  
      const txArgs = useMsgVal ? { value: await weiQty } : { }
      let cntx = await this.context
      return cntx.dex.userCmd(cntx.chain.proxyPaths.cold, cmd, txArgs)
  
  }

  readonly tokenAddr: string;
  readonly context: Promise<CrocContext>;
  readonly decimals: Promise<number>;
  readonly isNativeEth: boolean;
}

export class CrocEthView extends CrocTokenView {
  constructor (context: Promise<CrocContext>) {
    super(context, AddressZero)
  }

  /* Returns the amount needed to attach to msg.value when spending
   * ETH from surplus collateral. (I.e. the difference between the
   * two, or 0 if surplus collateral is sufficient) */
  async msgValOverSurplus (ethNeeded: BigNumber): Promise<BigNumber> {
    const sender = (await this.context).senderAddr

    if (!sender) {
      console.warn("No sender address known, returning 0")
      return BigNumber.from(0)
    }

    const ethView = new CrocTokenView(this.context, AddressZero)
    const surpBal = await ethView.balance(sender)

    const hasEnough = surpBal.gt(ethNeeded)
    return hasEnough ? BigNumber.from(0) :
      ethNeeded.sub(surpBal)
  }
} 

export function sortBaseQuoteViews (tokenA: CrocTokenView, tokenB: CrocTokenView): 
  [CrocTokenView, CrocTokenView] {
  return tokenA.tokenAddr.toLowerCase() < tokenB.tokenAddr.toLowerCase() ?
    [tokenA, tokenB] : [tokenB, tokenA]
}
