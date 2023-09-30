import axios from "axios";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther, formatUnits} from "ethers-new";
import {Chain, ethereumChain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import {NATIVE_ADDRESS, QuoteRes} from "./common";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {formatIfNativeToken, sleep} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import {ExecBalance, getExecBalance} from "../common_utils";


const chainIdToLiFi: {[key: number]: string} = {
    1: "eth",
    137: "pol",
    42161: "arb",
    10: "opt",
    56: "bsc",
    324: "era"
}

async function getQuoteLifi (chainId: number, fromToken: string, toToken: string, fromAmount: string, fromAddress: string): Promise<null | QuoteRes> {
    let slippages = [0.2, 0.3, 0.5]  // 0.2% starting slippage
    const fromChain = chainIdToLiFi[chainId]
    const toChain = chainIdToLiFi[chainId]
    for (let i = 0; i < slippages.length; i++) {
        let slippage = slippages[i]
        try {
            const result = await axios.get(`https://li.quest/v1/quote`, {
                params: {fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, slippage}
            });
            return {
                tx: result.data.transactionRequest.data,
                price: BigInt(result.data.estimate.toAmount)
            }
        } catch (error) {
            globalLogger.connect(fromAddress, ethereumChain).warn(`lifi API failed, try: ${i} with error: ${error}`)
            await sleep(5)
        }
    }
    return null
}

export async function lifiSwapNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    return (await _lifiSwapNativeTo(token, wallet, chain, contracts, name, execBalance, stoppable, false)) as TxInteraction[]
}

export async function lifiQuoteNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<bigint> {
    let res = await _lifiSwapNativeTo(token, wallet, chain, contracts, name, {fullBalance: true}, stoppable, true)
    if (typeof res === "bigint") {
        return res
    }
    return BigInt(0)
}

async function _lifiSwapNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
    onlyPrice: boolean = false,
): Promise<TxInteraction[] | bigint> {
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let quoteRes: QuoteRes | null = await getQuoteLifi(chain.chainId, NATIVE_ADDRESS, token, tokenBalance.toString(), wallet.getAddress())
        if (quoteRes === null) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`lifi quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        if (onlyPrice) {
            return quoteRes.price
        }
        txs.push({
            to: contracts.lifiRouter,
            data: quoteRes.tx,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        let logger = globalLogger.connect(wallet.getAddress(), chain)
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}

export async function lifiSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false
): Promise<TxInteraction[]> {
    return (await _lifiSwap(tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable, false)) as TxInteraction[]
}

export async function lifiQuote(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false
): Promise<bigint> {
    let res = await _lifiSwap(tokenFrom, tokenTo, wallet, chain, contracts, name, {fullBalance: true}, stoppable, true)
    if (typeof res === "bigint") {
        return res
    }
    return BigInt(0)
}

export async function _lifiSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
    onlyPrice: boolean = false,
): Promise<TxInteraction[] | bigint> {
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`No balance for ${name}`)
            return []
        }
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let quoteRes: QuoteRes | null = await getQuoteLifi(chain.chainId, tokenFrom, tokenTo, tokenBalance.toString(), wallet.getAddress())
        if (quoteRes === null) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            let decimals = await tokenContract.decimals()
            logger.warn(`lifi quote for ${name} failed, amount: ${formatUnits(tokenBalance.toString(), decimals)}`)
            return []
        }
        if (onlyPrice) {
            return quoteRes.price
        }
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.lifiRouter, tokenBalance, tokenContract)
        txs.push({
            to: contracts.lifiRouter,
            data: quoteRes.tx,
            value: "0",
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        let logger = globalLogger.connect(wallet.getAddress(), chain)
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}