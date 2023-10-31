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
import {ambientSwap, ambientSwapNativeTo} from "./ambient";

export enum Dexes {
    OneInch = "1inch",
    Odos = "odos",
    Lifi = "lifi",
    Mute = "mute",
    SyncSwap = "syncswap",
    Velocore = "velocore",
    SpaceFi = "spacefi",
    Ambient = "ambient"
}

export interface DexPrice{
    dex: Dexes,
    price: BigInt
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
        let promises: (Promise<DexPrice>)[] = []
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
        let values: DexPrice[] = await Promise.all(promises)
        values.sort(
            function(a: DexPrice, b: DexPrice){
                return a.price > b.price ? -1 : 1;
            }
        )
        let quotesMsg = ""
        for (let q of values){
            quotesMsg += q.dex + ":" + q.price.toString() + " | "
        }
        globalLogger.connect(wallet.getAddress(), chain).info("Top quotes: "+ quotesMsg)
        for (let v of values){
            if (v.price === BigInt(0)){
                return []
            }
            if (v.dex === Dexes.OneInch){
                return await oneInchSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
            if (v.dex === Dexes.Odos){
                return await odosSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
            if (v.dex === Dexes.Lifi){
                return await lifiSwapNativeTo(
                    tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        }
        return []
    } else {
        let promises: (Promise<DexPrice>)[] = []
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
        let values: DexPrice[] = await Promise.all(promises)
        values.sort(
            function(a: DexPrice, b: DexPrice){
                return a.price > b.price ? -1 : 1;
            }
        )
        globalLogger.connect(wallet.getAddress(), chain).info("Top quotes: "+ values)
        for (let v of values){
            if (v.price === BigInt(0)){
                return []
            }
            if (v.dex === Dexes.OneInch){
                return await oneInchSwap(
                    tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
            if (v.dex === Dexes.Odos){
                return await odosSwap(
                    tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
            if (v.dex === Dexes.Lifi){
                return await lifiSwap(
                    tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            }
        }
        return []
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
        } else if (dex === Dexes.Ambient) {
            if (tokenFrom === NATIVE_ADDRESS) {
                res = await ambientSwapNativeTo(
                    tokens.WETH, tokenTo, wallet, chain, contracts, name, execBalance, stoppable
                )
            } else if (tokenTo === NATIVE_ADDRESS) {
                res = await ambientSwap(
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