import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {oneInchSwap, oneInchSwapNativeTo} from "./1inch";
import {Chain} from "../../config/chains";
import {EnumDictionary, shuffleArray} from "../../utils/utils";
import {muteSwap, muteSwapNativeTo} from "./mute";
import {Asset} from "../../config/tokens";

export enum Dexes {
    OneInch = "1inch",
    Mute = "mute"
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
    tokens: EnumDictionary<Asset, string>,
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
        } else if (dex === Dexes.Mute){
            if (tokenFrom === NATIVE_ADDRESS){
                res = await muteSwapNativeTo(
                    tokens.WETH, tokenTo, wallet, chain, contracts, name, balancePercent
                )
            } else if (tokenTo === NATIVE_ADDRESS){
                res = await muteSwap(
                    tokenFrom, tokens.WETH, wallet, chain, contracts, name, balancePercent
                )
            }
        }
        if (res.length > 0) break
    }
    return res
}