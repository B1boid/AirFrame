import { BigNumberish, ethers } from "ethers";

export class KnockoutEncoder {
    constructor(base: string, quote: string, poolIdx: number) {
        this.base = base;
        this.quote = quote;
        this.poolIdx = poolIdx;
        this.abiCoder = new ethers.utils.AbiCoder();
    }
    
    private base: string;
    private quote: string;
    private poolIdx: number;
    private abiCoder: ethers.utils.AbiCoder;

    encodeKnockoutMint (qty: BigNumberish, lowerTick:number, upperTick: number,
        isBid: boolean, useSurplusFlags: number): string {
        const MINT_SUBCMD = 91
        const suppArgs = this.abiCoder.encode(["uint128", "bool"], [qty, false])
        return this.encodeCommonArgs(MINT_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs)
    }

    encodeKnockoutBurnQty (qty: BigNumberish, lowerTick:number, upperTick: number,
        isBid: boolean, useSurplusFlags: number): string {
        const BURN_SUBCMD = 92
        const suppArgs = this.abiCoder.encode(["uint128", "bool", "bool"], [qty, false, false])
        return this.encodeCommonArgs(BURN_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs)
    }

    encodeKnockoutBurnLiq (liq: BigNumberish, lowerTick:number, upperTick: number,
        isBid: boolean, useSurplusFlags: number): string {
        const BURN_SUBCMD = 92
        const suppArgs = this.abiCoder.encode(["uint128", "bool", "bool"], [liq, true, false])
        return this.encodeCommonArgs(BURN_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs)
    }

    encodeKnockoutRecover (pivotTime: number, lowerTick:number, upperTick: number,
        isBid: boolean, useSurplusFlags: number): string {
        const BURN_SUBCMD = 94
        const suppArgs = this.abiCoder.encode(["uint32"], [pivotTime])
        return this.encodeCommonArgs(BURN_SUBCMD, lowerTick, upperTick, isBid, useSurplusFlags, suppArgs)
    }

    private encodeCommonArgs (subcmd: number, lowerTick:number, upperTick: number,
        isBid: boolean, useSurplusFlags: number, suppArgs: string): string {
        return this.abiCoder.encode(KNOCKOUT_ARG_TYPES, 
            [subcmd, this.base, this.quote, this.poolIdx, 
                lowerTick, upperTick, isBid, 
                useSurplusFlags, suppArgs])
    }
}

const KNOCKOUT_ARG_TYPES = [
    "uint8", // Type call
    "address", // Base
    "address", // Quote
    "uint24", // Pool Index
    "int24", // Lower Tick
    "int24", // Upper Tick
    "bool", // isBid
    "uint8", // reserve flags
    "bytes", // subcmd args
  ];