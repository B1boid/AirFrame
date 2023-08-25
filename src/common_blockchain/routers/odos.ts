import axios from "axios";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther} from "ethers-new";
import {Chain, ethereumChain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {formatIfNativeToken, sleep} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import {NATIVE_ADDRESS, QuoteRes} from "./common";
import {ExecBalance, getExecBalance} from "../common_utils";


async function getQuoteOdos (chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fromAddress: string): Promise<null | QuoteRes> {
    let slippages = [0.2, 0.3, 0.5]  // 0.2% starting slippage
    for (let i = 0; i < slippages.length; i++) {
        try {
            const result = await axios.post(`https://api.odos.xyz/sor/quote/v2`,{
                chainId: chainId,
                inputTokens: [
                    {
                        tokenAddress: formatIfNativeToken(fromTokenAddress),
                        amount: amount
                    }
                ],
                outputTokens: [
                    {
                        tokenAddress: formatIfNativeToken(toTokenAddress),
                        amount: 1
                    }
                ],
                userAddr: fromAddress,
                slippageLimitPercent: slippages[i],
                referralCode: 0,
                compact: true,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return {
                tx: result.data.pathId,
                price: BigInt(result.data.outAmounts[0])
            }
        } catch (error) {
            globalLogger.connect(fromAddress, ethereumChain).warn(`Odos quote-API failed, try: ${i} with error: ${error}`)
            await sleep(5)
        }
    }
    return null
}

async function getSwapOdos(quoteId: string, userAddr: string): Promise<null | string> {
    for (let i = 0; i < 3; i++) {
        try {
            const result = await axios.post(`https://api.odos.xyz/sor/assemble`,{
                userAddr: userAddr,
                pathId: quoteId,
                simulate: false,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return result.data.transaction.data
        } catch (error) {
            globalLogger.connect(userAddr, ethereumChain).warn(`Odos swap-API failed, try: ${i} with error: ${error}`)
            await sleep(5)
        }
    }
    return null
}

export async function odosSwapNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    return (await _odosSwapNativeTo(token, wallet, chain, contracts, name, execBalance, stoppable, false)) as TxInteraction[]
}


export async function odosQuoteNativeTo(
    token: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<bigint> {
    let res = await _odosSwapNativeTo(token, wallet, chain, contracts, name, {fullBalance: true}, stoppable, true)
    if (typeof res === "bigint") {
        return res
    }
    return BigInt(0)
}

async function _odosSwapNativeTo(
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
        let quoteRes: QuoteRes | null = await getQuoteOdos(chain.chainId, NATIVE_ADDRESS, token, tokenBalance.toString(), wallet.getAddress())
        if (quoteRes === null || quoteRes === undefined) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`Odos quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        if (onlyPrice) {
            return quoteRes.price
        }
        let swapData = await getSwapOdos(quoteRes.tx, wallet.getAddress())
        if (swapData === null || swapData === undefined) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`Odos swap for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }

        txs.push({
            to: contracts.odosRouter,
            data: swapData,
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


export async function odosSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    return (await _odosSwap(tokenFrom, tokenTo, wallet, chain, contracts, name, execBalance, stoppable, false)) as TxInteraction[]
}


export async function odosQuote(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    execBalance: ExecBalance = {fullBalance: true},
    stoppable: boolean = false,
): Promise<bigint> {
    let res = await _odosSwap(tokenFrom, tokenTo, wallet, chain, contracts, name, {fullBalance: true}, stoppable, true)
    if (typeof res === "bigint") {
        return res
    }
    return BigInt(0)
}


async function _odosSwap(
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
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.odosRouter, tokenBalance, tokenContract)
        let quoteRes: QuoteRes | null = await getQuoteOdos(chain.chainId, tokenFrom, tokenTo, tokenBalance.toString(), wallet.getAddress())
        if (quoteRes === null || quoteRes === undefined) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`Odos quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        if (onlyPrice) {
            return quoteRes.price
        }
        let swapData = await getSwapOdos(quoteRes.tx, wallet.getAddress())
        if (swapData === null || swapData === undefined) {
            let logger = globalLogger.connect(wallet.getAddress(), chain)
            logger.warn(`Odos swap for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }

        txs.push({
            to: contracts.odosRouter,
            data: swapData,
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