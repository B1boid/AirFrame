import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {oneInchQuote, oneInchQuoteNativeTo, oneInchSwap, oneInchSwapNativeTo} from "./1inch";
import {Chain} from "../../config/chains";
import {EnumDictionary, shuffleArray} from "../../utils/utils";
import {muteSwap, muteSwapNativeTo} from "./mute";
import {Asset} from "../../config/tokens";
import {syncSwap, syncSwapNativeTo} from "./syncswap";
import {velocoreSwap, velocoreSwapNativeTo} from "./velocore";
import {spaceFiSwap, spaceFiSwapNativeTo} from "./spacefi";
import {odosQuote, odosQuoteNativeTo, odosSwap, odosSwapNativeTo} from "./odos";
import {ExecBalance} from "../common_utils";
import {globalLogger} from "../../utils/logger";
import {lifiQuote, lifiQuoteNativeTo, lifiSwap, lifiSwapNativeTo} from "./lifi";

export enum Dexes {
    OneInch = "1inch",
    Odos = "odos",
    Lifi = "lifi",
    Mute = "mute",
    SyncSwap = "syncswap",
    Velocore = "velocore",
    SpaceFi = "spacefi"
}

export interface QuoteRes {
    tx: string,
    price: bigint
}

export const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"


export async function commonTopSwap(
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
    if (tokenFrom === NATIVE_ADDRESS) {
        let promises: (Promise<bigint>)[] = []
        if (dexes.includes(Dexes.OneInch)) {
            promises.push(oneInchQuoteNativeTo(
                tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            ))
        }
        if (dexes.includes(Dexes.Odos)) {
            promises.push(odosQuoteNativeTo(
                tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            ))
        }
        if (dexes.includes(Dexes.Lifi)) {
            promises.push(lifiQuoteNativeTo(
                tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            ))
        }
        let values: bigint[] = await Promise.all(promises)
        globalLogger.connect(wallet.getAddress(), chain).info("Top quotes: "+ values)
        if (values[0] >= values[1] && values[0] >= values[2]){
            if (values[0] === BigInt(0)) {
                return []
            }
            return await oneInchSwapNativeTo(
                tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            )
        } else if (values[1] >= values[0] && values[1] >= values[2]){
            return await odosSwapNativeTo(
                tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            )
        } else {
            return await lifiSwapNativeTo(
                tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            )
        }
    } else {
        let promises: (Promise<bigint>)[] = []
        if (dexes.includes(Dexes.OneInch)) {
            promises.push(oneInchQuote(
                tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            ))
        }
        if (dexes.includes(Dexes.Odos)) {
            promises.push(odosQuote(
                tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            ))
        }
        if (dexes.includes(Dexes.Lifi)) {
            promises.push(lifiQuote(
                tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            ))
        }
        let values: bigint[] = await Promise.all(promises)
        globalLogger.connect(wallet.getAddress(), chain).info("Top quotes: "+ values)
        if (values[0] >= values[1] && values[0] >= values[2]){
            if (values[0] === BigInt(0)) {
                return []
            }
            return await oneInchSwap(
                tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            )
        } else if (values[1] >= values[0] && values[1] >= values[2]){
            return await odosSwap(
                tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            )
        } else {
            return await lifiSwap(
                tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
            )
        }
    }
}

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
        } else if (dex === Dexes.Lifi) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await lifiSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else {
                res = await lifiSwap(
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