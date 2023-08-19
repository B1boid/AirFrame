import axios from "axios";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {formatIfNativeToken, getRandomizedPercent, sleep} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";
import {NATIVE_ADDRESS} from "./common";
import {ExecBalance, getExecBalance} from "../common_utils";


async function getQuoteOdos (chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fromAddress: string): Promise<null | string> {
    let slippages = [0.2, 0.3, 0.5]  // 0.1% starting slippage
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
            return result.data.pathId
        } catch (error) {
            globalLogger.connect(fromAddress).warn(`Odos quote-API failed, try: ${i} with error: ${error}`)
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
            globalLogger.connect(userAddr).warn(`Odos swap-API failed, try: ${i} with error: ${error}`)
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
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let pathId = await getQuoteOdos(chain.chainId, NATIVE_ADDRESS, token, tokenBalance.toString(), wallet.getAddress())
        if (pathId === null || pathId === undefined) {
            let logger = globalLogger.connect(wallet.getAddress())
            logger.warn(`Odos quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        let swapData = await getSwapOdos(pathId, wallet.getAddress())
        if (swapData === null || swapData === undefined) {
            let logger = globalLogger.connect(wallet.getAddress())
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
        let logger = globalLogger.connect(wallet.getAddress())
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
    try {
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            let logger = globalLogger.connect(wallet.getAddress())
            logger.warn(`No balance for ${name}`)
            return []
        }
        tokenBalance = getExecBalance(execBalance, tokenBalance)!
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.odosRouter, tokenBalance, tokenContract)
        let pathId = await getQuoteOdos(chain.chainId, tokenFrom, tokenTo, tokenBalance.toString(), wallet.getAddress())
        if (pathId === null || pathId === undefined) {
            let logger = globalLogger.connect(wallet.getAddress())
            logger.warn(`Odos quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        let swapData = await getSwapOdos(pathId, wallet.getAddress())
        if (swapData === null || swapData === undefined) {
            let logger = globalLogger.connect(wallet.getAddress())
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
        let logger = globalLogger.connect(wallet.getAddress())
        logger.warn(`${name} failed: ${e}`)
        return []
    }
}