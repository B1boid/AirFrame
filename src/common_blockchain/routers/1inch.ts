import axios from "axios";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther, formatUnits} from "ethers-new";
import {Chain, ethereumChain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import {NATIVE_ADDRESS, QuoteRes} from "./common";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {sleep} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import {ExecBalance, getExecBalance} from "../common_utils";


async function getQuote1inch (chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fromAddress: string): Promise<null | QuoteRes> {
    if (process.env.ONEINCH_API_KEY === undefined) {
        globalLogger.warn(`1inch API key not set`)
        return null
    }
    let slippages = [0.2, 0.3, 0.5]  // 0.2% starting slippage
    let disableEstimate = true
    for (let i = 0; i < slippages.length; i++) {
        let slippage = slippages[i]
        try {
            const result = await axios.get(`https://api.1inch.dev/swap/v5.2/${chainId}/swap`, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + process.env.ONEINCH_API_KEY,
                },
                params: {fromTokenAddress, toTokenAddress, amount, fromAddress, slippage, disableEstimate}
            });
            return {
                tx: result.data.tx.data,
                price: BigInt(result.data.toAmount)
            }
        } catch (error) {
            globalLogger.connect(fromAddress, ethereumChain).warn(`1inch API failed, try: ${i} with error: ${error}`)
            await sleep(5)
        }
    }
    return null
}

export async function oneInchSwapNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    return (await _oneInchSwapNativeTo(token, wallet, chain, contracts, name, execBalance, stoppable, false)) as TxInteraction[]
}

export async function oneInchQuoteNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<bigint> {
    let res = await _oneInchSwapNativeTo(token, wallet, chain, contracts, name, {fullBalance: true}, stoppable, true)
    if (typeof res === "bigint") {
        return res
    }
    return BigInt(0)
}

async function _oneInchSwapNativeTo(
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
        let quoteRes: QuoteRes | null = await getQuote1inch(chain.chainId, NATIVE_ADDRESS, token, tokenBalance.toString(), wallet.getAddress())
        if (quoteRes === null) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`1inch quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        if (onlyPrice) {
            return quoteRes.price
        }
        txs.push({
            to: contracts.oneInchRouter,
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

export async function oneInchSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false
): Promise<TxInteraction[]> {
    return (await _oneInchSwap(tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable, false)) as TxInteraction[]
}

export async function oneInchQuote(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false
): Promise<bigint> {
    let res = await _oneInchSwap(tokenFrom, tokenTo, wallet, chain, contracts, name, {fullBalance: true}, stoppable, true)
    if (typeof res === "bigint") {
        return res
    }
    return BigInt(0)
}

export async function _oneInchSwap(
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
        let quoteRes: QuoteRes | null = await getQuote1inch(chain.chainId, tokenFrom, tokenTo, tokenBalance.toString(), wallet.getAddress())
        if (quoteRes === null) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            let decimals = await tokenContract.decimals()
            logger.warn(`1inch quote for ${name} failed, amount: ${formatUnits(tokenBalance.toString(), decimals)}`)
            return []
        }
        if (onlyPrice) {
            return quoteRes.price
        }
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.oneInchRouter, tokenBalance, tokenContract)
        txs.push({
            to: contracts.oneInchRouter,
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