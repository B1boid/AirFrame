import {WalletI} from "../../classes/wallet";
import {TxInteraction} from "../../classes/module";
import {ethers} from "ethers-new";
import {Chain} from "../../config/chains";
import erc20 from "./../../abi/erc20.json";
import velocore from "./../../abi/velocore.json";
import {checkAndGetApprovalsInteraction} from "../approvals";
import {globalLogger} from "../../utils/logger";
import {getCurTimestamp, getRandomizedPercent} from "../../utils/utils";



export async function velocoreSwapNativeTo(
    wrappedToken: string,
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
        let routerContract = new ethers.Contract(contracts.velocoreRouter, velocore, provider)
        let tokenBalance: bigint = await provider.getBalance(wallet.getAddress())
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let amountsOutMin: bigint[] = await routerContract.getAmountsOut(tokenBalance.toString(), [[wrappedToken, token, false]])
        let minOut: bigint = amountsOutMin[1] * BigInt(997) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swapExactETHForTokens",
            [minOut, [[wrappedToken, token, false]], wallet.getAddress(), getCurTimestamp() + 1200])
        txs.push({
            to: contracts.velocoreRouter,
            data: data,
            value: tokenBalance.toString(),
            stoppable: stoppable,
            confirmations: 1,
            name: name
        })
        return txs
    } catch (e) {
        globalLogger.connect(wallet.getAddress()).warn(`${name} failed: ${e}`)
        return []
    }
}

export async function velocoreSwap(
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
        let routerContract = new ethers.Contract(contracts.velocoreRouter, velocore, provider)
        let tokenContract = new ethers.Contract(tokenFrom, erc20, provider)
        let tokenBalance: bigint = await tokenContract.balanceOf(wallet.getAddress())
        if (tokenBalance === BigInt(0)){
            globalLogger.connect(wallet.getAddress()).warn(`No balance for ${name}`)
            return []
        }
        if (balancePercent.length > 0) {
            tokenBalance = getRandomizedPercent(tokenBalance, balancePercent[0], balancePercent[1])
        }
        let txs = await checkAndGetApprovalsInteraction(wallet.getAddress(), contracts.velocoreRouter, tokenBalance, tokenContract)
        let amountsOutMin: bigint[] = await routerContract.getAmountsOut(tokenBalance.toString(), [[tokenFrom, tokenTo, false]])
        let minOut: bigint = amountsOutMin[1] * BigInt(997) / BigInt(1000)
        let data = routerContract.interface.encodeFunctionData("swapExactTokensForETH",
            [tokenBalance.toString(), minOut, [[tokenFrom, tokenTo, false]], wallet.getAddress(), getCurTimestamp() + 1200])
        txs.push({
            to: contracts.velocoreRouter,
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