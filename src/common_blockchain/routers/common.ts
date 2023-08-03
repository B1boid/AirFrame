import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {oneInchSwap, oneInchSwapNativeTo} from "./1inch";
import {Chain} from "../../config/chains";
import {shuffleArray} from "../../utils/utils";

export enum Dexes {
    OneInch = "1inch"
}

export const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

export async function commonSwap(
    tokenFrom: string,
    tokenTo: string,
    balancePercent: number[],
    dexes: Dexes[],
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string
): Promise<TxInteraction[]> {
    shuffleArray(dexes)
    let res: TxInteraction[] = []
    for (let dex of dexes){
        if (dex === Dexes.OneInch){
            if (tokenFrom === NATIVE_ADDRESS){
                res = await oneInchSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, balancePercent
                )
            } else {
                res = await oneInchSwap(
                    tokenFrom, tokenTo, wallet, chain, contracts, name, balancePercent
                )
            }
        }
        if (res.length > 0) break
    }
    return res
}