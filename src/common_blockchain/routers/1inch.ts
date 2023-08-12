import axios from "axios";
import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers, formatEther, formatUnits} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import {NATIVE_ADDRESS} from "./common";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {getRandomizedPercent, sleep} from "../../utils/utils";
import {globalLogger} from "../../utils/logger";


export async function getQuote1inch (chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fromAddress: string): Promise<null | string> {
    let slippages = [0.1, 0.2, 0.5]  // 0.1% starting slippage
    let logger = globalLogger.connect(fromAddress)
    let disableEstimate = true
    for (let i = 0; i < slippages.length; i++) {
        let slippage = slippages[i]
        try {
            const result = await axios.get(`https://api.1inch.io/v5.0/${chainId}/swap`, {
                params: {fromTokenAddress, toTokenAddress, amount, fromAddress, slippage, disableEstimate}
            });
            return result.data.tx.data
        } catch(error) {
            logger.warn(`1inch API failed, try: ${i}`)
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
    balancePercent: number[] = [],
    stoppable: boolean = false,
): Promise<TxInteraction[]> {
    try {
        let txs = []
        const provider = new ethers.JsonRpcProvider(chain.nodeUrl, chain.chainId)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let data = await getQuote1inch(chain.chainId, NATIVE_ADDRESS, token, tokenBalance.toString(), wallet.getAddress())
        if (data === null) {
            let logger = globalLogger.connect(wallet.getAddress())
            logger.warn(`1inch quote for ${name} failed, amount: ${formatEther(tokenBalance)}`)
            return []
        }
        txs.push({
            to: contracts.oneInchRouter,
            data: data,
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

export async function oneInchSwap(
    tokenFrom: string,
    tokenTo: string,
    wallet: WalletI,
    chain: Chain,
    contracts: { [id: string]: string },
    name: string,
    balancePercent: number[] = [],
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
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.oneInchRouter, tokenBalance, tokenContract)
        let data = await getQuote1inch(chain.chainId, tokenFrom, tokenTo, tokenBalance.toString(), wallet.getAddress())
        if (data === null) {
            let logger = globalLogger.connect(wallet.getAddress())
            let decimals = await tokenContract.decimals()
            logger.warn(`1inch quote for ${name} failed, amount: ${formatUnits(tokenBalance.toString(), decimals)}`)
            return []
        }
        txs.push({
            to: contracts.oneInchRouter,
            data: data,
            value: "0",
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