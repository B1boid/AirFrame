import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {polygonContracts, polygonTokens} from "./constants";
import {ethers} from "ethers-new";
import wrapped from "./../../abi/wrapped.json";
import {polygonChain} from "../../config/chains";
import {getRandomizedPercent} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import {commonSwap, Dexes} from "../../common_blockchain/routers/common";

let tokens = polygonTokens
let chain = polygonChain
let contracts = polygonContracts


export async function polygonWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [30, 50] // from 30% to 50%
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: tokens.WMATIC,
            data: "0xd0e30db0",
            value: tokenBalance.toString(),
            stoppable: false, // if wrap failed - it's fine, we can continue another activities
            confirmations: 1,
            name: "polygonWrapUnwrap_wrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), polygonChain).warn(`polygonWrapUnwrap_wrap failed: ${e}`)
        return []
    }
}

export async function polygonWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokens.WMATIC, wrapped, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        let data: string = tokenContract.interface.encodeFunctionData("withdraw", [tokenBalance])
        return [{
            to: tokens.WMATIC,
            data: data,
            value: "0",
            stoppable: true, // if unwrap failed - we have remaining wrapped tokens, so we need to stop
            confirmations: 1,
            name: "polygonWrapUnwrap_unwrap"
        }]
    } catch (e) {
        globalLogger.connect(wallet.getAddress(), polygonChain).warn(`polygonWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}

export async function polygonSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.MATIC, tokens.USDC, {balancePercent: [20, 40]}, [Dexes.OneInch],
        wallet, chain, contracts, tokens, "polygonSwapCycleNativeToUsdc_swapto")
}

export async function polygonSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.MATIC, {fullBalance: true}, [Dexes.OneInch],
        wallet, chain, contracts, tokens, "polygonSwapCycleNativeToUsdc_swapback")
}