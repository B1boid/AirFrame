import {TxInteraction} from "../../classes/module";
import {WalletI} from "../../classes/wallet";
import {getRandomizedPercent} from "../../utils/utils";
import {ConsoleLogger} from "../../utils/logger";
import wrapped from "../../abi/wrapped.json";
import {commonSwap, Dexes} from "../../common_blockchain/routers/common";
import {zkSyncChain} from "../../config/chains";
import {zkSyncContracts, zkSyncTokens} from "./constants";
import {ethers} from "ethers-new";


let tokens = zkSyncTokens
let chain = zkSyncChain
let contracts = zkSyncContracts


export async function zkSyncWrapUnwrap_wrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        let balancePercent = [30, 50] // from 30% to 50%
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        return [{
            to: tokens.WETH,
            data: "0xd0e30db0",
            value: tokenBalance.toString(),
            stoppable: false, // if wrap failed - it's fine, we can continue another activities
            confirmations: 1,
            name: "zkSyncWrapUnwrap_wrap"
        }]
    } catch (e) {
        let logger = new ConsoleLogger(wallet.getAddress())
        logger.warn(`zkSyncWrapUnwrap_wrap failed: ${e}`)
        return []
    }
}

export async function zkSyncWrapUnwrap_unwrap(wallet: WalletI): Promise<TxInteraction[]> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokens.WETH, wrapped, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        let data: string = tokenContract.interface.encodeFunctionData("withdraw", [tokenBalance])
        return [{
            to: tokens.WETH,
            data: data,
            value: "0",
            stoppable: true, // if unwrap failed - we have remaining wrapped tokens, so we need to stop
            confirmations: 1,
            name: "zkSyncWrapUnwrap_unwrap"
        }]
    } catch (e) {
        let logger = new ConsoleLogger(wallet.getAddress())
        logger.warn(`zkSyncWrapUnwrap_unwrap failed: ${e}`)
        return []
    }
}

export async function zkSyncSwapCycleNativeToUsdc_swapto(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.ETH, tokens.USDC, [20, 40], [Dexes.OneInch],
        wallet, chain, contracts, "zkSyncSwapCycleNativeToUsdc_swapto")
}

export async function zkSyncSwapCycleNativeToUsdc_swapback(wallet: WalletI): Promise<TxInteraction[]> {
    return await commonSwap(tokens.USDC, tokens.ETH, [], [Dexes.OneInch],
        wallet, chain, contracts, "zkSyncSwapCycleNativeToUsdc_swapback")
}