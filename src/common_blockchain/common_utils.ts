import {parseEther} from "ethers-new";
import {getRandomizedPercent} from "../utils/utils";

export interface ExecBalance {
    fullBalance?: boolean,
    fixBalance?: number,
    balancePercent?: number[]
}

export function getExecBalance (balance: ExecBalance, fullBalance: bigint): bigint | null {
    if (balance.fullBalance !== undefined && balance.fullBalance){
        return fullBalance
    }
    if (balance.fixBalance !== undefined && balance.fixBalance){
        return  parseEther(balance.fixBalance.toString())
    }
    if (balance.balancePercent !== undefined && balance.balancePercent) {
        return getRandomizedPercent(fullBalance, balance.balancePercent[0], balance.balancePercent[1])
    }
    return null
}