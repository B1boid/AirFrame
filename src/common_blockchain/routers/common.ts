import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {oneInchSwap, oneInchSwapNativeTo} from "./1inch";
import {Chain} from "../../config/chains";
import {EnumDictionary, shuffleArray} from "../../utils/utils";
import {muteSwap, muteSwapNativeTo} from "./mute";
import {Asset} from "../../config/tokens";
import {syncSwap, syncSwapNativeTo} from "./syncswap";
import {velocoreSwap, velocoreSwapNativeTo} from "./velocore";
import {spaceFiSwap, spaceFiSwapNativeTo} from "./spacefi";
import {odosSwap, odosSwapNativeTo} from "./odos";
import {ExecBalance} from "../common_utils";

export enum Dexes {
    OneInch = "1inch",
    Odos = "odos",
    Mute = "mute",
    SyncSwap = "syncswap",
    Velocore = "velocore",
    SpaceFi = "spacefi"
}

export const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

export async function commonSwap(
    tokenFrom: string,
    tokenTo: string,
    execBalance: ExecBalance = {fullBalance: true},
    dexes: Dexes[],
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    tokens: EnumDictionary<Asset, string>,
    name: string,
    stoppable: boolean = false
): Promise<TxInteraction[]> {
    shuffleArray(dexes)
    let res: TxInteraction[] = []
    for (let dex of dexes) {
        if (dex === Dexes.OneInch) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await oneInchSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else {
                res = await oneInchSwap(
                    tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        } else if (dex === Dexes.Odos) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await odosSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else if (tokenTo === NATIVE_ADDRESS) {
                res = await odosSwap(
                    tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        } else if (dex === Dexes.Mute) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await muteSwapNativeTo(
                    tokens.WETH, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else if (tokenTo === NATIVE_ADDRESS) {
                res = await muteSwap(
                    tokenFrom, tokens.WETH, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        } else if (dex === Dexes.SyncSwap) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await syncSwapNativeTo(
                    tokens.WETH, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else if (tokenTo === NATIVE_ADDRESS) {
                res = await syncSwap(
                    tokenFrom, tokens.WETH, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        } else if (dex === Dexes.Velocore) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await velocoreSwapNativeTo(
                    tokens.WETH, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else if (tokenTo === NATIVE_ADDRESS) {
                res = await velocoreSwap(
                    tokenFrom, tokens.WETH, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        } else if (dex === Dexes.SpaceFi) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await spaceFiSwapNativeTo(
                    tokens.WETH, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else if (tokenTo === NATIVE_ADDRESS) {
                res = await spaceFiSwap(
                    tokenFrom, tokens.WETH, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        }
        if (res.length > 0) break
    }
    return res
}